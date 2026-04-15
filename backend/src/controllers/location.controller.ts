import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Actualizar ubicación del usuario
 */
export const updateLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { latitude, longitude, accuracy } = req.body;

    if (!latitude || !longitude) {
      throw new AppError('Latitud y longitud son requeridas', 400);
    }

    // Validar rango de coordenadas
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new AppError('Coordenadas inválidas', 400);
    }

    // Crear o actualizar ubicación
    const location = await prisma.location.upsert({
      where: { userId },
      create: {
        userId,
        latitude,
        longitude,
        accuracy: accuracy || null,
      },
      update: {
        latitude,
        longitude,
        accuracy: accuracy || null,
      },
    });

    logger.info(`Ubicación actualizada para usuario ${userId}`);

    res.json({
      message: 'Ubicación actualizada exitosamente',
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener ubicación del usuario
 */
export const getMyLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const location = await prisma.location.findUnique({
      where: { userId },
    });

    if (!location) {
      return res.json({
        message: 'No se ha registrado ubicación',
        location: null,
      });
    }

    res.json({
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        updatedAt: location.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar ubicación del usuario
 */
export const deleteLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    await prisma.location.deleteMany({
      where: { userId },
    });

    logger.info(`Ubicación eliminada para usuario ${userId}`);

    res.json({
      message: 'Ubicación eliminada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};
