import { create } from 'zustand';
import type { Template, Flower, Order, Customer, OrderStatus } from '../../shared/types';
import { templatesApi, inventoryApi, ordersApi, customersApi } from '../api';

interface AppState {
  templates: Template[];
  flowers: Flower[];
  lowStockFlowers: Flower[];
  orders: Order[];
  todayOrders: Order[];
  customers: Customer[];
  loading: Record<string, boolean>;

  fetchTemplates: (category?: string) => Promise<void>;
  fetchInventory: () => Promise<void>;
  fetchLowStock: () => Promise<void>;
  fetchOrders: (params?: {
    status?: OrderStatus;
    customerId?: number;
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<void>;
  fetchTodayOrders: () => Promise<void>;
  fetchCustomers: (search?: string) => Promise<void>;
  restockFlower: (id: number, quantity: number) => Promise<void>;
  createOrder: (data: Parameters<typeof ordersApi.create>[0]) => Promise<Order>;
  updateOrderStatus: (id: number, status: OrderStatus) => Promise<void>;
  addOrderNote: (id: number, content: string) => Promise<void>;
  createCustomer: (data: { name: string; phone: string; preferences?: string }) => Promise<Customer>;
  updateCustomer: (id: number, data: Partial<Customer>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  templates: [],
  flowers: [],
  lowStockFlowers: [],
  orders: [],
  todayOrders: [],
  customers: [],
  loading: {},

  fetchTemplates: async (category) => {
    set({ loading: { ...get().loading, templates: true } });
    try {
      const data = await templatesApi.getAll(category);
      set({ templates: data });
    } finally {
      set({ loading: { ...get().loading, templates: false } });
    }
  },

  fetchInventory: async () => {
    set({ loading: { ...get().loading, inventory: true } });
    try {
      const data = await inventoryApi.getAll();
      set({ flowers: data });
    } finally {
      set({ loading: { ...get().loading, inventory: false } });
    }
  },

  fetchLowStock: async () => {
    set({ loading: { ...get().loading, lowStock: true } });
    try {
      const data = await inventoryApi.getLowStock();
      set({ lowStockFlowers: data });
    } finally {
      set({ loading: { ...get().loading, lowStock: false } });
    }
  },

  fetchOrders: async (params) => {
    set({ loading: { ...get().loading, orders: true } });
    try {
      const data = await ordersApi.getAll(params);
      set({ orders: data });
    } finally {
      set({ loading: { ...get().loading, orders: false } });
    }
  },

  fetchTodayOrders: async () => {
    set({ loading: { ...get().loading, todayOrders: true } });
    try {
      const data = await ordersApi.getToday();
      set({ todayOrders: data });
    } finally {
      set({ loading: { ...get().loading, todayOrders: false } });
    }
  },

  fetchCustomers: async (search) => {
    set({ loading: { ...get().loading, customers: true } });
    try {
      const data = await customersApi.getAll(search);
      const normalized = data.map(c => ({
        ...c,
        preference_tags: Array.isArray(c.preference_tags)
          ? c.preference_tags.map(t => typeof t === 'string' ? t : t.name)
          : [],
        favorite_addons: Array.isArray(c.favorite_addons)
          ? c.favorite_addons.map(a => typeof a === 'string' ? a : a.name)
          : [],
      }));
      set({ customers: normalized });
    } finally {
      set({ loading: { ...get().loading, customers: false } });
    }
  },

  restockFlower: async (id, quantity) => {
    await inventoryApi.restock(id, quantity);
    await Promise.all([get().fetchInventory(), get().fetchLowStock()]);
  },

  createOrder: async (data) => {
    const order = await ordersApi.create(data);
    await Promise.all([
      get().fetchOrders(),
      get().fetchTodayOrders(),
      get().fetchInventory(),
      get().fetchLowStock(),
    ]);
    return order;
  },

  updateOrderStatus: async (id, status) => {
    await ordersApi.updateStatus(id, status);
    await Promise.all([get().fetchOrders(), get().fetchTodayOrders()]);
  },

  addOrderNote: async (id, content) => {
    await ordersApi.addNote(id, content);
    await get().fetchOrders();
    await get().fetchTodayOrders();
  },

  createCustomer: async (data) => {
    const customer = await customersApi.create(data);
    await get().fetchCustomers();
    return customer;
  },

  updateCustomer: async (id, data) => {
    await customersApi.update(id, data);
    await get().fetchCustomers();
  },
}));
