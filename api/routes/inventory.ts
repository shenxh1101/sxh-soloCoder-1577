import { Router } from 'express';
import { getFlowers, getFlowerById, getLowStockFlowers, restockFlower } from '../db/database.js';

const router = Router();

router.get('/', (_req, res) => {
  const flowers = getFlowers();
  res.json(flowers);
});

router.get('/low-stock', (_req, res) => {
  const flowers = getLowStockFlowers();
  res.json(flowers);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const flower = getFlowerById(id);
  if (!flower) {
    res.status(404).json({ error: 'Flower not found' });
    return;
  }
  res.json(flower);
});

router.put('/:id/restock', (req, res) => {
  const id = parseInt(req.params.id);
  const { quantity, note } = req.body;

  if (!quantity || quantity <= 0) {
    res.status(400).json({ error: 'Invalid quantity' });
    return;
  }

  const flower = restockFlower(id, quantity, note);
  if (!flower) {
    res.status(404).json({ error: 'Flower not found' });
    return;
  }
  res.json(flower);
});

export default router;
