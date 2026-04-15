import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, adminMiddleware, EmployeeController.getAll);
router.post('/', authMiddleware, adminMiddleware, EmployeeController.create);
router.put('/:id', authMiddleware, adminMiddleware, EmployeeController.update);
router.delete('/:id', authMiddleware, adminMiddleware, EmployeeController.delete);
router.post('/:id/reset-permissions', authMiddleware, adminMiddleware, EmployeeController.resetPermissions);

export default router;