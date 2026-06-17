import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  getCustomerOrders,
} from '../db/database.js';

const router = Router();

router.get('/', (req, res) => {
  const { search } = req.query;
  let customers = getCustomers();

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    customers = customers.filter(
      c => c.name.toLowerCase().includes(s) || c.phone.includes(s)
    );
  }

  res.json(customers);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const customer = getCustomerById(id);
  if (!customer) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }
  const orders = getCustomerOrders(id);
  res.json({ ...customer, orders });
});

router.get('/phone/:phone', (req, res) => {
  const customer = getCustomerByPhone(req.params.phone);
  if (!customer) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }
  const orders = getCustomerOrders(customer.id);
  res.json({ ...customer, orders });
});

router.post('/', (req, res) => {
  const { name, phone, preferences } = req.body;

  if (!name || !phone) {
    res.status(400).json({ error: 'Name and phone are required' });
    return;
  }

  const existing = getCustomerByPhone(phone);
  if (existing) {
    res.status(409).json({ error: 'Customer with this phone already exists', customer: existing });
    return;
  }

  const customer = createCustomer({ name, phone, preferences: preferences || '' });
  res.status(201).json(customer);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const customer = updateCustomer(id, req.body);
  if (!customer) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }
  res.json(customer);
});

export default router;
