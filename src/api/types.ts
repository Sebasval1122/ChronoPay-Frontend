export type Role = "admin_general" | "gerente_sucursal" | "employee";
export type RequestType = "vacaciones" | "permission";
export type RequestStatus = "pendiente" | "approved" | "rechazada";

export interface TimeOffRequest {
  id: number;
  requester: number;
  requester_name: string;
  type: RequestType;
  start_date: string;
  end_date: string;
  reason: string;
  status: RequestStatus;
  reviewed_by: number | null;
  review_comment: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  national_id: string | null;
  phone: string;
  rol: Role;
  branch: number | null;
  current_salary: string | null;
  active: boolean;
  date_joined: string;
}

export interface Branch {
  id: number;
  name: string;
  codigo: string;
  address: string;
  city: string;
  phone: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: number;
  employee: number;
  employee_name?: string;
  branch: number | null;
  branch_name?: string;
  date: string;
  clock_in_time: string;
  clock_out_time: string | null;
  worked_hours: number | null;
  recorded_by: number | null;
  corrected_by: number | null;
  correction_reason: string;
}

export interface PayrollDetail {
  id: number;
  payroll: number;
  user: number;
  user_name: string;
  base_salary: string;
  regular_day_hours: string;
  regular_night_hours: string;
  overtime_day_hours: string;
  overtime_night_hours: string;
  sunday_or_holiday_hours: string;
  holiday_overtime_hours: string;
  overtime_hours: string;
  surcharges: string;
  withholding: string;
  work_events: string;
  net_total: string;
}

export interface Payroll {
  id: number;
  branch: number;
  period_start: string;
  period_end: string;
  status: string;
  total: string;
  created_at: string;
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
