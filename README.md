# Kora - Dating App para Estudiantes de Pascual Bravo

![Kora](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

**Kora** es una aplicación de conexión y dating exclusiva para estudiantes de la Institución Educativa Técnica Pascual Bravo. Permite a los estudiantes descubrir perfiles compatibles, crear matches, chatear en tiempo real y compartir intereses comunes.

## 🌟 Características Principales

- **Descubrimiento de Perfiles**: Desliza (swipe) entre perfiles con fotos, bios e intereses
- **Sistema de Matches**: Conecta cuando ambos usuarios se marcan mutuamente con "Like"
- **Chat en Tiempo Real**: Mensajería instantánea con notificaciones y read receipts
- **Adjuntos en Chat**: Comparte imágenes y documentos en conversaciones
- **Gestión de Perfil**: Edita tu información, intereses, hobbies y objetivos de relación
- **Localización**: Encuentra usuarios cercanos en el campus
- **Modo Oscuro**: Interfaz adaptable a preferencias visuales
- **Notificaciones Push**: Alertas en tiempo real para nuevos mensajes y matches

## 🚀 Stack Tecnológico

### Frontend
- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Styling utility-first
- **Framer Motion** - Animaciones fluidas
- **React Query** - State management y caching
- **Zustand** - Global state
- **Socket.IO Client** - Comunicación realtime
- **React Hook Form + Zod** - Validación de formularios

### Backend
- **Node.js 18+** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Gestión de base de datos
- **PostgreSQL (Neon)** - Base de datos
- **Socket.IO** - Comunicación bidireccional
- **JWT** - Autenticación
- **Cloudinary** - Almacenamiento de archivos
- **Nodemon** - Auto-reload en desarrollo

## 📋 Requisitos Previos

- Node.js 18+ y npm 9+
- PostgreSQL (o acceso a Neon)
- Git
- Cuenta Cloudinary (para uploads de fotos)
- Cuenta GitHub (para versionado)

## 🛠️ Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Sanchez988/KORA_WEB-ING-SOFTWARE.git
cd Kora_app
```

### 2. Configurar Variables de Entorno

#### Backend `.env`
```
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

#### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Base de Datos

```bash
cd backend
npx prisma migrate dev --name init
```

## 🚴 Desenvolvimento

### Iniciar el Backend
```bash
cd backend
npm run dev
```
El servidor correría en `http://localhost:5000`

### Iniciar el Frontend
```bash
cd frontend
npm run dev
```
La aplicación estaría en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
Kora_app/
├── backend/
│   ├── src/
│   │   ├── config/       # Configuración global
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── routes/       # Definición de rutas
│   │   ├── middleware/   # Middlewares (auth, errors)
│   │   ├── services/     # Lógica de servicios
│   │   ├── utils/        # Utilidades
│   │   └── server.ts     # Entry point
│   ├── prisma/           # ORM y migrations
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas principales
│   │   ├── services/     # API clients
│   │   ├── store/        # State management
│   │   ├── types/        # TypeScript types
│   │   ├── App.tsx       # Root component
│   │   └── main.tsx      # Entry point
│   ├── public/           # Assets estáticos
│   └── package.json
│
└── README.md
```

## 🔐 Autenticación

- **Registro**: Email institucional (@pascualbravo.edu.co) + contraseña fuerte
- **Login**: JWT con refresh tokens
- **Verificación**: Email confirmation en registro
- **Seguridad**: Hash de contraseñas con bcrypt, rate limiting en endpoints sensibles

## 📡 Endpoints Principales

### Auth
- `POST /api/auth/register` - Crear cuenta
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token

### Profiles
- `GET /api/profiles/discovery` - Obtener perfiles para descubrir
- `GET /api/profiles/my-profile` - Mi perfil
- `PUT /api/profiles/my-profile` - Actualizar perfil
- `POST /api/profiles/photos` - Subir fotos

### Matches
- `GET /api/matches` - Mis matches
- `POST /api/matches/like/:userId` - Marcar like
- `POST /api/matches/dislike/:userId` - Marcar no me interesa

### Messages
- `GET /api/messages/:matchId` - Historial de chat
- `POST /api/messages/:matchId` - Enviar mensaje
- `PUT /api/messages/:matchId/read` - Marcar como leído

## 🎨 Diseño y UX

### Paleta de Colores
- **Primario**: `#FF4F7A` (Rosa coral)
- **Secundario**: `#1F8BFF` (Azul eléctrico)
- **Acento**: `#F9B84D` (Dorado cálido)
- **Fondo**: `#F6F7FB` (Blanco frío)

### Tipografía
- **Headings**: Sora (Bold, modern)
- **Body**: Plus Jakarta Sans (Legible)
- **Accents**: Manrope (Distinctive)

## 📦 Build para Producción

### Frontend
```bash
cd frontend
npm run build
```
Genera optimizado en `dist/`

### Backend
```bash
cd backend
npm run build
```

## 🧪 Testing

Actualmente no hay tests automáticos. Se recomienda agregar:
- Unit tests con Jest
- E2E tests con Cypress/Playwright
- Tests de API con Supertest

## 🐛 Bugs Conocidos

- En desarrollo, múltiples puertos Vite (5173/5174) requieren CORS permisivo
- El login inicial puede tardar ~2s en validar credenciales contra Neon

## 🚀 Deploy

### Opciones Recomendadas
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Heroku
- **DB**: Neon PostgreSQL (neon.tech)
- **Storage**: Cloudinary (ya integrado)

## 📚 Documentación Adicional

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 👥 Contribución

Este proyecto fue desarrollado como parte del curso de Ingeniería de Software.

## 📝 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 📧 Contacto

Para preguntas o sugerencias:
- **GitHub**: [Sanchez988](https://github.com/Sanchez988)
- **Repo**: [KORA_WEB-ING-SOFTWARE](https://github.com/Sanchez988/KORA_WEB-ING-SOFTWARE)

---

**Última actualización**: Abril 2026  
**Versión**: 1.0.0  
**Estado**: En desarrollo