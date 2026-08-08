import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  CartItem,
  ClickstreamEvent,
  Product,
  PredictResponse,
  RecommendResponse,
  RealtimeSessionPayload,
  SessionMetricsPayload,
  BackendHealthResponse
} from '../types';
import { checkHealth, getRecommendation, predictRisk } from '../services/api';

interface CartSessionContextType {
  sessionId: string;
  resetSession: () => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartValue: number;
  totalCartItems: number;
  events: ClickstreamEvent[];
  logEvent: (eventType: string, details: string, path?: string, extraData?: Record<string, any>) => void;
  sessionStartTime: number;
  prediction: PredictResponse | null;
  recommendation: RecommendResponse | null;
  realtimePayload: RealtimeSessionPayload | null;
  isWsConnected: boolean;
  isAnalyzing: boolean;
  runAIPrediction: () => Promise<RecommendResponse | null>;
  backendStatus: BackendHealthResponse | null;
  refreshHealthStatus: () => Promise<void>;
  getActiveSessionPayload: () => SessionMetricsPayload;
}

const CartSessionContext = createContext<CartSessionContextType | undefined>(undefined);

const generateSessionId = () => `S100${Math.floor(100 + Math.random() * 900)}`;

export const CartSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string>(() => generateSessionId());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [events, setEvents] = useState<ClickstreamEvent[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendResponse | null>(null);
  const [realtimePayload, setRealtimePayload] = useState<RealtimeSessionPayload | null>(null);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<BackendHealthResponse | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // Health check on mount
  const refreshHealthStatus = useCallback(async () => {
    const health = await checkHealth();
    setBackendStatus(health);
  }, []);

  useEffect(() => {
    refreshHealthStatus();
  }, [refreshHealthStatus]);

  // Establish Phase 7 Real-Time WebSocket Connection
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const host = baseUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${host}/ws/session/${sessionId}`;

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`[WebSocket] Connected to /ws/session/${sessionId}`);
        setIsWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload: RealtimeSessionPayload = JSON.parse(event.data);
          setRealtimePayload(payload);

          // Update recommendation state from WebSocket response
          if (payload.risk_score !== undefined) {
            const riskLevel = payload.risk_score >= 0.7 ? 'High' : payload.risk_score >= 0.4 ? 'Medium' : 'Low';
            setPrediction({
              session_id: payload.session_id,
              abandonment_probability: payload.abandonment_probability,
              purchase_probability: payload.purchase_probability,
              risk_score: payload.risk_score,
              risk_level: riskLevel,
              confidence: payload.confidence || 0.95
            });

            setRecommendation({
              session_id: payload.session_id,
              risk_score: payload.risk_score,
              purchase_probability: payload.purchase_probability,
              abandonment_probability: payload.abandonment_probability,
              confidence: payload.confidence || 0.95,
              reason: payload.reason,
              recommended_action: payload.recommended_action,
              final_action: payload.final_action,
              discount_cost: payload.discount_cost,
              expected_incremental_margin: payload.expected_incremental_margin,
              decision_status: payload.decision_status,
              experiment_group: payload.experiment_group,
              top_features: [
                { feature: 'cart_value', importance: 8.5, description: `Cart Value (₹${payload.cart_value})` },
                { feature: 'events_count', importance: 2.1, description: `Session Events (${payload.events_count})` }
              ],
              timestamp: payload.timestamp
            });
          }
        } catch (e) {
          console.error('[WebSocket] Message parsing error:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('[WebSocket] Connection error, falling back to HTTP:', err);
        setIsWsConnected(false);
      };

      ws.onclose = () => {
        console.log('[WebSocket] Connection closed');
        setIsWsConnected(false);
      };
    } catch (e) {
      console.warn('[WebSocket] Init failed:', e);
      setIsWsConnected(false);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [sessionId]);

  // Event logger helper
  const logEvent = useCallback((eventType: string, details: string, path?: string, extraData?: Record<string, any>) => {
    const nowStr = new Date().toISOString();
    const newEvent: ClickstreamEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: nowStr,
      event_type: eventType,
      details,
      path: path || window.location.pathname
    };
    setEvents((prev) => [...prev, newEvent]);

    // Stream event payload via WebSocket if active
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const wsPayload = {
        event_type: eventType.toUpperCase(),
        details,
        amount: extraData?.amount || 0.0,
        product_id: extraData?.product_id || null,
        timestamp: nowStr
      };
      wsRef.current.send(JSON.stringify(wsPayload));
    }
  }, []);

  // Initialize / Reset session
  const resetSession = useCallback(() => {
    const newId = generateSessionId();
    setSessionId(newId);
    setCart([]);
    setEvents([]);
    setSessionStartTime(Date.now());
    setPrediction(null);
    setRecommendation(null);
    setRealtimePayload(null);
    
    const now = new Date().toISOString();
    setEvents([{
      id: `evt_${Date.now()}_init`,
      timestamp: now,
      event_type: 'PAGE_VIEW',
      details: 'Started new shopping session',
      path: '/'
    }]);
  }, []);

  // Initial event log on load
  useEffect(() => {
    if (events.length === 0) {
      logEvent('PAGE_VIEW', 'Customer arrived on website', '/');
    }
  }, [events.length, logEvent]);

  // Cart operations
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    logEvent('ADD_TO_CART', `Added ${product.title} (₹${product.price}) to cart`, '/shop', {
      amount: product.price,
      product_id: product.id
    });
  }, [logEvent]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item) {
        logEvent('REMOVE_FROM_CART', `Removed ${item.product.title} from cart`, '/cart', {
          amount: item.product.price * item.quantity,
          product_id: productId
        });
      }
      return prev.filter((i) => i.product.id !== productId);
    });
  }, [logEvent]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartValue = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Compute active session payload for HTTP fallback
  const getActiveSessionPayload = useCallback((): SessionMetricsPayload => {
    const durationSec = Math.max(1, Math.floor((Date.now() - sessionStartTime) / 1000));
    const totalEventsCount = Math.max(1, events.length);
    const avgTimeBetween = Number((durationSec / totalEventsCount).toFixed(1));

    const pageViews = events.filter((e) => e.event_type.toLowerCase().includes('page')).length;
    const productViews = events.filter((e) => e.event_type.toLowerCase().includes('product')).length;
    const clicks = events.filter((e) => e.event_type.toLowerCase().includes('click')).length;
    const addToCartCount = events.filter((e) => e.event_type.toLowerCase().includes('add_to_cart')).length;
    const checkoutStarted = events.some((e) => e.event_type.toLowerCase().includes('checkout')) ? 1 : (cart.length > 0 ? 1 : 0);

    const uniqueProducts = new Set(cart.map((item) => item.product.id)).size;

    return {
      session_id: sessionId,
      total_events: totalEventsCount,
      num_products: uniqueProducts || (addToCartCount > 0 ? 1 : 0),
      cart_value: Number(cartValue.toFixed(2)),
      avg_time_between_events_sec: avgTimeBetween,
      page_views: Math.max(1, pageViews),
      product_views: Math.max(1, productViews),
      clicks: Math.max(1, clicks),
      add_to_cart_count: addToCartCount,
      session_duration_sec: durationSec,
      checkout_started: checkoutStarted,
      start_hour: new Date(sessionStartTime).getHours(),
      start_day_of_week: new Date(sessionStartTime).getDay(),
      bounce_indicator: totalEventsCount <= 1 ? 1 : 0,
      logins: 0,
      logouts: 0
    };
  }, [sessionStartTime, events, cart, cartValue, sessionId]);

  // Run AI prediction & recommendation
  const runAIPrediction = useCallback(async (): Promise<RecommendResponse | null> => {
    setIsAnalyzing(true);
    logEvent('CHECKOUT_STARTED', 'Initiated AI Cart Rescue evaluation', '/checkout');
    
    const payload = getActiveSessionPayload();
    try {
      const [predResult, recResult] = await Promise.all([
        predictRisk(payload),
        getRecommendation(payload)
      ]);

      setPrediction(predResult);
      setRecommendation(recResult);
      return recResult;
    } catch (err) {
      console.error('AI Prediction error:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [logEvent, getActiveSessionPayload]);

  return (
    <CartSessionContext.Provider
      value={{
        sessionId,
        resetSession,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartValue,
        totalCartItems,
        events,
        logEvent,
        sessionStartTime,
        prediction,
        recommendation,
        realtimePayload,
        isWsConnected,
        isAnalyzing,
        runAIPrediction,
        backendStatus,
        refreshHealthStatus,
        getActiveSessionPayload
      }}
    >
      {children}
    </CartSessionContext.Provider>
  );
};

export const useCartSession = () => {
  const context = useContext(CartSessionContext);
  if (!context) {
    throw new Error('useCartSession must be used within a CartSessionProvider');
  }
  return context;
};
