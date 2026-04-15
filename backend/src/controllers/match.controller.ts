import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { io } from '../server';

const prisma = new PrismaClient();

// Dar like a un perfil
export const likeProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { targetUserId, isSuperLike = false } = req.body;

    if (userId === targetUserId) {
      throw new AppError('No puedes darte like a ti mismo', 400);
    }

    // Verificar que el usuario objetivo existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { profile: true },
    });

    if (!targetUser || !targetUser.profile) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar si ya existe un like
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_targetUserId: {
          userId,
          targetUserId,
        },
      },
    });

    if (existingLike) {
      throw new AppError('Ya diste like a este perfil', 400);
    }

    // Crear like
    const like = await prisma.like.create({
      data: {
        userId,
        targetUserId,
        isSuperLike,
      },
    });

    // Registrar swipe (upsert para evitar error si ya hubo swipe previo)
    await prisma.swipe.upsert({
      where: {
        userId_targetUserId: {
          userId,
          targetUserId,
        },
      },
      update: {
        isLike: true,
      },
      create: {
        userId,
        targetUserId,
        isLike: true,
      },
    });

    // Verificar si hay match (el otro usuario también dio like)
    const reciprocalLike = await prisma.like.findUnique({
      where: {
        userId_targetUserId: {
          userId: targetUserId,
          targetUserId: userId,
        },
      },
    });

    let match = null;
    if (reciprocalLike) {
      // ¡Es un match! (upsert para evitar conflicto por unique si ya existe)
      const normalizedUser1Id = userId < targetUserId ? userId : targetUserId;
      const normalizedUser2Id = userId < targetUserId ? targetUserId : userId;

      match = await prisma.match.upsert({
        where: {
          user1Id_user2Id: {
            user1Id: normalizedUser1Id,
            user2Id: normalizedUser2Id,
          },
        },
        update: {
          isActive: true,
          unmatchedAt: null,
          unmatchedBy: null,
        },
        create: {
          user1Id: normalizedUser1Id,
          user2Id: normalizedUser2Id,
        },
        include: {
          user1: {
            include: { profile: true },
          },
          user2: {
            include: { profile: true },
          },
        },
      });

      // Emitir evento de match a ambos usuarios via Socket.IO
      io.emit(`match:${userId}`, {
        matchId: match.id,
        user: targetUser.profile,
      });
      io.emit(`match:${targetUserId}`, {
        matchId: match.id,
        user: req.user,
      });
    }

    // Si es super like, notificar al usuario objetivo
    if (isSuperLike) {
      io.emit(`superlike:${targetUserId}`, {
        from: req.user,
      });
    }

    res.status(201).json({
      message: match ? '¡Es un match! 🎉' : 'Like enviado',
      like,
      match,
      isMatch: !!match,
    });
  } catch (error) {
    next(error);
  }
};

// Dar dislike (nope)
export const dislikeProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { targetUserId } = req.body;

    // Registrar swipe negativo
    await prisma.swipe.upsert({
      where: {
        userId_targetUserId: {
          userId,
          targetUserId,
        },
      },
      update: {
        isLike: false,
      },
      create: {
        userId,
        targetUserId,
        isLike: false,
      },
    });

    res.status(200).json({
      message: 'Perfil descartado',
    });
  } catch (error) {
    next(error);
  }
};

// Obtener mis matches
export const getMyMatches = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        isActive: true,
      },
      include: {
        user1: {
          include: { profile: true },
        },
        user2: {
          include: { profile: true },
        },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        matchedAt: 'desc',
      },
    });

    const matchesWithDetails = matches.map((match: any) => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1;
      const lastMessage = match.messages[0] || null;

      return {
        matchId: match.id,
        matchedAt: match.matchedAt,
        user: {
          id: otherUser.id,
          name: otherUser.profile?.name,
          photos: otherUser.profile?.photos,
          bio: otherUser.profile?.bio,
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content || (lastMessage.images.length > 0 ? 'Adjunto' : ''),
              sentAt: lastMessage.sentAt,
              senderId: lastMessage.senderId,
              isRead: lastMessage.isRead,
            }
          : null,
      };
    });

    res.status(200).json({
      matches: matchesWithDetails,
      total: matchesWithDetails.length,
    });
  } catch (error) {
    next(error);
  }
};

// Deshacer match
export const unmatch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new AppError('Match no encontrado', 404);
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new AppError('No tienes permiso para deshacer este match', 403);
    }

    await prisma.match.update({
      where: { id: matchId },
      data: {
        isActive: false,
        unmatchedAt: new Date(),
        unmatchedBy: userId,
      },
    });

    res.status(200).json({
      message: 'Match deshecho exitosamente',
    });
  } catch (error) {
    next(error);
  }
};
