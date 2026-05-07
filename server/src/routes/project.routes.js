import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { validate } from '../middleware/validate.js';
import { projectSchema, addMemberSchema } from '../utils/schemas.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateUser);

router.post('/', authorizeRoles('ADMIN'), validate(projectSchema), projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', authorizeRoles('ADMIN'), validate(projectSchema), projectController.updateProject);
router.delete('/:id', authorizeRoles('ADMIN'), projectController.deleteProject);

// Team management
router.post('/:id/members', authorizeRoles('ADMIN'), validate(addMemberSchema), projectController.addMember);
router.delete('/:id/members/:userId', authorizeRoles('ADMIN'), projectController.removeMember);

export default router;
