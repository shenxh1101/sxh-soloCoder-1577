import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  getTodayOrders,
  createOrder,
  updateOrderStatus,
  addOrderNote,
} from '../db/database.js';
import type { OrderStatus } from '../../shared/types.js';

const router = Router();

router.get('/', (req, res) => {
  const { status, customerId, dateFrom, dateTo } = req.query;
  const orders = getOrders({
    status: status as OrderStatus | undefined,
    customerId: customerId ? parseInt(customerId as string) : undefined,
    dateFrom: dateFrom as string | undefined,
    dateTo: dateTo as string | undefined,
  });
  res.json(orders);
});

router.get('/today', (_req, res) => {
  const orders = getTodayOrders();
  res.json(orders);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const order = getOrderById(id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(order);
});

router.post('/', (req, res) => {
  try {
    const order = createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  const validStatuses: OrderStatus[] = ['pending', 'preparing', 'delivering', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const order = updateOrderStatus(id, status);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(order);
});

router.post('/:id/notes', (req, res) => {
  const id = parseInt(req.params.id);
  const { content } = req.body;

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Note content is required' });
    return;
  }

  const note = addOrderNote(id, content.trim());
  if (!note) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.status(201).json(note);
});

export default router;
