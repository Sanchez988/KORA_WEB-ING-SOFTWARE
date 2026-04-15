import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { io } from '../server';

const prisma = new PrismaClient();

// Enviar mensaje
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { matchId, content, images = [], attachmentNames = [], attachmentTypes = [] } = req.body;

    // Verificar que el match existe y el usuario es parte de él
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new AppError('Match no encontrado', 404);
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new AppError('No tienes permiso para enviar mensajes en este match', 403);
    }

    if (!match.isActive) {
      throw new AppError('Este match ya no está activo', 400);
    }

    // Validaciones
    if ((!content || content.trim().length === 0) && images.length === 0) {
      throw new AppError('Debes escribir un mensaje o adjuntar al menos un archivo', 400);
    }

    if (content && content.length > 1000) {
      throw new AppError('El mensaje no puede exceder 1000 caracteres', 400);
    }

    if (images.length !== attachmentNames.length || images.length !== attachmentTypes.length) {
      throw new AppError('Los metadatos de adjuntos no coinciden con los archivos enviados', 400);
    }

    // Detectar contenido inapropiado básico (puedes mejorar esto)
    const inappropriateWords = ['spam', 'enlace']; // Lista básica
    const hasInappropriateContent = inappropriateWords.some(word =>
      (content || '').toLowerCase().includes(word)
    );

    if (hasInappropriateContent) {
      throw new AppError('El mensaje contiene contenido inapropiado', 400);
    }

    // Crear mensaje
    const message = await prisma.message.create({
      data: {
        matchId,
        senderId: userId,
        content,
        images,
        attachmentNames,
        attachmentTypes,
      },
      include: {
        sender: {
          include: {
            profile: {
              select: {
                name: true,
                photos: true,
              },
            },
          },
        },
      },
    });

    const recipientUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
    const notificationPayload = {
      matchId,
      messageId: message.id,
      senderId: userId,
      content: message.content,
      images: message.images,
      attachmentNames: message.attachmentNames,
      attachmentTypes: message.attachmentTypes,
      sentAt: message.sentAt,
      sender: {
        name: message.sender.profile?.name,
        photo: message.sender.profile?.photos[0],
      },
    };

    // Emitir mensaje via Socket.IO
    io.to(matchId).emit('new_message', {
      messageId: message.id,
      matchId,
      senderId: userId,
      content: message.content,
      images: message.images,
      attachmentNames: message.attachmentNames,
      attachmentTypes: message.attachmentTypes,
      sentAt: message.sentAt,
      sender: {
        name: message.sender.profile?.name,
        photo: message.sender.profile?.photos[0],
      },
    });

    // Emitir notificacion global al destinatario para mostrar badge/toast
    io.to(`user:${recipientUserId}`).emit('new_message_notification', notificationPayload);

    res.status(201).json({
      message: 'Mensaje enviado',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener mensajes de un match
export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    // Verificar que el match existe y el usuario es parte de él
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new AppError('Match no encontrado', 404);
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new AppError('No tienes permiso para ver estos mensajes', 403);
    }

    const messages = await prisma.message.findMany({
      where: {
        matchId,
        deletedAt: null,
      },
      include: {
        sender: {
          include: {
            profile: {
              select: {
                name: true,
                photos: true,
              },
            },
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: Number(limit),
      skip: Number(offset),
    });

    const unreadMessages = messages.filter((message) => message.senderId !== userId && !message.isRead);

    // Marcar mensajes como leídos
    await prisma.message.updateMany({
      where: {
        matchId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    if (unreadMessages.length > 0) {
      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
      io.to(`user:${otherUserId}`).emit('messages_read', {
        matchId,
        readerId: userId,
        readAt: new Date().toISOString(),
      });
    }

    res.status(200).json({
      messages: messages
        .map((message) =>
          message.senderId !== userId ? { ...message, isRead: true, readAt: new Date() } : message
        )
        .reverse(),
      total: messages.length,
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar mensaje
export const deleteMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError('Mensaje no encontrado', 404);
    }

    if (message.senderId !== userId) {
      throw new AppError('Solo puedes eliminar tus propios mensajes', 403);
    }

    // Verificar que no haya pasado más de 1 hora
    const oneHourAgo = new Date(Date.now() - 3600000);
    if (message.sentAt < oneHourAgo) {
      throw new AppError('Solo puedes eliminar mensajes enviados hace menos de 1 hora', 400);
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        deletedAt: new Date(),
      },
    });

    // Emitir evento de eliminación
    io.to(message.matchId).emit('message_deleted', {
      messageId,
      matchId: message.matchId,
    });

    res.status(200).json({
      message: 'Mensaje eliminado',
    });
  } catch (error) {
    next(error);
  }
};

// Marcar mensajes como leídos
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { matchId } = req.body;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new AppError('Match no encontrado', 404);
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new AppError('No tienes permiso para marcar estos mensajes', 403);
    }

    const result = await prisma.message.updateMany({
      where: {
        matchId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    if (result.count > 0) {
      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
      io.to(`user:${otherUserId}`).emit('messages_read', {
        matchId,
        readerId: userId,
        readAt: new Date().toISOString(),
      });
    }

    res.status(200).json({
      message: 'Mensajes marcados como leídos',
    });
  } catch (error) {
    next(error);
  }
};
