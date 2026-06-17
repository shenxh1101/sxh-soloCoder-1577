import { Router } from 'express';
import { getTemplates, getTemplateById, checkTemplateStock } from '../db/database.js';

const router = Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  let templates = getTemplates();
  if (category && typeof category === 'string') {
    templates = templates.filter(t => t.category === category);
  }
  res.json(templates);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const template = getTemplateById(id);
  if (!template) {
    res.status(404).json({ error: 'Template not found' });
    return;
  }
  res.json(template);
});

router.get('/:id/stock-check', (req, res) => {
  const id = parseInt(req.params.id);
  const quantity = parseInt(req.query.quantity as string) || 1;
  const template = getTemplateById(id);
  if (!template) {
    res.status(404).json({ error: 'Template not found' });
    return;
  }
  const result = checkTemplateStock(id, quantity);
  res.json(result);
});

export default router;
