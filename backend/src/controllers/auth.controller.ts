import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Registro de usuario
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, dateOfBirth } = req.body;

    // Validar email institucional
    if (!email.endsWith('@pascualbravo.edu.co')) {
      throw new AppError('Debes usar tu correo institucional (@pascualbravo.edu.co)', 400);
    }

    // Validar fortaleza de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new AppError(
        'La contraseña debe tener mínimo 8 caracteres, incluyendo al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&#)',
        400
      );
    }

    // Validar edad (mayor de 18)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      throw new AppError('Debes ser mayor de 18 años para usar Kora', 400);
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Este correo ya está registrado', 409);
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        dateOfBirth: birthDate,
        verificationToken,
      },
    });

    // Enviar correo de verificación
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: 'Cuenta creada exitosamente. Por favor verifica tu correo electrónico.',
      userId: user.id,
    });
  } catch (error) {
    next(error);
  }
};

// Verificar email
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new AppError('Token de verificación inválido o expirado', 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationToken: null,
      },
    });

    res.status(200).json({
      message: '¡Correo verificado exitosamente! Ya puedes iniciar sesión.',
    });
  } catch (error) {
    next(error);
  }
};

// Inicio de sesión
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar si la cuenta está bloqueada
    if (config.env === 'production' && user.lockUntil && user.lockUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new AppError(
        `Cuenta bloqueada temporalmente. Intenta de nuevo en ${remainingTime} minutos.`,
        423
      );
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      const loginAttempts = user.loginAttempts + 1;
      const updateData: any = { loginAttempts };

      if (config.env === 'production' && loginAttempts >= config.security.maxLoginAttempts) {
        updateData.lockUntil = new Date(Date.now() + config.security.loginLockTime);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar si el email está verificado (solo en producción)
    if (!user.verified && config.env === 'production') {
      throw new AppError('Por favor verifica tu correo electrónico antes de iniciar sesión', 403);
    }

    // En desarrollo, auto-verificar usuarios no verificados
    if (!user.verified && config.env !== 'production') {
      await prisma.user.update({
        where: { id: user.id },
        data: { verified: true, verificationToken: null },
      });
      logger.info(`⚠️ Modo desarrollo: Usuario auto-verificado - ${email}`);
    }

    // Reset intentos fallidos y actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockUntil: null,
        lastLogin: new Date(),
      },
    });

    // Generar tokens JWT
    // @ts-ignore
    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    // @ts-ignore
    const refreshToken = jwt.sign({ userId: user.id }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    res.status(200).json({
      message: '¡Bienvenido a Kora!',
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        hasProfile: !!user.profile,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token no proporcionado', 400);
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // @ts-ignore
    const newToken = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    res.status(200).json({
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
};

// Solicitar restablecimiento de contraseña
export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por seguridad, no revelar si el email existe
      return res.status(200).json({
        message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',
    });
  } catch (error) {
    next(error);
  }
};

// Restablecer contraseña
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    // Validar fortaleza de la nueva contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new AppError(
        'La contraseña debe tener mínimo 8 caracteres, incluyendo al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&#)',
        400
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Token inválido o expirado', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};
