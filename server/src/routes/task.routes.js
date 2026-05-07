import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { validate } from '../middleware/validate.js';
import { taskSchema, updateTaskSchema } from '../utils/schemas.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateUser);

router.post('/', authorizeRoles('ADMIN'), validate(taskSchema), taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', authorizeRoles('ADMIN'), taskController.deleteTask);

export default router;
