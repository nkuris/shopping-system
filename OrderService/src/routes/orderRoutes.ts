import { Router } from 'express';
import { createOrder } from '../controllers/orderController.js';

const router = Router();

// POST /api/orders
router.post('/', createOrder);

export default router;