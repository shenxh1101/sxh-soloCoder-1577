import type {
  Template,
  Flower,
  Order,
  Customer,
  CustomerWithOrders,
  OrderStatus,
  SalesStats,
  TopTemplate,
  MonthlyOrder,
  OrderNote,
} from '../../shared/types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const templatesApi = {
  getAll: (category?: string) =>
    request<Template[]>(`/templates${category ? `?category=${category}` : ''}`),

  getById: (id: number) =>
    request<Template>(`/templates/${id}`),

  checkStock: (id: number, quantity: number) =>
    request<{
      sufficient: boolean;
      shortages: Array<{ flower_id: number; flower_name: string; needed: number; available: number }>;
    }>(`/templates/${id}/stock-check?quantity=${quantity}`),
};

export const inventoryApi = {
  getAll: () => request<Flower[]>('/inventory'),

  getLowStock: () => request<Flower[]>('/inventory/low-stock'),

  getById: (id: number) => request<Flower>(`/inventory/${id}`),

  restock: (id: number, quantity: number, note?: string) =>
    request<Flower>(`/inventory/${id}/restock`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, note }),
    }),
};

export const ordersApi = {
  getAll: (params?: {
    status?: OrderStatus;
    customerId?: number;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.customerId) searchParams.set('customerId', String(params.customerId));
    if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
    const query = searchParams.toString();
    return request<Order[]>(`/orders${query ? `?${query}` : ''}`);
  },

  getToday: () => request<Order[]>('/orders/today'),

  getById: (id: number) => request<Order>(`/orders/${id}`),

  create: (data: {
    customer_id: number;
    customer_name: string;
    customer_phone: string;
    items: Array<{ template_id: number; template_name: string; quantity: number; unit_price: number; customizations?: string }>;
    total_price: number;
    delivery_date: string;
    delivery_time: string;
    delivery_address: string;
  }) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number, status: OrderStatus) =>
    request<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  addNote: (id: number, content: string) =>
    request<OrderNote>(`/orders/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};

export const customersApi = {
  getAll: (search?: string) =>
    request<Customer[]>(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getById: (id: number) =>
    request<CustomerWithOrders>(`/customers/${id}`),

  getByPhone: (phone: string) =>
    request<CustomerWithOrders>(`/customers/phone/${phone}`),

  create: (data: { name: string; phone: string; preferences?: string }) =>
    request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Customer>) =>
    request<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const statsApi = {
  getSales: () => request<SalesStats>('/stats/sales'),

  getTopTemplates: (limit?: number) =>
    request<TopTemplate[]>(`/stats/top-templates${limit ? `?limit=${limit}` : ''}`),

  getOrdersByMonth: () => request<MonthlyOrder[]>('/stats/orders-by-month'),
};
