# ChronoPay — Frontend

Frontend en React + TypeScript + Vite + Tailwind para la plataforma de
asistencia y nómina ChronoPay. Consume la API de
[ChronoPay-Backend](https://github.com/Sebasval1122/ChronoPay-Backend).

## Estructura

```
src/
├── api/           # Cliente HTTP (axios) y tipos que reflejan los serializers del backend
├── auth/          # Contexto de autenticación (JWT) y protección de rutas por rol
├── components/    # Layout compartido (barra lateral con navegación por rol)
├── pages/         # Una página por sección: login, inicio, asistencia, nómina, usuarios, sucursales
├── App.tsx        # Definición de rutas
└── main.tsx       # Punto de entrada
```

## Requisitos

- Node.js 18 o superior
- El backend de ChronoPay corriendo (local o desplegado)

## Desarrollo local

```bash
npm install
cp .env.example .env   # y ajusta VITE_API_URL si no usas localhost:8000
npm run dev
```

Abre `http://localhost:5173`.

### CORS

El backend Django debe incluir el origen del frontend en
`CORS_ALLOWED_ORIGINS` (variable de entorno del backend). En desarrollo
local ya incluye `http://localhost:3000` por defecto — si usas el puerto
por defecto de Vite (`5173`), agrégalo:

```
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Build de producción

```bash
npm run build
```

Genera la carpeta `dist/` lista para servir como sitio estático.

## Despliegue

Este proyecto es un sitio estático (SPA), así que funciona en cualquier
hosting de archivos estáticos: Vercel, Netlify, Cloudflare Pages, GitHub
Pages, etc. Pasos generales:

1. Conecta el repositorio al proveedor que elijas
2. Comando de build: `npm run build`
3. Carpeta de salida: `dist`
4. Variable de entorno en el proveedor: `VITE_API_URL` apuntando a la URL
   pública de tu backend desplegado (ej. `https://api.tudominio.com`)
5. Configura el backend (`ALLOWED_HOSTS` y `CORS_ALLOWED_ORIGINS`) para
   aceptar el dominio donde quede publicado el frontend

Como es una SPA con rutas del lado del cliente (React Router), configura
el proveedor para redirigir cualquier ruta no encontrada a `index.html`
(en Vercel/Netlify esto se hace automáticamente para proyectos Vite; si
usas otro hosting, revisa su documentación de "SPA fallback" o "rewrite
rules").

## Roles soportados

La navegación y las páginas se ajustan automáticamente según el rol del
usuario autenticado (`admin_general`, `gerente_sucursal`, `empleado`),
igual que los permisos ya definidos en el backend. El frontend oculta
secciones que el rol no debería ver, pero la autorización real siempre
la aplica el backend — el frontend no debe ser la única barrera de
seguridad.

## Pendientes conocidos

- Los formularios de creación (usuarios, sucursales, nómina) son
  funcionales pero mínimos — sin validación avanzada ni mensajes de
  error detallados por campo.
- La vista de nómina para el rol `empleado` filtra en el frontend para
  mostrar solo su propio detalle, pero el backend actualmente devuelve
  los detalles de todos los empleados de la sucursal en la respuesta.
  Vale la pena restringir esto en el backend (`NominaSerializer`) para
  que un empleado nunca reciba en la respuesta el salario de sus
  compañeros, aunque el frontend no lo muestre.
