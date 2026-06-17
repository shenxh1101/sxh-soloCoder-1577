import { Router } from 'express';
import { getSalesStats, getTopTemplates, getOrdersByMonth } from '../db/database.js';

const router = Router();

router.get('/sales', (_req, res) => {
  const stats = getSalesStats();
  res.json(stats);
});

router.get('/top-templates', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const result = getTopTemplates(limit);
  res.json(result);
});

router.get('/orders-by-month', (_req, res) => {
  const result = getOrdersByMonth();
  res.json(result);
});

export default router;
