export interface Flower {
  id: number;
  name: string;
  unit: string;
  cost_price: number;
  warning_threshold: number;
  stock: number;
}

export interface TemplateFlower {
  flower_id: number;
  quantity: number;
}

export interface Template {
  id: number;
  name: string;
  category: 'rose' | 'lily' | 'mixed';
  description: string;
  base_price: number;
  image_url: string;
  flowers: TemplateFlower[];
}

export type OrderStatus = 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';

export interface OrderItem {
  template_id: number;
  template_name: string;
  quantity: number;
  unit_price: number;
  customizations?: string;
}

export interface OrderNote {
  id: number;
  content: string;
  created_at: string;
}

export interface AddonItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  addons: AddonItem[];
  total_price: number;
  status: OrderStatus;
  delivery_date: string;
  delivery_time: string;
  delivery_address: string;
  recipient_name?: string;
  notes: OrderNote[];
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  preferences: string;
  preference_tags: string[];
  favorite_addons: string[];
  total_orders?: number;
  total_spent?: number;
  created_at: string;
}

export interface CustomerWithOrders extends Customer {
  orders: Order[];
}

export interface InventoryLog {
  id: number;
  flower_id: number;
  flower_name: string;
  change_quantity: number;
  type: 'restock' | 'order_deduction' | 'adjustment';
  created_at: string;
}

export interface TopTemplate {
  template_id: number;
  template_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface MonthlyOrder {
  month: string;
  order_count: number;
  total_revenue: number;
}

export interface SalesStats {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  total_customers: number;
}

export interface TimeSlotStats {
  slot: 'morning' | 'afternoon' | 'evening' | 'night';
  label: string;
  order_count: number;
  total_revenue: number;
}

export interface HourlyStats {
  hour: number;
  order_count: number;
  total_revenue: number;
}

export interface MonthlyComparison {
  current: {
    month: string;
    order_count: number;
    total_revenue: number;
    avg_order_value: number;
    top_template: TopTemplate | null;
  };
  previous: {
    month: string;
    order_count: number;
    total_revenue: number;
    avg_order_value: number;
    top_template: TopTemplate | null;
  };
  changes: {
    order_count_change: number;
    order_count_change_percent: number;
    revenue_change: number;
    revenue_change_percent: number;
  };
  top_templates: TopTemplate[];
  time_slots: TimeSlotStats[];
  hourly_stats: HourlyStats[];
}
