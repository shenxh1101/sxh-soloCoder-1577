import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  Flower,
  Template,
  Customer,
  Order,
  OrderNote,
  InventoryLog,
  OrderStatus,
  OrderItem,
  TopTemplate,
  MonthlyOrder,
  TimeSlotStats,
  HourlyStats,
  MonthlyComparison,
  AddonItem,
} from '../../shared/types.js';
import { seedFlowers, seedTemplates, seedCustomers, seedOrders } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

interface Database {
  flowers: Flower[];
  templates: Template[];
  customers: Customer[];
  orders: Order[];
  inventory_logs: InventoryLog[];
  nextIds: {
    flower: number;
    template: number;
    customer: number;
    order: number;
    orderNote: number;
    inventoryLog: number;
  };
}

let db: Database;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function initializeDatabase(): Database {
  return {
    flowers: JSON.parse(JSON.stringify(seedFlowers)),
    templates: JSON.parse(JSON.stringify(seedTemplates)),
    customers: JSON.parse(JSON.stringify(seedCustomers)),
    orders: JSON.parse(JSON.stringify(seedOrders)),
    inventory_logs: [],
    nextIds: {
      flower: seedFlowers.length + 1,
      template: seedTemplates.length + 1,
      customer: seedCustomers.length + 1,
      order: seedOrders.length + 1,
      orderNote: 10,
      inventoryLog: 1,
    },
  };
}

function loadDatabase(): Database {
  ensureDataDir();
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return initializeDatabase();
    }
  }
  const initial = initializeDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(database: Database) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(database, null, 2), 'utf-8');
}

export function getDb(): Database {
  if (!db) {
    db = loadDatabase();
  }
  return db;
}

export function persist() {
  saveDatabase(db);
}

export function resetDatabase() {
  db = initializeDatabase();
  saveDatabase(db);
}

export function getFlowers(): Flower[] {
  return getDb().flowers;
}

export function getFlowerById(id: number): Flower | undefined {
  return getDb().flowers.find(f => f.id === id);
}

export function getLowStockFlowers(): Flower[] {
  return getDb().flowers.filter(f => f.stock <= f.warning_threshold);
}

export function restockFlower(id: number, quantity: number, note?: string): Flower | null {
  const flower = getFlowerById(id);
  if (!flower) return null;

  flower.stock += quantity;

  const log: InventoryLog = {
    id: getDb().nextIds.inventoryLog++,
    flower_id: id,
    flower_name: flower.name,
    change_quantity: quantity,
    type: 'restock',
    created_at: new Date().toISOString(),
  };
  getDb().inventory_logs.push(log);

  persist();
  return flower;
}

export function getTemplates(): Template[] {
  return getDb().templates;
}

export function getTemplateById(id: number): Template | undefined {
  return getDb().templates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return getDb().templates.filter(t => t.category === category);
}

export function getCustomers(): Customer[] {
  return getDb().customers.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getCustomerById(id: number): Customer | undefined {
  return getDb().customers.find(c => c.id === id);
}

export function getCustomerByPhone(phone: string): Customer | undefined {
  return getDb().customers.find(c => c.phone === phone);
}

export function createCustomer(data: Partial<Omit<Customer, 'id' | 'created_at'>> & { name: string; phone: string }): Customer {
  const customer: Customer = {
    id: getDb().nextIds.customer++,
    name: data.name,
    phone: data.phone,
    preferences: data.preferences || '',
    preference_tags: data.preference_tags || [],
    favorite_addons: data.favorite_addons || [],
    total_orders: data.total_orders || 0,
    total_spent: data.total_spent || 0,
    created_at: new Date().toISOString(),
  };
  getDb().customers.push(customer);
  persist();
  return customer;
}

export function updateCustomer(id: number, data: Partial<Customer>): Customer | null {
  const customer = getCustomerById(id);
  if (!customer) return null;
  Object.assign(customer, data);
  persist();
  return customer;
}

export function getOrders(params?: {
  status?: OrderStatus;
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
}): Order[] {
  let orders = [...getDb().orders];

  if (params?.status) {
    orders = orders.filter(o => o.status === params.status);
  }
  if (params?.customerId) {
    orders = orders.filter(o => o.customer_id === params.customerId);
  }
  if (params?.dateFrom) {
    orders = orders.filter(o => o.delivery_date >= params.dateFrom!);
  }
  if (params?.dateTo) {
    orders = orders.filter(o => o.delivery_date <= params.dateTo!);
  }

  return orders.sort((a, b) => {
    const dateCompare = a.delivery_date.localeCompare(b.delivery_date);
    if (dateCompare !== 0) return dateCompare;
    return a.delivery_time.localeCompare(b.delivery_time);
  });
}

export function getTodayOrders(): Order[] {
  const today = new Date().toISOString().split('T')[0];
  return getOrders().filter(o => o.delivery_date === today);
}

export function getOrderById(id: number): Order | undefined {
  return getDb().orders.find(o => o.id === id);
}

export interface CreateOrderData {
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  addons: AddonItem[];
  total_price: number;
  delivery_date: string;
  delivery_time: string;
  delivery_address: string;
}

export function createOrder(data: CreateOrderData): Order {
  // 严格库存校验：遍历所有商品，逐个检查库存
  const allShortages: Array<{ flower_id: number; flower_name: string; needed: number; available: number }> = [];

  for (const item of data.items) {
    const template = getTemplateById(item.template_id);
    if (!template) continue;

    for (const tf of template.flowers) {
      const flower = getFlowerById(tf.flower_id);
      if (!flower) continue;
      const needed = tf.quantity * item.quantity;
      if (flower.stock < needed) {
        allShortages.push({
          flower_id: flower.id,
          flower_name: flower.name,
          needed,
          available: flower.stock,
        });
      }
    }
  }

  if (allShortages.length > 0) {
    const shortageText = allShortages
      .map(s => `${s.flower_name}: 需要${s.needed}，库存${s.available}`)
      .join('；');
    throw new Error(`库存不足，无法下单。${shortageText}`);
  }

  const order: Order = {
    ...data,
    id: getDb().nextIds.order++,
    status: 'pending',
    notes: [],
    created_at: new Date().toISOString(),
  };

  getDb().orders.push(order);

  // 扣减库存（因为前面已经校验过，这里不会出现负数）
  for (const item of data.items) {
    const template = getTemplateById(item.template_id);
    if (template) {
      for (const tf of template.flowers) {
        const flower = getFlowerById(tf.flower_id);
        if (flower) {
          flower.stock -= tf.quantity * item.quantity;
          const log: InventoryLog = {
            id: getDb().nextIds.inventoryLog++,
            flower_id: flower.id,
            flower_name: flower.name,
            change_quantity: -(tf.quantity * item.quantity),
            type: 'order_deduction',
            created_at: new Date().toISOString(),
          };
          getDb().inventory_logs.push(log);
        }
      }
    }
  }

  // 更新客户统计
  const customer = getCustomerById(data.customer_id);
  if (customer) {
    customer.total_orders = (customer.total_orders || 0) + 1;
    customer.total_spent = (customer.total_spent || 0) + data.total_price;
  }

  persist();
  return order;
}

export function updateOrderStatus(id: number, status: OrderStatus): Order | null {
  const order = getOrderById(id);
  if (!order) return null;
  order.status = status;
  persist();
  return order;
}

export function addOrderNote(orderId: number, content: string): OrderNote | null {
  const order = getOrderById(orderId);
  if (!order) return null;

  const note: OrderNote = {
    id: getDb().nextIds.orderNote++,
    content,
    created_at: new Date().toISOString(),
  };
  order.notes.push(note);
  persist();
  return note;
}

export function getCustomerOrders(customerId: number): Order[] {
  return getDb().orders
    .filter(o => o.customer_id === customerId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getTopTemplates(limit = 10): Array<{
  template_id: number;
  template_name: string;
  total_quantity: number;
  total_revenue: number;
}> {
  const stats = new Map<number, { template_name: string; total_quantity: number; total_revenue: number }>();

  for (const order of getDb().orders) {
    if (order.status === 'cancelled') continue;
    for (const item of order.items) {
      const existing = stats.get(item.template_id) || {
        template_name: item.template_name,
        total_quantity: 0,
        total_revenue: 0,
      };
      existing.total_quantity += item.quantity;
      existing.total_revenue += item.unit_price * item.quantity;
      stats.set(item.template_id, existing);
    }
  }

  return Array.from(stats.entries())
    .map(([template_id, data]) => ({
      template_id,
      ...data,
    }))
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, limit);
}

export function getOrdersByMonth(): Array<{
  month: string;
  order_count: number;
  total_revenue: number;
}> {
  const stats = new Map<string, { order_count: number; total_revenue: number }>();

  for (const order of getDb().orders) {
    if (order.status === 'cancelled') continue;
    const month = order.delivery_date.slice(0, 7);
    const existing = stats.get(month) || { order_count: 0, total_revenue: 0 };
    existing.order_count += 1;
    existing.total_revenue += order.total_price;
    stats.set(month, existing);
  }

  return Array.from(stats.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function getSalesStats(): {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  total_customers: number;
} {
  const validOrders = getDb().orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total_price, 0);

  return {
    total_orders: validOrders.length,
    total_revenue: totalRevenue,
    avg_order_value: validOrders.length > 0 ? totalRevenue / validOrders.length : 0,
    total_customers: getDb().customers.length,
  };
}

export function checkTemplateStock(templateId: number, quantity: number): {
  sufficient: boolean;
  shortages: Array<{ flower_id: number; flower_name: string; needed: number; available: number }>;
} {
  const template = getTemplateById(templateId);
  if (!template) {
    return { sufficient: false, shortages: [] };
  }

  const shortages: Array<{ flower_id: number; flower_name: string; needed: number; available: number }> = [];

  for (const tf of template.flowers) {
    const flower = getFlowerById(tf.flower_id);
    if (!flower) continue;
    const needed = tf.quantity * quantity;
    if (flower.stock < needed) {
      shortages.push({
        flower_id: flower.id,
        flower_name: flower.name,
        needed,
        available: flower.stock,
      });
    }
  }

  return { sufficient: shortages.length === 0, shortages };
}

function getMonthOrders(month: string): Order[] {
  return getDb().orders.filter(o => {
    if (o.status === 'cancelled') return false;
    return o.delivery_date.slice(0, 7) === month;
  });
}

function getMonthTopTemplates(month: string, limit = 10): TopTemplate[] {
  const orders = getMonthOrders(month);
  const stats = new Map<number, { template_name: string; total_quantity: number; total_revenue: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = stats.get(item.template_id) || {
        template_name: item.template_name,
        total_quantity: 0,
        total_revenue: 0,
      };
      existing.total_quantity += item.quantity;
      existing.total_revenue += item.unit_price * item.quantity;
      stats.set(item.template_id, existing);
    }
  }

  return Array.from(stats.entries())
    .map(([template_id, data]) => ({ template_id, ...data }))
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, limit);
}

function getPreviousMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 2, 1);
  return date.toISOString().slice(0, 7);
}

export function getMonthlyComparison(month: string): MonthlyComparison {
  const prevMonth = getPreviousMonth(month);
  const currentOrders = getMonthOrders(month);
  const prevOrders = getMonthOrders(prevMonth);

  const currentRevenue = currentOrders.reduce((sum, o) => sum + o.total_price, 0);
  const prevRevenue = prevOrders.reduce((sum, o) => sum + o.total_price, 0);

  const currentTop = getMonthTopTemplates(month, 1);
  const prevTop = getMonthTopTemplates(prevMonth, 1);

  const topTemplates = getMonthTopTemplates(month, 10);

  const orderCountChange = currentOrders.length - prevOrders.length;
  const revenueChange = currentRevenue - prevRevenue;

  return {
    current: {
      month,
      order_count: currentOrders.length,
      total_revenue: currentRevenue,
      avg_order_value: currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0,
      top_template: currentTop[0] || null,
    },
    previous: {
      month: prevMonth,
      order_count: prevOrders.length,
      total_revenue: prevRevenue,
      avg_order_value: prevOrders.length > 0 ? prevRevenue / prevOrders.length : 0,
      top_template: prevTop[0] || null,
    },
    changes: {
      order_count_change: orderCountChange,
      order_count_change_percent: prevOrders.length > 0 ? (orderCountChange / prevOrders.length) * 100 : 0,
      revenue_change: revenueChange,
      revenue_change_percent: prevRevenue > 0 ? (revenueChange / prevRevenue) * 100 : 0,
    },
    top_templates: topTemplates,
    time_slots: getTimeSlotStats(month),
    hourly_stats: getHourlyStats(month),
  };
}

function getTimeSlotFromTime(time: string): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const timeSlotLabels: Record<string, string> = {
  morning: '上午 (06:00-12:00)',
  afternoon: '下午 (12:00-17:00)',
  evening: '晚上 (17:00-21:00)',
  night: '夜间 (21:00-06:00)',
};

export function getTimeSlotStats(month?: string): TimeSlotStats[] {
  let orders = getDb().orders.filter(o => o.status !== 'cancelled');
  if (month) {
    orders = orders.filter(o => o.delivery_date.slice(0, 7) === month);
  }

  const slots: Record<string, TimeSlotStats> = {
    morning: { slot: 'morning', label: timeSlotLabels.morning, order_count: 0, total_revenue: 0 },
    afternoon: { slot: 'afternoon', label: timeSlotLabels.afternoon, order_count: 0, total_revenue: 0 },
    evening: { slot: 'evening', label: timeSlotLabels.evening, order_count: 0, total_revenue: 0 },
    night: { slot: 'night', label: timeSlotLabels.night, order_count: 0, total_revenue: 0 },
  };

  for (const order of orders) {
    const slot = getTimeSlotFromTime(order.delivery_time);
    slots[slot].order_count += 1;
    slots[slot].total_revenue += order.total_price;
  }

  return Object.values(slots);
}

export function getHourlyStats(month?: string): HourlyStats[] {
  let orders = getDb().orders.filter(o => o.status !== 'cancelled');
  if (month) {
    orders = orders.filter(o => o.delivery_date.slice(0, 7) === month);
  }

  const stats: HourlyStats[] = [];
  for (let h = 0; h < 24; h++) {
    stats.push({ hour: h, order_count: 0, total_revenue: 0 });
  }

  for (const order of orders) {
    const hour = parseInt(order.delivery_time.split(':')[0]);
    if (hour >= 0 && hour < 24) {
      stats[hour].order_count += 1;
      stats[hour].total_revenue += order.total_price;
    }
  }

  return stats;
}

export function getDateRangeStats(dateFrom: string, dateTo: string): {
  order_count: number;
  total_revenue: number;
  avg_order_value: number;
  top_templates: TopTemplate[];
  hourly_stats: HourlyStats[];
  time_slots: TimeSlotStats[];
} {
  const orders = getDb().orders.filter(o => {
    if (o.status === 'cancelled') return false;
    return o.delivery_date >= dateFrom && o.delivery_date <= dateTo;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_price, 0);

  // Top templates
  const templateStats = new Map<number, { template_name: string; total_quantity: number; total_revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const existing = templateStats.get(item.template_id) || {
        template_name: item.template_name,
        total_quantity: 0,
        total_revenue: 0,
      };
      existing.total_quantity += item.quantity;
      existing.total_revenue += item.unit_price * item.quantity;
      templateStats.set(item.template_id, existing);
    }
  }
  const topTemplates = Array.from(templateStats.entries())
    .map(([template_id, data]) => ({ template_id, ...data }))
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, 10);

  // Hourly stats
  const hourly: HourlyStats[] = [];
  for (let h = 0; h < 24; h++) {
    hourly.push({ hour: h, order_count: 0, total_revenue: 0 });
  }
  for (const order of orders) {
    const hour = parseInt(order.delivery_time.split(':')[0]);
    if (hour >= 0 && hour < 24) {
      hourly[hour].order_count += 1;
      hourly[hour].total_revenue += order.total_price;
    }
  }

  // Time slots
  const slots: Record<string, TimeSlotStats> = {
    morning: { slot: 'morning', label: timeSlotLabels.morning, order_count: 0, total_revenue: 0 },
    afternoon: { slot: 'afternoon', label: timeSlotLabels.afternoon, order_count: 0, total_revenue: 0 },
    evening: { slot: 'evening', label: timeSlotLabels.evening, order_count: 0, total_revenue: 0 },
    night: { slot: 'night', label: timeSlotLabels.night, order_count: 0, total_revenue: 0 },
  };
  for (const order of orders) {
    const slot = getTimeSlotFromTime(order.delivery_time);
    slots[slot].order_count += 1;
    slots[slot].total_revenue += order.total_price;
  }

  return {
    order_count: orders.length,
    total_revenue: totalRevenue,
    avg_order_value: orders.length > 0 ? totalRevenue / orders.length : 0,
    top_templates: topTemplates,
    hourly_stats: hourly,
    time_slots: Object.values(slots),
  };
}
 
