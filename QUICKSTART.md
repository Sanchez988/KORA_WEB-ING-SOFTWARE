# Guía de Inicio Rápido - Kora App

## 🚀 Instalación Rápida

### 1. Instalar Backend

```powershell
# Navegar a backend
cd backend

# Instalar dependencias
npm install

# Configurar .env
copy .env.example .env

# Crear base de datos PostgreSQL
createdb kora_db

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar servidor
npm run dev
```

### 2. Instalar Frontend

```powershell
# Abrir nueva terminal y navegar a frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor
npm run dev
```

### 3. Acceder a la Aplicación

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Prisma Studio: npx prisma studio (en carpeta backend)

## 📝 Configuración Esencial

### Backend .env

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/kora_db"
JWT_SECRET=tu_secreto_super_largo_minimo_32_caracteres_cambiar_en_produccion
JWT_REFRESH_SECRET=tu_refresh_secreto_super_largo_minimo_32_caracteres
FRONTEND_URL=http://localhost:5173
```

### Email (opcional para desarrollo)

Si quieres probar el envío de emails:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
```

## ✅ Checklist de Instalación

- [ ] Node.js instalado (v20+)
- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `kora_db` creada
- [ ] Dependencias del backend instaladas
- [ ] Archivo .env configurado
- [ ] Migraciones de Prisma ejecutadas
- [ ] Backend corriendo en puerto 5000
- [ ] Dependencias del frontend instaladas
- [ ] Frontend corriendo en puerto 5173

## 🎯 Primer Uso

1. Abre http://localhost:5173
2. Haz clic en "Regístrate"
3. Usa un email tipo: test@pascualbravo.edu.co
4. Completa registro (fecha de nacimiento: mayor de 18 años)
5. Para desarrollo, puedes verificar manualmente en la BD o saltarte verificación
6. Crea tu perfil
7. ¡Empieza a usar Kora!

## 🔧 Comandos Útiles

```powershell
# Ver logs del backend
cd backend
npm run dev

# Ver logs del frontend
cd frontend
npm run dev

# Abrir Prisma Studio (administrar BD)
cd backend
npx prisma studio

# Reset de base de datos
npx prisma migrate reset

# Generar nuevas migraciones
npx prisma migrate dev --name nombre_migracion
```

## 💡 Tips para Desarrollo

1. **Usar dos terminales:** una para backend, otra para frontend
2. **Prisma Studio** es tu amigo para ver/editar datos
3. **React Query Devtools** te ayudará a debugear el frontend
4. Los logs del backend muestran todas las peticiones
5. Hot reload está activado en ambos (backend y frontend)

## 🐛 Solución de Problemas Comunes

**Error PostgreSQL:**
```powershell
# Verifica que PostgreSQL esté corriendo
pg_ctl status

# O reinicia el servicio
pg_ctl restart
```

**Puerto ocupado:**
```powershell
# Mata proceso en puerto 5000
npx kill-port 5000

# Mata proceso en puerto 5173
npx kill-port 5173
```

**Migraciones rotas:**
```powershell
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

## 📚 Recursos

- [README Principal](./README.md)
- [Especificación Completa](./Especificación_Requerimientos_Kora.md)
- [Documentación Prisma](https://www.prisma.io/docs)
- [Documentación React](https://react.dev)

---

¡Listo para empezar! 🎉
