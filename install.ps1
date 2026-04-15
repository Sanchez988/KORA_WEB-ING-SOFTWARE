# Kora App - Script de Instalación Automatizada
# Windows PowerShell

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Kora App - Instalación Automática" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "[1/8] Verificando Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js no encontrado. Por favor instala Node.js 20 o superior" -ForegroundColor Red
    exit 1
}

# Verificar PostgreSQL
Write-Host "[2/8] Verificando PostgreSQL..." -ForegroundColor Yellow
if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "✓ PostgreSQL instalado" -ForegroundColor Green
} else {
    Write-Host "⚠ PostgreSQL no encontrado. Asegúrate de instalarlo" -ForegroundColor Yellow
}

# Instalar dependencias del Backend
Write-Host "[3/8] Instalando dependencias del Backend..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencias del backend instaladas" -ForegroundColor Green
} else {
    Write-Host "✗ Error instalando dependencias del backend" -ForegroundColor Red
    exit 1
}

# Configurar .env del Backend
Write-Host "[4/8] Configurando variables de entorno del Backend..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Archivo .env creado. ¡IMPORTANTE: Edita backend/.env con tus configuraciones!" -ForegroundColor Green
    Write-Host "  Debes configurar:" -ForegroundColor Yellow
    Write-Host "  - DATABASE_URL" -ForegroundColor Yellow
    Write-Host "  - JWT_SECRET" -ForegroundColor Yellow
    Write-Host "  - EMAIL_* (opcional para desarrollo)" -ForegroundColor Yellow
} else {
    Write-Host "✓ Archivo .env ya existe" -ForegroundColor Green
}

# Crear base de datos
Write-Host "[5/8] Configurando base de datos..." -ForegroundColor Yellow
Write-Host "⚠ Asegúrate de haber creado la base de datos 'kora_db'" -ForegroundColor Yellow
Write-Host "  Comando: createdb kora_db" -ForegroundColor Cyan
$response = Read-Host "¿Ya creaste la base de datos? (s/n)"
if ($response -eq "s") {
    Write-Host "Ejecutando migraciones de Prisma..." -ForegroundColor Yellow
    npx prisma migrate dev
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Migraciones ejecutadas" -ForegroundColor Green
    } else {
        Write-Host "✗ Error en migraciones. Verifica la configuración de la BD" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ Por favor crea la base de datos y ejecuta: npx prisma migrate dev" -ForegroundColor Yellow
}

# Volver a raíz
Set-Location ..

# Instalar dependencias del Frontend
Write-Host "[6/8] Instalando dependencias del Frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencias del frontend instaladas" -ForegroundColor Green
} else {
    Write-Host "✗ Error instalando dependencias del frontend" -ForegroundColor Red
    exit 1
}

# Configurar .env del Frontend
Write-Host "[7/8] Configurando variables de entorno del Frontend..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "✓ Archivo .env ya existe" -ForegroundColor Green
}

# Volver a raíz
Set-Location ..

# Resumen
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ✓ Instalación Completada" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Edita backend/.env con tu configuración de PostgreSQL" -ForegroundColor White
Write-Host "2. Asegúrate de haber ejecutado las migraciones de Prisma" -ForegroundColor White
Write-Host ""
Write-Host "Para iniciar la aplicación:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Luego abre: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Para más información, consulta:" -ForegroundColor Yellow
Write-Host "  - README.md" -ForegroundColor White
Write-Host "  - QUICKSTART.md" -ForegroundColor White
Write-Host "  - DEVELOPER_NOTES.md" -ForegroundColor White
Write-Host ""
Write-Host "¡Buena suerte con Kora! 🎉" -ForegroundColor Magenta
