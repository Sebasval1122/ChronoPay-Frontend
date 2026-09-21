# ChronoPay Frontend

ChronoPay web application for managing users, branches, attendance, and payroll. It is built with React, TypeScript, Vite, Tailwind CSS, React Router, and Axios, and consumes the Django REST API.

## Requirements

- Node.js 18 or later
- npm
- ChronoPay Backend running locally or at an accessible URL

## Installation

From the `ChronoPay-Frontend` directory:

```bash
npm install
```

## Environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://127.0.0.1:8000
```

For a deployed backend, replace the value with its base URL. Do not add a trailing `/`.

The `.env` file contains local configuration and must not be committed.

## Development

Start the Vite development server:

```bash
npm run dev
```

Open the URL displayed by Vite, usually `http://localhost:5173`.

Restart the development server after changing `.env` so Vite reloads the values.

## Features

- JWT sign-in.
- Public registration of a company and its first administrator at `/registro`.
- Automatic redirect to the home page after successful registration.
- Attendance lookup and check-in/check-out actions.
- Payroll lookup, period creation, generation/recalculation, overtime and surcharge details by employee, and PDF payslip downloads.
- Permission-based user management.
- Branch management for general administrators.
- Automatic access-token renewal when it expires.

The end-to-end integration is supported: company registration -> sign-in -> attendance tracking -> payroll generation, together with ChronoPay Backend.

## Known limitations

The backend supports these API features, but this frontend does not have screens for them yet:

- Vacation and leave requests
- Employee salary-change history
- CSV report downloads

These features do not exist yet in either the backend or this frontend:

- Consolidated multi-branch dashboard
- Projected versus actual payroll-cost dashboard
- Notification system

## Roles

- `admin_general`: global access, users, and branches.
- `gerente_sucursal`: user management and branch operations.
- `employee`: attendance and personal information lookup.

Authorization must always be validated by the backend. Frontend restrictions only control navigation and user experience.

## Main routes

| Route | Access | Description |
| --- | --- | --- |
| `/login` | Public | Sign-in |
| `/registro` | Public | Company and administrator registration |
| `/` | Authenticated | Home page |
| `/asistencia` | Authenticated | Attendance records and actions |
| `/nomina` | Authenticated | Payroll lookup, creation, and generation |
| `/dashboard` | Admin or manager | Branch payroll and attendance dashboard |
| `/usuarios` | Admin or manager | User management |
| `/sucursales` | General admin | Branch management |

## Folder structure

```text
src/
├── api/
│   ├── client.ts
│   └── types.ts
├── auth/
│   ├── AuthContext.tsx
│   └── ProtectedRoute.tsx
├── components/
│   └── Layout.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── HomePage.tsx
│   ├── AttendancePage.tsx
│   ├── PayrollPage.tsx
│   ├── UsersPage.tsx
│   ├── BranchesPage.tsx
│   └── DashboardPage.tsx
├── App.tsx
├── index.css
└── main.tsx
```

## Required backend API

The frontend expects the backend to expose at least:

- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `POST /api/companies/registro/`
- `GET /api/users/me/`
- `GET /api/users/` and `POST /api/users/`
- `GET /api/branches/` and `POST /api/branches/`
- `GET /api/attendance/marcajes/`, `POST /api/attendance/marcajes/clock-in/`, and `POST /api/attendance/marcajes/{id}/clock-out/`
- `GET /api/payroll/`, `POST /api/payroll/`, and `POST /api/payroll/{id}/generar/`
- `GET /api/pay_slips/{id}/pdf/`
- `GET /api/budgets/` and `GET /api/dashboard/branches/`

Public registration must accept this JSON:

```json
{
  "company_name": "Example Company",
  "admin_first_name": "Ana",
  "admin_last_name": "Perez",
  "email": "ana@example.com",
  "username": "ana.perez",
  "password": "A Secure Password 123!"
}
```

After registration, the frontend automatically signs in with the created credentials.

## CORS

The backend must allow the frontend origin. For local development, add:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

If Vite starts on another port, use that exact origin.

## Production build

```bash
npm run build
```

This command runs the TypeScript check and generates static files in `dist/`.

To inspect the generated build locally:

```bash
npm run preview
```

## Deployment

Configure the hosting provider with:

- Build command: `npm run build`
- Output directory: `dist`
- `VITE_API_URL`: public backend base URL

Because this is a single-page application, the host must redirect unknown routes to `index.html` so `/login` and `/registro` continue to work after a refresh.
