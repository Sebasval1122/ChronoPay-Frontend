export type Role = "admin_general" | "gerente_sucursal" | "empleado";

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  cedula: string | null;
  telefono: string;
  rol: Role;
  sucursal: number | null;
  salario_actual: string | null;
  activo: boolean;
  date_joined: string;
}

export interface Branch {
  id: number;
  nombre: string;
  codigo: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  activo: boolean;
}

export interface AttendanceRecord {
  id: number;
  empleado: number;
  empleado_nombre?: string;
  sucursal: number | null;
  sucursal_nombre?: string;
  fecha: string;
  entrada: string;
  salida: string | null;
  horas_trabajadas: number | null;
  registrado_por: number | null;
  corregido_por: number | null;
  motivo_correccion: string;
}

export interface PayrollDetail {
  id: number;
  nomina: number;
  usuario: number;
  usuario_nombre: string;
  salario_base: string;
  horas_ordinarias_diurnas: string;
  horas_ordinarias_nocturnas: string;
  horas_extra_diurnas: string;
  horas_extra_nocturnas: string;
  horas_dominicales_o_festivas: string;
  horas_extra_dominicales_o_festivas: string;
  horas_extra: string;
  recargos: string;
  retencion_fuente: string;
  novedades: string;
  total_neto: string;
}

export interface Payroll {
  id: number;
  sucursal: number;
  periodo_inicio: string;
  periodo_fin: string;
  estado: string;
  total: string;
  creado_en: string;
  detalles: PayrollDetail[];
}

export interface DashboardBranch {
  branch_id: number;
  branch_name: string;
  active_employee_count: number;
  real_payroll_total: string | number;
  budgeted_amount: string | number | null;
  budget_difference: string | number | null;
  total_overtime_hours: string | number;
  work_events_count: number;
  attendance_records_count: number;
}

export interface Budget {
  id: number;
  branch: number;
  year: number;
  month: number;
  budgeted_amount: string | number;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}
