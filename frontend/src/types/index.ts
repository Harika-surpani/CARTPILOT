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
  event_type: 'page_view' | 'product_view' | 'click' | 'add_to_cart' | 'login' | 'logout' | 'purchase' | 'checkout_started' | 'PAGE_VIEW' | 'PRODUCT_VIEW' | 'CLICK' | 'ADD_TO_CART' | 'CHECKOUT_STARTED' | 'PAYMENT_ATTEMPT' | string;
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
  user_id?: string | number;
  risk_score: number;
  purchase_probability: number;
  abandonment_probability: number;
  confidence: number;
  reason: string;
  recommended_action: string;
  final_action?: string;
  discount_cost?: number;
  expected_incremental_margin?: number;
  decision_status?: string;
  experiment_group?: string;
  top_features: FeatureImportance[];
  top_signals?: string[];
  consent_status?: string;
  selected_channel?: string;
  blocked_channels?: string[];
  self_check_passed?: boolean;
  self_check_reasons?: string[];
  model_used?: string;
  estimated_cost?: number;
  decision_latency_ms?: number;
  timestamp: string;
}

export interface RealtimeSessionPayload {
  session_id: string;
  user_id?: string | number;
  risk_score: number;
  abandonment_probability: number;
  purchase_probability: number;
  confidence: number;
  reason: string;
  recommended_action: string;
  final_action: string;
  discount_cost: number;
  expected_incremental_margin: number;
  decision_status: string;
  experiment_group: string;
  top_signals?: string[];
  consent_status?: string;
  selected_channel?: string;
  blocked_channels?: string[];
  self_check_passed?: boolean;
  self_check_reasons?: string[];
  model_used?: string;
  estimated_cost?: number;
  decision_latency_ms?: number;
  cart_value: number;
  events_count: number;
  timestamp: string;
}

export interface UserPreferences {
  user_id: string | number;
  email_opt_in: boolean;
  sms_opt_in: boolean;
  whatsapp_opt_in: boolean;
  dnd_enabled: boolean;
}

export interface AICostMetrics {
  total_decisions: number;
  total_llm_calls: number;
  total_estimated_cost: number;
  average_cost_per_decision: number;
  average_latency_ms: number;
}

export interface ExperimentMetrics {
  experiment_id: string;
  total_sessions: number;
  control_sessions: number;
  treatment_sessions: number;
  control_conversions: number;
  treatment_conversions: number;
  control_conversion_rate: number;
  treatment_conversion_rate: number;
  incremental_conversion: number;
  control_revenue: number;
  treatment_revenue: number;
  discount_cost: number;
  incremental_revenue: number;
  incremental_margin: number;
  recovery_rate: number;
  status_message: string;
}

export interface BusinessConfig {
  max_user_discount: number;
  max_campaign_discount: number;
  coupon_percentage: number;
  free_shipping_cost: number;
  estimated_profit_margin: number;
}

export interface BackendHealthResponse {
  status: string;
  backend_status?: string;
  model_status?: string;
  database_status?: string;
  websocket_status?: string;
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
