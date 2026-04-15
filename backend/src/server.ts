import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Importar rutas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import profileRoutes from './routes/profile.routes';
import matchRoutes from './routes/match.routes';
import messageRoutes from './routes/message.routes';
import reportRoutes from './routes/report.routes';
import uploadRoutes from './routes/upload.routes';
import locationRoutes from './routes/location.routes';

const app: Application = express();
const httpServer = createServer(app);
const allowedOrigins = config.env === 'development'
  ? Array.from(new Set([...config.frontendUrls, 'http://localhost:5173', 'http://localhost:5174']))
  : config.frontendUrls;

const isAllowedOrigin = (origin?: string) => {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin);
};

// Configurar Socket.IO
export const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/location', locationRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler (debe ir al final)
app.use(errorHandler);

// Socket.IO events
io.on('connection', (socket) => {
  logger.info(`Usuario conectado: ${socket.id}`);

  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      socket.join(`user:${decoded.userId}`);
      logger.info(`Socket ${socket.id} unido al canal user:${decoded.userId}`);
    } catch (error) {
      logger.warn(`Socket ${socket.id} conectado con token invalido`);
    }
  }

  socket.on('join_room', (matchId: string) => {
    socket.join(matchId);
    logger.info(`Usuario ${socket.id} se unió a la sala ${matchId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.matchId).emit('receive_message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.matchId).emit('user_typing', data);
  });

  socket.on('disconnect', () => {
    logger.info(`Usuario desconectado: ${socket.id}`);
  });
});

// Iniciar servidor
const PORT = config.port;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
  logger.info(`🌐 Ambiente: ${config.env}`);
  logger.info(`📡 URL: ${config.apiUrl}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

export default app;
