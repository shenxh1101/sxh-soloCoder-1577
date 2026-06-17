import { Router } from 'express';
import {
  getSalesStats,
  getTopTemplates,
  getOrdersByMonth,
  getMonthlyComparison,
  getTimeSlotStats,
  getHourlyStats,
  getDateRangeStats,
} from '../db/database.js';

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

router.get('/monthly-comparison', (req, res) => {
  const { month } = req.query;
  let targetMonth: string;
  if (month && typeof month === 'string') {
    targetMonth = month;
  } else {
    targetMonth = new Date().toISOString().slice(0, 7);
  }
  const result = getMonthlyComparison(targetMonth);
  res.json(result);
});

router.get('/time-slots', (req, res) => {
  const { month } = req.query;
  const result = getTimeSlotStats(month as string | undefined);
  res.json(result);
});

router.get('/hourly-stats', (req, res) => {
  const { month } = req.query;
  const result = getHourlyStats(month as string | undefined);
  res.json(result);
});

router.get('/date-range', (req, res) => {
  const { dateFrom, dateTo } = req.query;
  if (!dateFrom || !dateTo || typeof dateFrom !== 'string' || typeof dateTo !== 'string') {
    res.status(400).json({ error: 'dateFrom and dateTo are required' });
    return;
  }
  const result = getDateRangeStats(dateFrom, dateTo);
  res.json(result);
});

export default router;
