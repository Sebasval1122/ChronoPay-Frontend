# ChronoPay Frontend

Aplicación web de ChronoPay para gestionar usuarios, sucursales, asistencia y nómina. Está construida con React, TypeScript, Vite, TailwindCSS, React Router y Axios, y consume la API REST del backend Django.

## Requisitos

- Node.js 18 o superior
- npm
- ChronoPay Backend ejecutándose localmente o en una URL accesible

## Instalación

Desde la carpeta `ChronoPay-Frontend`:

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Para usar un backend desplegado, reemplaza el valor por su URL base. No agregues una barra `/` al final.

El archivo `.env` contiene configuración local y no debe subirse al repositorio.

## Desarrollo

Inicia el servidor de Vite:

```bash
npm run dev
```

Abre la URL que muestre Vite, normalmente:

```text
http://localhost:5173
```

Si cambias `.env`, reinicia el servidor de desarrollo para que Vite cargue los nuevos valores.

## Funcionalidades

- Inicio de sesión con JWT.
- Registro público de una empresa y su primer administrador en `/registro`.
- Redirección automática al inicio después de registrarse correctamente.
- Consulta y registro de asistencia.
- Consulta de nómina.
- Gestión de usuarios según permisos.
- Gestión de sucursales para administradores generales.
- Renovación automática del token de acceso cuando expira.

## Roles

La interfaz reconoce los siguientes roles:

- `admin_general`: acceso global, usuarios y sucursales.
- `gerente_sucursal`: gestión de usuarios y operación de su sucursal.
- `empleado`: asistencia y consulta de su información.

La autorización real siempre debe validarse en el backend. Las restricciones del frontend solo controlan la navegación y la experiencia de usuario.

## Rutas principales

| Ruta | Acceso | Descripción |
| --- | --- | --- |
| `/login` | Público | Inicio de sesión |
| `/registro` | Público | Registro de empresa y administrador |
| `/` | Autenticado | Página de inicio |
| `/asistencia` | Autenticado | Marcajes y consulta de asistencia |
| `/nomina` | Autenticado | Consulta de nómina |
| `/usuarios` | Admin o gerente | Gestión de usuarios |
| `/sucursales` | Admin general | Gestión de sucursales |

## Estructura

```text
src/
├── api/
│   ├── client.ts       # Cliente Axios e interceptores JWT
│   └── types.ts        # Tipos de la API
├── auth/
│   ├── AuthContext.tsx # Login, logout y usuario actual
│   └── ProtectedRoute.tsx
├── components/
│   └── Layout.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegistroPage.tsx
│   ├── HomePage.tsx
│   ├── AsistenciaPage.tsx
│   ├── NominaPage.tsx
│   ├── UsuariosPage.tsx
│   └── SucursalesPage.tsx
├── App.tsx
├── index.css
└── main.tsx
```

## Backend requerido

El frontend espera que el backend exponga, como mínimo:

- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `POST /api/empresas/registro/`
- `GET /api/usuarios/me/`
- Los endpoints de asistencia, nómina, usuarios y sucursales utilizados por cada página

El registro público debe aceptar este JSON:

```json
{
  "nombre_empresa": "Empresa de ejemplo",
  "nombre_admin": "Ana",
  "apellido_admin": "Pérez",
  "email": "ana@example.com",
  "username": "ana.perez",
  "password": "UnaClaveSegura123!"
}
```

Después del registro, el frontend inicia sesión automáticamente con el usuario y contraseña creados.

## CORS

El backend debe permitir el origen del frontend. En desarrollo local, agrega:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Si Vite inicia en otro puerto, usa ese origen exacto.

## Build de producción

```bash
npm run build
```

Este comando ejecuta la comprobación de TypeScript y genera los archivos estáticos en `dist/`.

Para revisar localmente el build generado:

```bash
npm run preview
```

## Despliegue

Configura en el proveedor de hosting:

- Comando de build: `npm run build`
- Directorio de salida: `dist`
- Variable `VITE_API_URL`: URL base pública del backend

Como es una SPA, el hosting debe redirigir las rutas desconocidas a `index.html` para que funcionen `/login` y `/registro` al recargar la página.
