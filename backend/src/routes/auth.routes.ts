import { Router } from 'express';
import {
  register,
  verifyEmail,
  login,
  refreshToken,
  requestPasswordReset,
  resetPassword,
} from '../controllers/auth.controller';
import { authRateLimiter } from '../middleware/rateLimiter';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

// Validaciones
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .matches(/@pascualbravo\.edu\.co$/)
    .withMessage('Debes usar tu correo institucional'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage('La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Fecha de nacimiento inválida'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

// Rutas
router.post('/register', registerValidation, validate, register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', authRateLimiter, loginValidation, validate, login);
router.post('/refresh-token', refreshToken);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
