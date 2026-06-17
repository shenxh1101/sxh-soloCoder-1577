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

export function createCustomer(data: Omit<Customer, 'id' | 'created_at'>): Customer {
  const customer: Customer = {
    ...data,
    id: getDb().nextIds.customer++,
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
  total_price: number;
  delivery_date: string;
  delivery_time: string;
  delivery_address: string;
}

export function createOrder(data: CreateOrderData): Order {
  const order: Order = {
    ...data,
    id: getDb().nextIds.order++,
    status: 'pending',
    notes: [],
    created_at: new Date().toISOString(),
  };

  getDb().orders.push(order);

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
