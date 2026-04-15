import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Crear perfil
export const createProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const {
      name,
      bio,
      gender,
      program,
      semester,
      photos,
      interests,
      hobbies,
      relationshipGoal,
      minAge,
      maxAge,
    } = req.body;

    // Verificar que el usuario no tenga ya un perfil
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new AppError('Ya tienes un perfil creado', 400);
    }

    // Validar que tenga al menos 1 foto
    if (!photos || photos.length < 1) {
      throw new AppError('Debes subir al menos 1 foto', 400);
    }

    // Validar longitud de biografía
    if (!bio || bio.length < 50 || bio.length > 500) {
      throw new AppError('La biografía debe tener entre 50 y 500 caracteres', 400);
    }

    // Validar intereses
    if (!interests || interests.length < 3) {
      throw new AppError('Debes seleccionar al menos 3 intereses', 400);
    }

    if (interests.some((interest: string) => typeof interest !== 'string' || interest.trim().length === 0 || interest.length > 150)) {
      throw new AppError('Cada gusto debe tener entre 1 y 150 caracteres', 400);
    }

    if (hobbies && hobbies.some((hobby: string) => typeof hobby !== 'string' || hobby.trim().length === 0 || hobby.length > 150)) {
      throw new AppError('Cada hobby debe tener entre 1 y 150 caracteres', 400);
    }

    // Calcular completitud del perfil
    let completeness = 0;
    if (name) completeness += 10;
    if (bio && bio.length >= 50) completeness += 20;
    if (photos && photos.length >= 1) completeness += 20;
    if (photos && photos.length >= 4) completeness += 10;
    if (interests && interests.length >= 3) completeness += 15;
    if (hobbies && hobbies.length > 0) completeness += 10;
    if (relationshipGoal) completeness += 10;
    if (program) completeness += 5;

    try {
      const profile = await prisma.profile.create({
        data: {
          userId,
          name,
          bio,
          gender,
          program,
          semester: semester ? parseInt(semester) : null,
          photos,
          interests,
          hobbies: hobbies || [],
          relationshipGoal,
          minAge: minAge || 18,
          maxAge: maxAge || 30,
          completeness,
        },
      });

      res.status(201).json({
        message: 'Perfil creado exitosamente',
        profile,
      });
    } catch (dbError: any) {
      console.error('Error de Prisma:', dbError);
      console.error('Detalles del error:', JSON.stringify(dbError, null, 2));
      throw new AppError(`Error al crear perfil: ${dbError.message}`, 400);
    }
  } catch (error) {
    next(error);
  }
};

// Obtener perfil propio
export const getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            dateOfBirth: true,
            createdAt: true,
            lastLogin: true,
          },
        },
      },
    });

    if (!profile) {
      throw new AppError('Perfil no encontrado', 404);
    }

    // Calcular edad
    const birthDate = new Date(profile.user.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    res.status(200).json({
      ...profile,
      age,
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar perfil
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const updateData = req.body;

    // No permitir actualizar userId
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const profile = await prisma.profile.update({
      where: { userId },
      data: updateData,
    });

    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener perfil de otro usuario
export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId!;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            dateOfBirth: true,
            lastLogin: true,
          },
        },
      },
    });

    if (!profile) {
      throw new AppError('Perfil no encontrado', 404);
    }

    // Verificar si está en modo incógnito
    if (profile.incognitoMode && profile.incognitoUntil && profile.incognitoUntil > new Date()) {
      throw new AppError('Este perfil no está disponible', 404);
    }

    // Calcular edad
    const birthDate = new Date(profile.user.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Obtener distancia si ambos tienen localización
    let distance = null;
    if (profile.showDistance) {
      const [myLocation, theirLocation] = await Promise.all([
        prisma.location.findUnique({ where: { userId: currentUserId } }),
        prisma.location.findUnique({ where: { userId } }),
      ]);

      if (myLocation && theirLocation) {
        distance = calculateDistance(
          myLocation.latitude,
          myLocation.longitude,
          theirLocation.latitude,
          theirLocation.longitude
        );
      }
    }

    res.status(200).json({
      id: profile.id,
      name: profile.name,
      age,
      bio: profile.bio,
      gender: profile.gender,
      program: profile.program,
      photos: profile.photos,
      interests: profile.interests,
      hobbies: profile.hobbies,
      relationshipGoal: profile.relationshipGoal,
      distance,
      lastSeen: profile.showLastSeen ? profile.user.lastLogin : null,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener perfiles para descubrimiento
export const getDiscoveryProfiles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { limit = 20, offset = 0 } = req.query;

    // Obtener mi perfil para filtros
    const myProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!myProfile) {
      throw new AppError('Debes completar tu perfil primero', 400);
    }

    // Obtener IDs de usuarios que ya he visto (likes y swipes)
    const [likedUsers, swipedUsers] = await Promise.all([
      prisma.like.findMany({
        where: { userId },
        select: { targetUserId: true },
      }),
      prisma.swipe.findMany({
        where: { userId },
        select: { targetUserId: true },
      }),
    ]);

    const excludedUserIds = [
      userId,
      ...likedUsers.map(l => l.targetUserId),
      ...swipedUsers.map(s => s.targetUserId),
    ];

    // Obtener mi edad
    const myUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { dateOfBirth: true },
    });

    const profiles = await prisma.profile.findMany({
      where: {
        userId: {
          notIn: excludedUserIds,
        },
        incognitoMode: false,
        user: {
          isActive: true,
          isBanned: false,
          verified: true,
        },
      },
      include: {
        user: {
          select: {
            dateOfBirth: true,
            lastLogin: true,
          },
        },
      },
      take: Number(limit),
      skip: Number(offset),
    });

    // Filtrar por edad y calcular datos adicionales
    const profilesWithData = profiles
      .map(profile => {
        const birthDate = new Date(profile.user.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        return {
          id: profile.id,
          userId: profile.userId,
          name: profile.name,
          age,
          bio: profile.bio,
          gender: profile.gender,
          program: profile.program,
          photos: profile.photos,
          interests: profile.interests,
          hobbies: profile.hobbies,
          relationshipGoal: profile.relationshipGoal,
        };
      })
      .filter(p => p.age >= myProfile.minAge && p.age <= myProfile.maxAge);

    res.status(200).json({
      profiles: profilesWithData,
      total: profilesWithData.length,
    });
  } catch (error) {
    next(error);
  }
};

// Función auxiliar para calcular distancia
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
