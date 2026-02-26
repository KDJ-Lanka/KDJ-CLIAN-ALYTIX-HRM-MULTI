// Employee related types
export interface Employee {
  id: string;
  company_id: string;
  user_id?: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string;
  department_id?: string;
  designation_id?: string;
  role_id?: string;
  branch_id?: string;
  reporting_manager_id?: string;
  date_of_joining: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  pan_number?: string;
  aadhaar_number?: string;
  status: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Designation {
  id: string;
  company_id: string;
  title: string;
  code?: string;
  description?: string;
  department_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description?: string;
  permissions?: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  company_id: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  is_headquarters: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Attendance related types
export interface Attendance {
  id: string;
  company_id: string;
  employee_id: string;
  attendance_date: string;
  check_in_time?: string;
  check_out_time?: string;
  total_work_hours?: number;
  status: string;
  check_in_location?: string;
  check_out_location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRegularization {
  id: string;
  company_id: string;
  employee_id: string;
  request_date: string;
  request_type: string;
  reason?: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// Leave related types
export interface LeaveType {
  id: string;
  company_id: string;
  name: string;
  code?: string;
  description?: string;
  max_days_per_year?: number;
  is_paid: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  leave_types?: LeaveType;
  employee?: { full_name: string };
}

export interface LeaveBalance {
  type: string;
  name: string;
  total: number;
  remaining: number;
}

// Payroll related types
export interface PaySlip {
  id: string;
  company_id: string;
  employee_id: string;
  pay_period_month: number;
  pay_period_year: number;
  basic_salary: number;
  hra?: number;
  da?: number;
  conveyance_allowance?: number;
  medical_allowance?: number;
  special_allowance?: number;
  allowances?: number;
  overtime_amount?: number;
  gross_salary: number;
  pf?: number;
  professional_tax?: number;
  tax_deduction?: number;
  other_deductions?: number;
  total_deductions?: number;
  net_salary: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SalaryStructure {
  id: string;
  company_id: string;
  employee_id: string;
  basic_salary: number;
  hra?: number;
  da?: number;
  conveyance_allowance?: number;
  medical_allowance?: number;
  special_allowance?: number;
  pf?: number;
  professional_tax?: number;
  tax_deduction?: number;
  is_active: boolean;
  effective_from: string;
  created_at: string;
  updated_at: string;
}

// Claims related types
export interface TravelClaim {
  id: string;
  company_id: string;
  employee_id: string;
  claim_type: string;
  amount: number;
  description?: string;
  claim_date: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  employee?: { full_name: string };
}

// Company related types
export interface Company {
  id: string;
  name: string;
  slug?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  logo_url?: string;
  currency?: string;
  timezone?: string;
  date_format?: string;
  work_start_time?: string;
  work_end_time?: string;
  working_days?: number;
  is_active: boolean;
  subscription_plan?: string;
  created_at: string;
  updated_at: string;
}

// Profile type
export interface Profile {
  id: string;
  user_id: string;
  company_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

// Notification type
export interface Notification {
  id: string;
  company_id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}
