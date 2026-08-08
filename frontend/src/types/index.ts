export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ClickstreamEvent {
  id: string;
  timestamp: string;
  event_type: 'page_view' | 'product_view' | 'click' | 'add_to_cart' | 'login' | 'logout' | 'purchase' | 'checkout_started';
  details: string;
  path?: string;
}

export interface SessionMetricsPayload {
  session_id: string;
  total_events: number;
  num_products: number;
  cart_value: number;
  avg_time_between_events_sec: number;
  page_views: number;
  product_views: number;
  clicks: number;
  add_to_cart_count: number;
  session_duration_sec: number;
  checkout_started: number;
  start_hour?: number;
  start_day_of_week?: number;
  bounce_indicator?: number;
  logins?: number;
  logouts?: number;
}

export interface PredictResponse {
  session_id: string;
  abandonment_probability: number;
  purchase_probability: number;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  confidence: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  description?: string;
}

export interface RecommendResponse {
  session_id: string;
  risk_score: number;
  purchase_probability: number;
  abandonment_probability: number;
  confidence: number;
  reason: string;
  recommended_action: 'Offer Coupon' | 'Free Shipping' | 'Retry Payment' | 'Send Reminder' | 'Do Nothing' | string;
  top_features: FeatureImportance[];
  timestamp: string;
}

export interface BackendHealthResponse {
  status: string;
  model_loaded: boolean;
  version: string;
}

export interface BusinessMetrics {
  total_sessions: number;
  high_risk_sessions: number;
  recovered_sessions: number;
  avg_risk_score: number;
  revenue_saved: number;
  coupons_issued: number;
  coupons_saved: number;
  recovery_rate: number;
  avg_cart_value: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
  action_counts: Record<string, number>;
}

export interface ModelPerformanceStats {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
}

export interface CustomerCheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  paymentMethod: 'credit_card' | 'paypal' | 'apple_pay' | 'cod';
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
}
