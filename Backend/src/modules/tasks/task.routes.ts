import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from './task.controller';
import authMiddleware from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
