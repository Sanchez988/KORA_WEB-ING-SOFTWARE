# Especificación de Requerimientos - Kora App
## Aplicación de Citas Universitaria

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Institución:** Institución Universitaria Pascual Bravo  
**Proyecto:** Kora - Plataforma de Conexión Universitaria

---

## 1. VISIÓN Y ALCANCE DEL PROYECTO

### 1.1 Problema Identificado
Los estudiantes universitarios carecen de una plataforma segura, verificada y segmentada para conocer personas dentro de su entorno académico. Las aplicaciones existentes no priorizan la verificación institucional ni la seguridad específica del contexto universitario.

### 1.2 Objetivo del Proyecto
Desarrollar una aplicación web responsiva que permita a estudiantes universitarios mayores de 18 años de la Institución Universitaria Pascual Bravo conectar de forma segura, con verificación institucional y herramientas de privacidad robustas.

### 1.3 Stakeholders
- **Usuarios Principales:** Estudiantes universitarios mayores de 18 años
- **Usuarios Secundarios:** Administradores del sistema
- **Institución:** Universidad Pascual Bravo (validación institucional)
- **Equipo Técnico:** Desarrolladores, diseñadores UX/UI, QA testers

---

## 2. REQUERIMIENTOS FUNCIONALES CON CRITERIOS DE ACEPTACIÓN

### RF-001: Registro de Usuario (MUST HAVE)

**Descripción:** El sistema debe permitir el registro de nuevos usuarios mediante correo institucional.

**Historia de Usuario:**
> *"Como estudiante de Pascual Bravo, quiero registrarme con mi correo institucional para acceder a una plataforma exclusiva de mi universidad."*

**Criterios de Aceptación:**
- CA-001.1: El sistema DEBE validar que el correo termine en `@pascualbravo.edu.co`
- CA-001.2: La contraseña DEBE tener mínimo 8 caracteres, incluyendo al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&#)
- CA-001.3: El sistema DEBE mostrar indicador de fortaleza de contraseña en tiempo real
- CA-001.4: El sistema DEBE enviar correo de verificación dentro de los 60 segundos posteriores al registro
- CA-001.5: El enlace de verificación DEBE expirar después de 24 horas
- CA-001.6: El sistema DEBE prevenir registros duplicados del mismo correo
- CA-001.7: Los campos DEBEN validarse en el frontend y backend

**Validaciones Técnicas:**
```javascript
Validaciones de Campo:
- email: regex /^[a-zA-Z0-9._-]+@pascualbravo\.edu\.co$/
- contraseña: regex /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/
- términos y condiciones: checkbox obligatorio
```

**Mensajes de Error:**
- "El correo debe pertenecer al dominio @pascualbravo.edu.co"
- "La contraseña no cumple con los requisitos de seguridad"
- "Este correo ya está registrado. ¿Deseas recuperar tu contraseña?"

---

### RF-002: Verificación de Mayoría de Edad (MUST HAVE)

**Descripción:** El sistema debe verificar que el usuario es mayor de 18 años antes de permitir el acceso.

**Historia de Usuario:**
> *"Como administrador, necesito garantizar que todos los usuarios sean mayores de edad para cumplir con normativas legales."*

**Criterios de Aceptación:**
- CA-002.1: El sistema DEBE solicitar fecha de nacimiento durante el registro
- CA-002.2: El sistema DEBE calcular la edad exacta comparando con la fecha actual
- CA-002.3: Si el usuario es menor de 18 años, el sistema DEBE bloquear el registro y mostrar: "Debes ser mayor de 18 años para usar Kora"
- CA-002.4: El sistema DEBE validar que la fecha no sea futura
- CA-002.5: El sistema DEBE validar formato DD/MM/YYYY
- CA-002.6: La edad DEBE mostrarse en el perfil (calculada automáticamente)

**Validaciones Técnicas:**
```javascript
Validación de Edad:
- fecha_nacimiento: formato ISO 8601 (YYYY-MM-DD)
- edad_minima: 18 años completos
- edad_maxima: 100 años (validación de sensatez)
- cálculo: diferencia entre fecha actual y fecha de nacimiento
```

---

### RF-003: Inicio de Sesión Seguro (MUST HAVE)

**Descripción:** El sistema debe permitir a usuarios registrados iniciar sesión de forma segura.

**Historia de Usuario:**
> *"Como usuario registrado, quiero iniciar sesión de forma rápida y segura para acceder a mi perfil."*

**Criterios de Aceptación:**
- CA-003.1: El sistema DEBE autenticar mediante correo institucional y contraseña
- CA-003.2: Después de 5 intentos fallidos, el sistema DEBE bloquear la cuenta por 15 minutos
- CA-003.3: El sistema DEBE generar token JWT con expiración de 24 horas
- CA-003.4: El sistema DEBE ofrecer opción "Recordar sesión" (30 días)
- CA-003.5: El sistema DEBE mostrar último acceso después de iniciar sesión
- CA-003.6: El sistema DEBE ofrecer recuperación de contraseña
- CA-003.7: El sistema DEBE cerrar sesiones anteriores si se detecta acceso desde nuevo dispositivo (opcional, configurable)

**Validaciones de Seguridad:**
- Contraseñas encriptadas con bcrypt (salt rounds: 12)
- Tokens JWT firmados con clave secreta de 256 bits
- HTTPS obligatorio en producción
- Headers de seguridad: HSTS, X-Frame-Options, CSP

---

### RF-004: Creación de Perfil Detallado (MUST HAVE)

**Descripción:** El usuario debe poder crear un perfil completo con información personal, académica y de intereses.

**Historia de Usuario:**
> *"Como usuario nuevo, quiero crear un perfil atractivo que refleje mi personalidad y mis intereses para conectar con personas afines."*

**Criterios de Aceptación:**
- CA-004.1: El usuario DEBE subir entre 2 y 6 fotos (mínimo 2)
- CA-004.2: Las fotos DEBEN ser formato JPG, PNG o WebP, máximo 5MB cada una
- CA-004.3: El sistema DEBE comprimir automáticamente las imágenes manteniendo calidad
- CA-004.4: La biografía DEBE tener entre 50 y 500 caracteres
- CA-004.5: El usuario DEBE seleccionar su programa académico de una lista predefinida
- CA-004.6: El usuario DEBE seleccionar al menos 3 intereses de un catálogo
- CA-004.7: El usuario DEBE indicar el objetivo: "Amistad", "Cita", "Relación seria" o "Conocer gente"
- CA-004.8: El sistema DEBE validar contenido inapropiado en texto e imágenes
- CA-004.9: El perfil DEBE tener indicador de completitud (%)

**Campos del Perfil:**
```yaml
Información Básica:
  - Nombre: [texto, 2-50 caracteres, obligatorio]
  - Edad: [calculada automáticamente, visible]
  - Género: [opciones: Hombre/Mujer/Otro/Prefiero no decir, obligatorio]
  - Programa académico: [lista desplegable, obligatorio]
  - Semestre: [número 1-12, opcional]

Información Visual:
  - Fotos: [2-6 imágenes, obligatorio mínimo 2]
  - Foto principal: [primera foto por defecto, reordenable]

Información Personal:
  - Biografía: [textarea, 50-500 caracteres, obligatorio]
  - Intereses: [multi-selección, mínimo 3, máximo 10]
  - Hobbies: [tags personalizados, máximo 8]
  - Objetivo: [radio button, obligatorio]

Preferencias de Conexión:
  - Rango de edad: [slider, 18-30 por defecto]
  - Distancia máxima: [slider, dentro del campus/ciudad]
  - Mostrar mi perfil a: [Todos/Solo mi género/Personalizado]
```

**Validaciones de Contenido:**
- Detección de palabras ofensivas en biografía
- Validación de imágenes (sin contenido explícito)
- Verificación de autenticidad (foto de persona real)

---

### RF-005: Edición de Perfil (MUST HAVE)

**Descripción:** El usuario debe poder modificar su información de perfil en cualquier momento.

**Criterios de Aceptación:**
- CA-005.1: El usuario DEBE poder cambiar fotos, biografía, intereses y hobbies
- CA-005.2: El usuario NO DEBE poder cambiar fecha de nacimiento (seguridad)
- CA-005.3: Los cambios DEBEN guardarse automáticamente al salir de cada sección
- CA-005.4: El sistema DEBE mostrar confirmación de guardado exitoso
- CA-005.5: El sistema DEBE permitir previsualizar cambios antes de publicar
- CA-005.6: Los cambios DEBEN reflejarse inmediatamente en la interfaz

---

### RF-006: Visualización de Perfiles (MUST HAVE)

**Descripción:** El sistema debe mostrar perfiles de otros usuarios de forma atractiva e intuitiva.

**Historia de Usuario:**
> *"Como usuario, quiero ver perfiles de otros estudiantes de forma clara y atractiva para decidir si me interesan."*

**Criterios de Aceptación:**
- CA-006.1: El sistema DEBE mostrar perfiles en formato de tarjetas deslizables (estilo Tinder)
- CA-006.2: El sistema DEBE mostrar: foto principal, nombre, edad, programa y biografía resumida
- CA-006.3: Al tocar/hacer clic en el perfil, DEBE expandirse mostrando toda la información
- CA-006.4: El sistema DEBE mostrar indicador de usuario activo (última conexión)
- CA-006.5: El sistema DEBE aplicar filtros de preferencias automáticamente
- CA-006.6: El sistema NO DEBE mostrar perfiles ya descartados o con match existente
- CA-006.7: El sistema DEBE ordenar perfiles por compatibilidad (algoritmo de matching)

**Animaciones y UX:**
- Transiciones suaves entre tarjetas (300ms)
- Deslizamiento táctil intuitivo
- Indicadores visuales de like/nope
- Efectos de partículas en match exitoso

---

### RF-007: Sistema de Like/Dislike (MUST HAVE)

**Descripción:** El usuario debe poder indicar interés o desinterés en otros perfiles.

**Criterios de Aceptación:**
- CA-007.1: El usuario DEBE poder dar "like" deslizando a la derecha o tocando botón ❤️
- CA-007.2: El usuario DEBE poder dar "nope" deslizando a la izquierda o tocando botón ✖️
- CA-007.3: El sistema DEBE permitir "super like" (máximo 1 por día) con animación especial ⭐
- CA-007.4: El sistema DEBE permitir deshacer la última acción (1 deshacer gratis cada 3 horas)
- CA-007.5: El sistema DEBE registrar todas las interacciones en base de datos
- CA-007.6: El sistema NO DEBE notificar al usuario rechazado
- CA-007.7: Los "likes" DEBEN almacenarse incluso si no hay match inmediato

---

### RF-008: Sistema de Match (MUST HAVE)

**Descripción:** Cuando dos usuarios se dan like mutuamente, se genera un "match".

**Historia de Usuario:**
> *"Como usuario, quiero recibir una notificación emocionante cuando alguien que me gusta también le gusto yo."*

**Criterios de Aceptación:**
- CA-008.1: El sistema DEBE detectar match inmediatamente cuando hay like mutuo
- CA-008.2: El sistema DEBE mostrar pantalla de celebración con animación
- CA-008.3: El sistema DEBE enviar notificación push a ambos usuarios
- CA-008.4: El sistema DEBE crear sala de chat automáticamente
- CA-008.5: El sistema DEBE mostrar mensaje sugerido para romper el hielo
- CA-008.6: Los matches DEBEN aparecer en sección "Mis Matches"
- CA-008.7: El sistema DEBE permitir deshacer match (con confirmación)

**Pantalla de Match:**
```
[Animación de confetti/fuegos artificiales]
"¡Es un Match! 🎉"
[Foto Usuario A] ❤️ [Foto Usuario B]
"A ambos les gustaron mutuamente"
[Botón: Enviar Mensaje]
[Botón: Seguir Deslizando]
```

---

### RF-009: Sistema de Filtros Avanzados (SHOULD HAVE)

**Descripción:** El usuario debe poder filtrar perfiles según sus preferencias.

**Criterios de Aceptación:**
- CA-009.1: El sistema DEBE ofrecer filtro por rango de edad (18-30+)
- CA-009.2: El sistema DEBE ofrecer filtro por programa académico
- CA-009.3: El sistema DEBE ofrecer filtro por intereses comunes (mínimo coincidencias)
- CA-009.4: El sistema DEBE ofrecer filtro por objetivo (amistad/cita/relación)
- CA-009.5: El sistema DEBE ofrecer filtro por distancia (campus/ciudad/todo)
- CA-009.6: Los filtros DEBEN aplicarse en tiempo real
- CA-009.7: El sistema DEBE mostrar número de perfiles disponibles con filtros activos

**Filtros Disponibles:**
```yaml
Filtros Básicos (MUST):
  - Rango de edad: [slider 18-30+]
  - Programa académico: [multi-selección]
  - Objetivo: [checkboxes]

Filtros Avanzados (SHOULD):
  - Intereses comunes: [mínimo 1, 2, 3, 5]
  - Distancia: [dentro campus / ciudad / sin límite]
  - Activo recientemente: [última hora / último día / última semana]
  - Mostrar solo perfiles completos: [toggle]
```

---

### RF-010: Sistema de Mensajería (MUST HAVE)

**Descripción:** Usuarios con match deben poder comunicarse mediante chat en tiempo real.

**Historia de Usuario:**
> *"Como usuario con un match, quiero chatear en tiempo real para conocer mejor a esa persona."*

**Criterios de Aceptación:**
- CA-010.1: Solo usuarios con match DEBEN poder enviarse mensajes
- CA-010.2: El sistema DEBE mostrar indicador de "escribiendo..." en tiempo real
- CA-010.3: El sistema DEBE mostrar estado de mensaje: enviado ✓, entregado ✓✓, leído ✓✓ (azul)
- CA-010.4: El sistema DEBE soportar texto, emojis y GIFs
- CA-010.5: El sistema DEBE permitir enviar hasta 3 imágenes por mensaje
- CA-010.6: El sistema DEBE notificar mensajes nuevos (push + badge)
- CA-010.7: El sistema DEBE mostrar timestamp de cada mensaje
- CA-010.8: El sistema DEBE permitir eliminar mensajes propios (hasta 1 hora después)
- CA-010.9: El sistema DEBE cargar historial de conversación (últimos 100 mensajes)
- CA-010.10: El sistema DEBE bloquear envío de enlaces externos (seguridad)

**Características de Seguridad del Chat:**
- Encriptación de mensajes en tránsito (TLS 1.3)
- Almacenamiento temporal (30 días inactivo → eliminación automática)
- Detección de contenido inapropiado
- Opción de reportar conversación

**Interfaz del Chat:**
```
[Header: Foto + Nombre + Estado Online]
[Área de mensajes con scroll infinito]
[Input: Texto + Emojis + GIF + Imagen]
[Botón Enviar]
```

---

### RF-011: Sistema de Reportes y Moderación (MUST HAVE)

**Descripción:** Los usuarios deben poder reportar perfiles o conversaciones inapropiadas.

**Historia de Usuario:**
> *"Como usuario, necesito poder reportar comportamientos inapropiados para mantener la comunidad segura."*

**Criterios de Aceptación:**
- CA-011.1: El sistema DEBE mostrar botón de reporte en cada perfil
- CA-011.2: El sistema DEBE ofrecer motivos predefinidos: Contenido inapropiado, Acoso, Spam, Suplantación, Menor de edad, Otro
- CA-011.3: El sistema DEBE permitir agregar comentario adicional (opcional, máx. 500 caracteres)
- CA-011.4: El sistema DEBE enviar reporte al panel de administración
- CA-011.5: El sistema DEBE ocultar inmediatamente el perfil reportado para quien reporta
- CA-011.6: Después de 3 reportes, el sistema DEBE suspender automáticamente la cuenta (revisión pendiente)
- CA-011.7: El sistema DEBE notificar al usuario sobre el estado de su reporte
- CA-011.8: El sistema DEBE mantener registro de todos los reportes

**Panel de Moderación (Administrador):**
- Vista de reportes pendientes
- Historial del usuario reportado
- Acciones: Advertencia, Suspensión temporal, Baneo permanente
- Sistema de appeals (apelaciones)

---

### RF-012: Eliminación de Cuenta (MUST HAVE)

**Descripción:** El usuario debe poder eliminar su cuenta permanentemente.

**Criterios de Aceptación:**
- CA-012.1: El sistema DEBE mostrar opción "Eliminar cuenta" en configuración
- CA-012.2: El sistema DEBE solicitar confirmación mediante contraseña
- CA-012.3: El sistema DEBE mostrar advertencia clara de que la acción es irreversible
- CA-012.4: El sistema DEBE eliminar: perfil, fotos, matches, conversaciones
- CA-012.5: El sistema DEBE mantener reportes históricos (anonimizados)
- CA-012.6: El sistema DEBE enviar correo de confirmación de eliminación
- CA-012.7: El usuario DEBE poder reactivar cuenta dentro de 30 días (datos en cuarentena)
- CA-012.8: Después de 30 días, el sistema DEBE eliminar permanentemente todos los datos

---

### RF-013: Localización y Proximidad (NEW - MUST HAVE)

**Descripción:** El sistema debe usar geolocalización para mostrar usuarios cercanos dentro del campus o ciudad.

**Historia de Usuario:**
> *"Como usuario, quiero ver personas que estén cerca de mí en el campus para facilitar encuentros reales."*

**Criterios de Aceptación:**
- CA-013.1: El sistema DEBE solicitar permisos de geolocalización al usuario
- CA-013.2: La localización DEBE ser opcional (usuario puede rechazar)
- CA-013.3: El sistema DEBE actualizar ubicación solo cuando la app está activa
- CA-013.4: El sistema DEBE mostrar distancia aproximada: "Menos de 1 km", "1-5 km", "5-10 km", "Más de 10 km"
- CA-013.5: El sistema NO DEBE mostrar ubicación exacta (solo proximidad)
- CA-013.6: El sistema DEBE permitir activar/desactivar localización en tiempo real
- CA-013.7: El sistema DEBE ofrecer modo "Solo Campus" (detectar si está en la universidad)
- CA-013.8: La ubicación NO DEBE guardarse permanentemente (solo en sesión activa)

**Configuración de Privacidad de Localización:**
```yaml
Opciones:
  - Desactivada: "No mostrar mi ubicación"
  - Solo Campus: "Mostrar solo cuando esté en la universidad"
  - Ciudad: "Mostrar dentro de la ciudad"
  - Distancia personalizada: [slider 1-50 km]

Seguridad:
  - No almacenar historial de ubicaciones
  - Encriptar coordenadas en tránsito
  - Permitir ubicación falsa (modo privado en ubicación fija)
```

---

### RF-014: Configuración de Privacidad Avanzada (NEW - MUST HAVE)

**Descripción:** El usuario debe tener control granular sobre su privacidad y visibilidad.

**Criterios de Aceptación:**
- CA-014.1: El sistema DEBE ofrecer modo "Incógnito" (invisible durante 24h)
- CA-014.2: El sistema DEBE permitir ocultar perfil de usuarios específicos
- CA-014.3: El sistema DEBE permitir ocultar última conexión
- CA-014.4: El sistema DEBE permitir desactivar confirmaciones de lectura
- CA-014.5: El sistema DEBE permitir limitar quién puede verme: "Todos", "Solo a quienes di like", "Nadie"
- CA-014.6: El sistema DEBE permitir pausar cuenta (invisible sin eliminar datos)
- CA-014.7: El sistema DEBE mostrar quién visitó mi perfil (opcional)

**Panel de Privacidad:**
```yaml
Visibilidad:
  - Estado del perfil: [Activo / Pausado / Incógnito]
  - Mostrar última conexión: [Sí / No / Solo a matches]
  - Mostrar distancia: [Sí / Approximada / No]

Comunicación:
  - Confirmaciones de lectura: [Activadas / Desactivadas]
  - Permitir mensajes de: [Todos los matches / Seleccionados]

Datos:
  - Descargar mis datos: [Botón]
  - Ver política de privacidad: [Enlace]
  - Gestionar permisos: [Cámara, Ubicación, Notificaciones]
```

---

### RF-015: Notificaciones Inteligentes (SHOULD HAVE)

**Descripción:** El sistema debe enviar notificaciones relevantes sin ser invasivo.

**Criterios de Aceptación:**
- CA-015.1: El sistema DEBE notificar nuevos matches inmediatamente
- CA-015.2: El sistema DEBE notificar mensajes nuevos (agrupados si son múltiples)
- CA-015.3: El sistema DEBE enviar resumen diario de actividad (configurable)
- CA-015.4: El sistema NO DEBE enviar más de 5 notificaciones por hora
- CA-015.5: El usuario DEBE poder personalizar tipos de notificaciones
- CA-015.6: El sistema DEBE respetar modo "No molestar" (22:00 - 08:00 configurable)
- CA-015.7: Las notificaciones DEBEN incluir acción rápida (responder desde notificación)

**Tipos de Notificaciones:**
```yaml
Push Notifications:
  - Nuevo match: "¡Match con [Nombre]! 🎉"
  - Mensaje nuevo: "[Nombre]: [Preview del mensaje]"
  - Super like recibido: "¡A [Nombre] le encantó tu perfil! ⭐"
  - Perfil visitado: "[X] personas vieron tu perfil hoy"

Email Notifications:
  - Resumen semanal de actividad
  - Matches que no han iniciado conversación
  - Recordatorio de cuenta pausada
```

---

## 3. REQUERIMIENTOS NO FUNCIONALES

### RNF-001: Rendimiento (MUST HAVE)

**Criterios de Aceptación:**
- El tiempo de respuesta del servidor DEBE ser inferior a 2 segundos para el 95% de las solicitudes
- El sistema DEBE soportar mínimo 500 usuarios concurrentes
- El sistema DEBE soportar picos de 1000 usuarios concurrentes durante horarios de almuerzo (12:00-14:00)
- La carga inicial de la aplicación NO DEBE exceder 3 segundos en conexión 4G
- Las imágenes DEBEN cargarse con lazy loading y progressive enhancement
- El sistema DEBE implementar caché eficiente (Redis)
- El chat DEBE mostrar mensajes con latencia inferior a 500ms

**Métricas Medibles:**
```yaml
Performance Budget:
  - First Contentful Paint: < 1.5s
  - Time to Interactive: < 3s
  - Total Bundle Size: < 300 KB (gzip)
  - Image Loading: < 1s (WebP optimizado)
  - API Response Time: < 2s (p95)
  - WebSocket Latency: < 500ms
```

---

### RNF-002: Seguridad (MUST HAVE)

**Criterios de Aceptación:**
- Las contraseñas DEBEN encriptarse con bcrypt (12 salt rounds mínimo)
- El sistema DEBE usar HTTPS exclusivamente (TLS 1.3)
- Los tokens JWT DEBEN expirar en 24 horas y usar refresh tokens
- El sistema DEBE implementar protección CSRF
- El sistema DEBE sanitizar todas las entradas para prevenir XSS
- El sistema DEBE usar prepared statements para prevenir SQL injection
- El sistema DEBE implementar rate limiting: 100 requests/minuto por usuario
- El sistema DEBE registrar todos los intentos de acceso fallidos
- Las sesiones DEBEN invalidarse después de 30 minutos de inactividad

**Headers de Seguridad Obligatorios:**
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self'; script-src 'self'
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(self), camera=(), microphone=()
```

**Auditorías de Seguridad:**
- Penetration testing trimestral
- Dependency vulnerability scanning (Snyk/Dependabot)
- Code security analysis (SonarQube)
- OWASP Top 10 compliance

---

### RNF-003: Usabilidad e Interfaz Moderna (MUST HAVE)

**Criterios de Aceptación:**
- La interfaz DEBE ser completamente responsiva (móvil, tablet, desktop)
- El diseño DEBE seguir principios de Material Design 3 o similar
- La paleta de colores DEBE ser juvenil, vibrante y moderna
- El sistema DEBE soportar modo claro y modo oscuro
- La navegación DEBE ser intuitiva con máximo 3 clics para cualquier función
- El sistema DEBE mostrar feedback visual inmediato para todas las acciones
- Los formularios DEBEN tener validación en tiempo real
- El sistema DEBE ser accesible (WCAG 2.1 nivel AA)
- El sistema DEBE funcionar sin conexión para funciones básicas (PWA)

**Paleta de Colores Sugerida (Juvenil y Moderna):**
```css
:root {
  /* Colores Primarios */
  --primary: #FF6B9D;        /* Rosa vibrante */
  --primary-dark: #E94E7B;
  --primary-light: #FFB3C6;
  
  /* Colores Secundarios */
  --secondary: #4A90E2;       /* Azul moderno */
  --accent: #FFC947;          /* Amarillo energético */
  
  /* Colores de Estado */
  --success: #26D07C;
  --error: #FF4757;
  --warning: #FFA726;
  
  /* Neutrales */
  --background-light: #FFFFFF;
  --background-dark: #1A1A2E;
  --text-primary: #2D3436;
  --text-secondary: #636E72;
  
  /* Gradientes */
  --gradient-primary: linear-gradient(135deg, #FF6B9D 0%, #FFC947 100%);
  --gradient-card: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%);
}
```

**Tipografía:**
```css
Font Stack:
  - Headings: 'Poppins', sans-serif (Bold, SemiBold)
  - Body: 'Inter', sans-serif (Regular, Medium)
  - Accent: 'Quicksand', sans-serif (para elementos lúdicos)

Tamaños:
  - H1: 32px / 2rem
  - H2: 24px / 1.5rem
  - Body: 16px / 1rem
  - Small: 14px / 0.875rem
```

**Componentes Modernos:**
- Cards con sombras suaves y bordes redondeados (16px radius)
- Botones con estados hover/active animados
- Iconografía moderna (Phosphor Icons o Heroicons)
- Animaciones microinteractivas (Framer Motion)
- Skeleton loaders para estados de carga
- Toasts/Snackbars para notificaciones
- Bottom sheets para acciones móviles

---

### RNF-004: Compatibilidad (MUST HAVE)

**Criterios de Aceptación:**
- El sistema DEBE funcionar en Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- El sistema DEBE funcionar en iOS 13+ y Android 8+
- El sistema DEBE ser Progressive Web App (PWA) instalable
- El sistema DEBE funcionar en pantallas desde 320px de ancho
- El sistema DEBE soportar gestos táctiles nativos
- El sistema DEBE funcionar sin JavaScript para contenido básico (progressive enhancement)

---

### RNF-005: Escalabilidad (SHOULD HAVE)

**Criterios de Aceptación:**
- La arquitectura DEBE permitir escalar horizontalmente
- La base de datos DEBE soportar mínimo 10,000 usuarios simultáneos
- El sistema DEBE usar CDN para contenido estático
- El sistema DEBE implementar load balancing
- El sistema DEBE tener backup automático diario
- El sistema DEBE recuperarse de fallos en menos de 15 minutos (RTO)

---

### RNF-006: Mantenibilidad (SHOULD HAVE)

**Criterios de Aceptación:**
- El código DEBE seguir estándares de estilo (ESLint, Prettier)
- El código DEBE tener cobertura de pruebas mínima del 80%
- El sistema DEBE tener documentación técnica completa
- El sistema DEBE usar versionado semántico
- El sistema DEBE tener logging estructurado
- El sistema DEBE usar principios SOLID y Clean Code

---

## 4. ARQUITECTURA TÉCNICA RECOMENDADA

### Stack Tecnológico

**Frontend:**
```yaml
Framework: React 18 + TypeScript
State Management: Zustand / Redux Toolkit
Routing: React Router v6
Styling: TailwindCSS + HeadlessUI
Animations: Framer Motion
Forms: React Hook Form + Zod
HTTP Client: Axios / TanStack Query
Real-time: Socket.io-client
PWA: Workbox
Build: Vite
```

**Backend:**
```yaml
Runtime: Node.js 20 LTS
Framework: Express.js / Fastify / NestJS
Language: TypeScript
ORM: Prisma / TypeORM
Authentication: Passport.js + JWT
Validation: Joi / Zod
Real-time: Socket.io
File Upload: Multer + Sharp (image processing)
Email: Nodemailer / SendGrid
```

**Base de Datos:**
```yaml
Principal: PostgreSQL 15
Cache: Redis 7
Búsqueda: Elasticsearch (opcional)
Almacenamiento: AWS S3 / Cloudinary (imágenes)
```

**DevOps:**
```yaml
Hosting: AWS / DigitalOcean / Railway
CI/CD: GitHub Actions
Containers: Docker + Docker Compose
Monitoring: Sentry + LogRocket
Analytics: Mixpanel / PostHog
```

---

## 5. HISTORIAS DE USUARIO COMPLETAS

### Epic 1: Onboarding y Autenticación

**US-001:** Registro de Usuario
```
Como estudiante de Pascual Bravo
Quiero registrarme con mi correo institucional
Para acceder a una plataforma exclusiva de mi universidad

Criterios de Aceptación:
- Dado que soy un estudiante con correo @pascualbravo.edu.co
- Cuando ingreso mi correo, contraseña y fecha de nacimiento
- Entonces debo recibir un correo de verificación
- Y mi cuenta debe crearse en estado "pendiente de verificación"
```

**US-002:** Verificación de Correo
```
Como usuario registrado
Quiero verificar mi correo electrónico
Para activar mi cuenta y acceder a la plataforma

Criterios de Aceptación:
- Dado que recibí un correo de verificación
- Cuando hago clic en el enlace de verificación
- Entonces mi cuenta debe activarse
- Y debo ser redirigido a completar mi perfil
```

### Epic 2: Gestión de Perfil

**US-003:** Creación de Perfil
```
Como usuario verificado
Quiero crear un perfil atractivo
Para mostrar mi personalidad y conectar con personas afines

Criterios de Aceptación:
- Dado que mi cuenta está verificada
- Cuando subo fotos, escribo biografía y selecciono intereses
- Entonces mi perfil debe guardarse
- Y debe mostrarse a otros usuarios que cumplan mis filtros
```

### Epic 3: Matching

**US-004:** Descubrimiento de Perfiles
```
Como usuario activo
Quiero ver perfiles de otros estudiantes
Para encontrar personas que me interesen

Criterios de Aceptación:
- Dado que tengo un perfil completo
- Cuando accedo a la sección de descubrimiento
- Entonces veo perfiles que cumplen mis filtros
- Y puedo deslizar para dar like o nope
```

**US-005:** Generación de Match
```
Como usuario que dio like a alguien
Quiero recibir notificación cuando esa persona también me dé like
Para saber que hay interés mutuo

Criterios de Aceptación:
- Dado que di like a un perfil
- Cuando esa persona también me da like
- Entonces se genera un match
- Y ambos recibimos notificación push
- Y se abre automáticamente el chat
```

### Epic 4: Comunicación

**US-006:** Chat en Tiempo Real
```
Como usuario con un match
Quiero chatear en tiempo real
Para conocer mejor a esa persona

Criterios de Aceptación:
- Dado que tengo un match activo
- Cuando envío un mensaje
- Entonces el otro usuario lo recibe inmediatamente
- Y veo estados de entrega y lectura
```

### Epic 5: Seguridad y Privacidad

**US-007:** Reporte de Usuario
```
Como usuario que encuentra contenido inapropiado
Quiero reportar el perfil
Para mantener la comunidad segura

Criterios de Aceptación:
- Dado que veo un perfil inapropiado
- Cuando selecciono "Reportar" y elijo un motivo
- Entonces el reporte se envía a moderación
- Y el perfil se oculta de mi vista
```

**US-008:** Control de Privacidad
```
Como usuario preocupado por mi privacidad
Quiero controlar quién ve mi perfil y ubicación
Para sentirme seguro en la plataforma

Criterios de Aceptación:
- Dado que accedo a configuración de privacidad
- Cuando desactivo la localización
- Entonces mi ubicación no se muestra a otros usuarios
- Y puedo seguir usando la app normalmente
```

---

## 6. MATRIZ DE PRIORIZACIÓN (MoSCoW)

### MUST HAVE (Lanzamiento MVP)
- ✅ RF-001: Registro de usuario
- ✅ RF-002: Verificación de mayoría de edad
- ✅ RF-003: Inicio de sesión
- ✅ RF-004: Creación de perfil
- ✅ RF-005: Edición de perfil
- ✅ RF-006: Visualización de perfiles
- ✅ RF-007: Sistema de like/dislike
- ✅ RF-008: Sistema de match
- ✅ RF-010: Sistema de mensajería
- ✅ RF-011: Sistema de reportes
- ✅ RF-012: Eliminación de cuenta
- ✅ RF-013: Localización básica
- ✅ RF-014: Configuración de privacidad
- ✅ RNF-001: Rendimiento
- ✅ RNF-002: Seguridad
- ✅ RNF-003: Usabilidad moderna
- ✅ RNF-004: Compatibilidad

### SHOULD HAVE (Fase 2)
- 🔶 RF-009: Filtros avanzados
- 🔶 RF-015: Notificaciones inteligentes
- 🔶 RNF-005: Escalabilidad
- 🔶 RNF-006: Mantenibilidad
- 🔶 Super Likes con límite diario
- 🔶 Modo oscuro personalizable
- 🔶 Compartir perfil vía enlace

### COULD HAVE (Futuro)
- ⭕ Videollamadas dentro de la app
- ⭕ Verificación con foto (selfie vs perfil)
- ⭕ Badges y logros gamificados
- ⭕ Eventos de la universidad integrados
- ⭕ Algoritmo de matching con IA
- ⭕ Modo "Boost" para aumentar visibilidad

### WON'T HAVE (Fuera del alcance)
- ❌ Pagos y suscripciones premium (primera versión)
- ❌ Integración con redes sociales
- ❌ Geolocalización en tiempo real continua
- ❌ Múltiples universidades (solo Pascual Bravo v1)
- ❌ Aplicación nativa (solo PWA)

---

## 7. PLAN DE PRUEBAS Y VALIDACIÓN

### Pruebas Funcionales

**Casos de Prueba Críticos:**

**TC-001: Registro Exitoso**
```
Precondiciones: Usuario no registrado con correo @pascualbravo.edu.co
Pasos:
1. Acceder a página de registro
2. Ingresar correo válido
3. Crear contraseña segura
4. Ingresar fecha de nacimiento (mayor de 18)
5. Aceptar términos y condiciones
6. Hacer clic en "Registrarse"

Resultado Esperado:
- Cuenta creada exitosamente
- Correo de verificación enviado
- Redirección a página de confirmación
```

**TC-002: Validación de Edad**
```
Precondiciones: Usuario menor de 18 años
Pasos:
1. Intentar registrarse con fecha de nacimiento que resulte en edad < 18
2. Completar formulario

Resultado Esperado:
- Error mostrado: "Debes ser mayor de 18 años"
- Registro bloqueado
- No se crea cuenta
```

**TC-003: Generación de Match**
```
Precondiciones: Dos usuarios con perfiles completos
Pasos:
1. Usuario A da like a Usuario B
2. Usuario B da like a Usuario A

Resultado Esperado:
- Match detectado inmediatamente
- Notificación push a ambos usuarios
- Chat creado automáticamente
- Pantalla de celebración mostrada
```

### Pruebas de Seguridad

**ST-001: Prevención de Inyección SQL**
```
Entrada: admin' OR '1'='1
Campo: Login email
Resultado Esperado: Error de validación, no ejecución de query maliciosa
```

**ST-002: Prevención de XSS**
```
Entrada: <script>alert('XSS')</script>
Campo: Biografía
Resultado Esperado: Script sanitizado, mostrado como texto plano
```

**ST-003: Rate Limiting**
```
Acción: 150 requests en 1 minuto desde misma IP
Resultado Esperado: 429 Too Many Requests después de 100 requests
```

### Pruebas de Usabilidad

**UT-001: Test A/B de Onboarding**
- Versión A: Registro en un solo paso
- Versión B: Registro en pasos múltiples
- Métrica: Tasa de completitud

**UT-002: Test de Navegación**
- Objetivo: Encontrar configuración de privacidad
- Métrica: Tiempo promedio < 15 segundos
- Usuarios de prueba: 10

### Pruebas de Rendimiento

**PT-001: Carga de Stress**
```
Herramienta: Apache JMeter
Escenario: 1000 usuarios concurrentes
Duración: 30 minutos
Métricas:
- Response time p95 < 2s
- Error rate < 1%
- CPU usage < 80%
```

**PT-002: Prueba de Latencia de Chat**
```
Escenario: 100 conversaciones simultáneas
Métrica: Latencia de mensaje < 500ms
Herramienta: Socket.io Load Testing
```

---

## 8. MÉTRICAS DE ÉXITO (KPIs)

### Métricas de Adopción
- 📊 **Usuarios registrados:** > 500 en primer mes
- 📊 **Tasa de verificación:** > 80% verifican correo en 24h
- 📊 **Perfiles completados:** > 70% completan perfil al 100%
- 📊 **DAU (Daily Active Users):** > 200 después de 2 meses

### Métricas de Engagement
- 💬 **Matches por usuario:** Promedio 5-10 por semana
- 💬 **Mensajes enviados:** > 1000 mensajes/día
- 💬 **Tiempo en app:** Promedio 15 min por sesión
- 💬 **Retención D7:** > 40% de usuarios regresan después de 7 días

### Métricas Técnicas
- ⚡ **Uptime:** > 99.5%
- ⚡ **Response time p95:** < 2 segundos
- ⚡ **Error rate:** < 0.5%
- ⚡ **Crash rate:** < 1%

### Métricas de Seguridad
- 🔒 **Reportes resueltos:** > 90% en < 48 horas
- 🔒 **Cuentas baneadas por spam:** Detección automática efectiva
- 🔒 **Incidentes de seguridad:** 0 brechas de datos

---

## 9. CRONOGRAMA ESTIMADO

### Fase 1: MVP (8-12 semanas)

**Sprint 1-2 (Semanas 1-4): Autenticación y Perfiles**
- Configuración de proyecto y arquitectura
- Sistema de registro y login
- Verificación de correo y edad
- CRUD de perfiles básico

**Sprint 3-4 (Semanas 5-8): Matching y Chat**
- Algoritmo de descubrimiento
- Sistema de likes/matches
- Chat en tiempo real con Socket.io
- Notificaciones push básicas

**Sprint 5-6 (Semanas 9-12): Seguridad y Pulido**
- Sistema de reportes y moderación
- Localización y privacidad
- Testing exhaustivo
- Despliegue a producción

### Fase 2: Mejoras (4-6 semanas)
- Filtros avanzados
- Notificaciones inteligentes
- Optimizaciones de rendimiento
- Modo oscuro

---

## 10. GLOSARIO DE TÉRMINOS

**Match:** Conexión mutua generada cuando dos usuarios se dan like recíprocamente.

**Like:** Acción de indicar interés positivo en un perfil.

**Nope/Pass:** Acción de indicar desinterés en un perfil.

**Super Like:** Like especial con notificación destacada (limitado).

**Swipe:** Gesto de deslizamiento para dar like (derecha) o nope (izquierda).

**Perfil Verificado:** Usuario que ha completado la verificación de correo institucional.

**Usuario Activo:** Usuario que inició sesión en las últimas 24 horas.

**Modo Incógnito:** Estado temporal donde el perfil no es visible para otros usuarios.

**Campus Mode:** Modo que muestra solo usuarios dentro del campus universitario.

**Compatibilidad:** Porcentaje calculado basado en intereses, programa y preferencias comunes.

---

## 11. ANEXOS

### Anexo A: Mockups de Interfaz

**Pantallas Principales:**
1. Login/Registro
2. Creación de perfil (wizard multi-paso)
3. Descubrimiento (tarjetas deslizables)
4. Perfil expandido
5. Matches
6. Chat individual
7. Configuración de privacidad

### Anexo B: Modelo de Base de Datos

**Entidades Principales:**
```sql
users (id, email, password_hash, date_of_birth, verified, created_at)
profiles (user_id, name, bio, program, semester, photos[], interests[])
likes (id, user_id, target_user_id, created_at)
matches (id, user1_id, user2_id, matched_at, active)
messages (id, match_id, sender_id, content, sent_at, read_at)
reports (id, reporter_id, reported_user_id, reason, status, created_at)
locations (user_id, latitude, longitude, updated_at, accuracy)
```

### Anexo C: Referencias Legales

- **Ley 1581 de 2012 (Colombia):** Protección de datos personales
- **Decreto 1377 de 2013:** Reglamentación parcial Ley 1581
- **GDPR:** Referencia internacional de buenas prácticas
- **Términos de servicio:** Debe elaborar documento legal específico
- **Política de privacidad:** Debe detallar tratamiento de datos

---

## 12. CRITERIOS DE ACEPTACIÓN GENERAL DEL PROYECTO

El proyecto se considerará exitoso cuando:

✅ Todos los requerimientos MUST HAVE estén implementados y probados  
✅ La aplicación esté desplegada en producción accesible 24/7  
✅ Al menos 100 usuarios reales estén registrados y activos  
✅ Se hayan generado al menos 50 matches reales  
✅ La tasa de errores sea inferior al 1%  
✅ El tiempo de respuesta promedio sea inferior a 2 segundos  
✅ No existan vulnerabilidades de seguridad críticas (audit aprobado)  
✅ La documentación técnica esté completa  
✅ El equipo de administración pueda moderar contenido eficientemente  

---

**Documento elaborado por:** Equipo Kora  
**Próxima revisión:** [Fecha]  
**Versión:** 1.0  
**Estado:** Aprobado para desarrollo  

---

## NOTAS FINALES

Este documento es un **living document** que debe actualizarse conforme el proyecto evolucione. Cualquier cambio en requerimientos debe:

1. Ser documentado en el registro de cambios
2. Ser aprobado por stakeholders
3. Pasar por análisis de impacto técnico
4. Actualizar la matriz de trazabilidad

Para consultas sobre este documento:
- **Técnicas:** Contactar al Tech Lead
- **Funcionales:** Contactar al Product Owner
- **Legales:** Contactar a asesoría jurídica de la institución
