import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Auth routes (no sidebar)
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { guest: true },
    children: [
      {
        path: '',
        redirect: '/auth/login',
      },
      {
        path: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
        name: 'login',
      },
      {
        path: 'register',
        component: () => import('pages/auth/RegisterPage.vue'),
        name: 'register',
      },
      {
        path: 'forgot-password',
        component: () => import('pages/auth/ForgotPasswordPage.vue'),
        name: 'forgot-password',
      },
    ],
  },

  // Super Admin Login (no sidebar - separate from main layout)
  {
    path: '/super-admin/login',
    component: () => import('pages/super-admin/LoginPage.vue'),
    name: 'super-admin-login',
    meta: { guest: true },
  },

  // Super Admin routes (with sidebar)
  {
    path: '/super-admin',
    component: () => import('layouts/SuperAdminLayout.vue'),
    meta: { requiresSuperAdmin: true },
    children: [
      {
        path: '',
        redirect: '/super-admin/dashboard',
      },
      {
        path: 'dashboard',
        component: () => import('pages/super-admin/IndexPage.vue'),
        name: 'super-admin-dashboard',
        meta: { title: 'Super Admin Dashboard' },
      },
      {
        path: 'companies',
        component: () => import('pages/super-admin/CompaniesPage.vue'),
        name: 'super-admin-companies',
        meta: { title: 'Manage Companies' },
      },
      {
        path: 'companies/:id',
        component: () => import('pages/super-admin/CompanyDetailPage.vue'),
        name: 'super-admin-company-detail',
        meta: { title: 'Company Details' },
      },
      {
        path: 'users',
        component: () => import('pages/super-admin/UsersPage.vue'),
        name: 'super-admin-users',
        meta: { title: 'Platform Users' },
      },
      {
        path: 'analytics',
        component: () => import('pages/super-admin/AnalyticsPage.vue'),
        name: 'super-admin-analytics',
        meta: { title: 'Analytics' },
      },
      {
        path: 'billing',
        component: () => import('pages/super-admin/BillingPage.vue'),
        name: 'super-admin-billing',
        meta: { title: 'Billing' },
      },
      {
        path: 'support',
        component: () => import('pages/super-admin/SupportPage.vue'),
        name: 'super-admin-support',
        meta: { title: 'Support Tickets' },
      },
      {
        path: 'support/:id',
        component: () => import('pages/super-admin/TicketDetailPage.vue'),
        name: 'super-admin-ticket-detail',
        meta: { title: 'Ticket Details' },
      },
      {
        path: 'settings',
        component: () => import('pages/super-admin/SettingsPage.vue'),
        name: 'super-admin-settings',
        meta: { title: 'Platform Settings' },
      },
    ],
  },

  // Dashboard routes (with sidebar)
  {
    path: '/',
    component: () => import('layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        component: () => import('pages/dashboard/IndexPage.vue'),
        name: 'dashboard',
        meta: { title: 'Dashboard' },
      },

      // Employees
      {
        path: 'employees',
        component: () => import('pages/employees/IndexPage.vue'),
        name: 'employees',
        meta: { title: 'Employees' },
      },
      {
        path: 'employees/:id',
        component: () => import('pages/employees/EmployeeFormPage.vue'),
        name: 'employee-edit',
        meta: { title: 'Edit Employee' },
      },
      {
        path: 'employees/new',
        component: () => import('pages/employees/EmployeeFormPage.vue'),
        name: 'employee-new',
        meta: { title: 'New Employee' },
      },
      {
        path: 'departments',
        component: () => import('pages/employees/DepartmentsPage.vue'),
        name: 'departments',
        meta: { title: 'Departments' },
      },
      {
        path: 'designations',
        component: () => import('pages/employees/DesignationsPage.vue'),
        name: 'designations',
        meta: { title: 'Designations' },
      },

      // Attendance
      {
        path: 'attendance',
        component: () => import('pages/attendance/MarkPage.vue'),
        name: 'attendance',
        meta: { title: 'Mark Attendance' },
      },
      {
        path: 'attendance/report',
        component: () => import('pages/attendance/ReportPage.vue'),
        name: 'attendance-report',
        meta: { title: 'Attendance Report' },
      },
      {
        path: 'attendance/regularization',
        component: () => import('pages/attendance/RegularizationPage.vue'),
        name: 'regularization',
        meta: { title: 'Regularization' },
      },

      // Leave
      {
        path: 'leave',
        component: () => import('pages/leave/MyLeavesPage.vue'),
        name: 'leave',
        meta: { title: 'My Leaves' },
      },
      {
        path: 'leave/requests',
        component: () => import('pages/leave/RequestsPage.vue'),
        name: 'leave-requests',
        meta: { title: 'Leave Requests' },
      },
      {
        path: 'leave/types',
        component: () => import('pages/leave/TypesPage.vue'),
        name: 'leave-types',
        meta: { title: 'Leave Types' },
      },

      // Payroll
      {
        path: 'payroll',
        component: () => import('pages/payroll/PaySlipsPage.vue'),
        name: 'payroll',
        meta: { title: 'Pay Slips' },
      },
      {
        path: 'payroll/structure',
        component: () => import('pages/payroll/StructurePage.vue'),
        name: 'payroll-structure',
        meta: { title: 'Salary Structure' },
      },
      {
        path: 'payroll/manage',
        component: () => import('pages/payroll/ManagePage.vue'),
        name: 'payroll-manage',
        meta: { title: 'Payroll Management' },
      },
      {
        path: 'payroll/salary-builder',
        component: () => import('pages/payroll/SalaryStructureBuilderPage.vue'),
        name: 'payroll-salary-builder',
        meta: { title: 'Salary Structure Builder' },
      },

      // Reports
      {
        path: 'reports',
        component: () => import('pages/reports/IndexPage.vue'),
        name: 'reports',
        meta: { title: 'Reports' },
      },
      {
        path: 'reports/t10-certificate',
        component: () => import('pages/reports/T10CertificatePage.vue'),
        name: 'reports-t10-certificate',
        meta: { title: 'T10 Certificate (APIT)' },
      },
      {
        path: 'reports/epf-etf',
        component: () => import('pages/reports/EpfEtfFormsPage.vue'),
        name: 'reports-epf-etf',
        meta: { title: 'EPF & ETF Forms' },
      },

      // Claims
      {
        path: 'claims',
        component: () => import('pages/claims/MyClaimsPage.vue'),
        name: 'claims',
        meta: { title: 'My Claims' },
      },
      {
        path: 'claims/approvals',
        component: () => import('pages/claims/ApprovalsPage.vue'),
        name: 'claims-approvals',
        meta: { title: 'Claim Approvals' },
      },

      // Settings
      {
        path: 'settings/company',
        component: () => import('pages/settings/CompanyPage.vue'),
        name: 'settings-company',
        meta: { title: 'Company Settings' },
      },
      {
        path: 'settings/branches',
        component: () => import('pages/settings/BranchesPage.vue'),
        name: 'settings-branches',
        meta: { title: 'Branches' },
      },
      {
        path: 'settings/roles',
        component: () => import('pages/settings/RolesPage.vue'),
        name: 'settings-roles',
        meta: { title: 'Roles' },
      },
    ],
  },

  // 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
