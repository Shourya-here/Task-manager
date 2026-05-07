import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.use(authenticateUser);

router.get('/stats', dashboardController.getStats);
router.get('/overdue', dashboardController.getOverdueTasks);

export default router;
