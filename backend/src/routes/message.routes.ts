import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  sendMessage,
  getMessages,
  deleteMessage,
  markAsRead,
} from '../controllers/message.controller';

const router = Router();

router.use(authenticate);

router.post('/', sendMessage);
router.get('/:matchId', getMessages);
router.delete('/:messageId', deleteMessage);
router.post('/mark-read', markAsRead);

export default router;
