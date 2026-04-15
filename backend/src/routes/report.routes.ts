import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Rutas de reportes (implementar después)
router.post('/', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
