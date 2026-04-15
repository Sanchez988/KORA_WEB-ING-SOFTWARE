import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Placeholder para rutas de usuario
router.get('/me', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
