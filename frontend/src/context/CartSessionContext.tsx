import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CartItem,
  ClickstreamEvent,
  Product,
  PredictResponse,
  RecommendResponse,
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
  logEvent: (eventType: ClickstreamEvent['event_type'], details: string, path?: string) => void;
  sessionStartTime: number;
  prediction: PredictResponse | null;
  recommendation: RecommendResponse | null;
  isAnalyzing: boolean;
  runAIPrediction: () => Promise<RecommendResponse | null>;
  backendStatus: BackendHealthResponse | null;
  refreshHealthStatus: () => Promise<void>;
  getActiveSessionPayload: () => SessionMetricsPayload;
}

const CartSessionContext = createContext<CartSessionContextType | undefined>(undefined);

const generateSessionId = () => `1000_${Math.floor(100 + Math.random() * 900)}`;

export const CartSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string>(() => generateSessionId());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [events, setEvents] = useState<ClickstreamEvent[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<BackendHealthResponse | null>(null);

  // Health check on mount
  const refreshHealthStatus = useCallback(async () => {
    const health = await checkHealth();
    setBackendStatus(health);
  }, []);

  useEffect(() => {
    refreshHealthStatus();
  }, [refreshHealthStatus]);

  // Event logger helper
  const logEvent = useCallback((eventType: ClickstreamEvent['event_type'], details: string, path?: string) => {
    const newEvent: ClickstreamEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      event_type: eventType,
      details,
      path: path || window.location.pathname
    };
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  // Initialize session log
  const resetSession = useCallback(() => {
    const newId = generateSessionId();
    setSessionId(newId);
    setCart([]);
    setEvents([]);
    setSessionStartTime(Date.now());
    setPrediction(null);
    setRecommendation(null);
    
    // Initial page view event
    const now = new Date().toISOString();
    setEvents([{
      id: `evt_${Date.now()}_init`,
      timestamp: now,
      event_type: 'page_view',
      details: 'Started new shopping session',
      path: '/'
    }]);
  }, []);

  // Initial event log on load
  useEffect(() => {
    if (events.length === 0) {
      logEvent('page_view', 'Customer arrived on website', '/');
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

    logEvent('add_to_cart', `Added ${product.title} ($${product.price}) to cart`, '/shop');
  }, [logEvent]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item) {
        logEvent('click', `Removed ${item.product.title} from cart`, '/cart');
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

  // Compute active 15-feature session payload for API
  const getActiveSessionPayload = useCallback((): SessionMetricsPayload => {
    const durationSec = Math.max(1, Math.floor((Date.now() - sessionStartTime) / 1000));
    const totalEventsCount = Math.max(1, events.length);
    const avgTimeBetween = Number((durationSec / totalEventsCount).toFixed(1));

    const pageViews = events.filter((e) => e.event_type === 'page_view').length;
    const productViews = events.filter((e) => e.event_type === 'product_view').length;
    const clicks = events.filter((e) => e.event_type === 'click').length;
    const addToCartCount = events.filter((e) => e.event_type === 'add_to_cart').length;
    const checkoutStarted = events.some((e) => e.event_type === 'checkout_started') ? 1 : (cart.length > 0 ? 1 : 0);

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
    logEvent('checkout_started', 'Initiated AI Cart Rescue evaluation', '/checkout');
    
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
