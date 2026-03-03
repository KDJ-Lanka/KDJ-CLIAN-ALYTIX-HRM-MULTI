<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="dashboard-header">
      <q-toolbar>
        <!-- Menu Toggle -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleSidebar"
          class="menu-btn"
        />

        <!-- Breadcrumb -->
        <q-breadcrumbs class="breadcrumb">
          <q-breadcrumbs-el label="Home" to="/dashboard" />
          <q-breadcrumbs-el
            v-if="currentPageTitle"
            :label="currentPageTitle"
          />
        </q-breadcrumbs>

        <q-space />

        <!-- Right Side Actions -->
        <div class="header-actions">
          <!-- Notifications -->
          <q-btn
            flat
            dense
            round
            icon="notifications"
            aria-label="Notifications"
            class="header-btn"
          >
            <q-badge
              v-if="unreadNotifications > 0"
              color="red"
              floating
              rounded
            >
              {{ unreadNotifications }}
            </q-badge>
            <q-menu>
              <q-list style="min-width: 280px">
                <q-item-label header>Notifications</q-item-label>
                <q-item v-if="notifications.length === 0">
                  <q-item-section>
                    <q-item-label caption>No new notifications</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  v-for="notification in notifications.slice(0, 5)"
                  :key="notification.id"
                  clickable
                  v-close-popup
                >
                  <q-item-section avatar>
                    <q-icon
                      :name="getNotificationIcon(notification.type)"
                      :color="getNotificationColor(notification.type)"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ notification.title }}</q-item-label>
                    <q-item-label caption>{{
                      notification.message
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable to="/notifications">
                  <q-item-section>
                    <q-item-label class="text-center"
                      >View all notifications</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- User Menu -->
          <q-btn flat no-caps class="user-menu-btn">
            <q-avatar size="32px" color="gray-3" text-color="gray-7">
              {{ userInitials }}
            </q-avatar>
            <span class="user-name q-ml-sm">{{ userName }}</span>
            <q-icon name="expand_more" size="18px" class="q-ml-xs" />

            <q-menu>
              <q-list style="min-width: 200px">
                <q-item-label header>
                  <div class="text-weight-medium">{{ userName }}</div>
                  <div class="text-caption text-gray-500">{{ userEmail }}</div>
                </q-item-label>
                <q-separator />
                <q-item clickable v-close-popup to="/settings/profile">
                  <q-item-section avatar>
                    <q-icon name="person" />
                  </q-item-section>
                  <q-item-section>Profile</q-item-section>
                </q-item>
                <q-item clickable v-close-popup to="/settings/company">
                  <q-item-section avatar>
                    <q-icon name="settings" />
                  </q-item-section>
                  <q-item-section>Settings</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>Sign Out</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Sidebar - Redesigned -->
    <q-drawer
      v-model="sidebarOpen"
      show-if-above
      :mini="sidebarMini"
      :width="280"
      :breakpoint="1024"
      class="dashboard-sidebar"
      @click.capture="handleSidebarClick"
    >
      <!-- Logo & Brand Section -->
      <div class="sidebar-brand">
        <div class="brand-logo">
          <span class="logo-icon">A</span>
        </div>
        <div v-if="!sidebarMini" class="brand-info">
          <span class="brand-name">Anlytix</span>
          <span class="brand-tag">HRM Platform</span>
        </div>
      </div>

      <!-- Company Selector -->
      <div v-if="!sidebarMini && companyName" class="company-selector">
        <div class="company-avatar">
          <span>{{ getCompanyInitial(companyName) }}</span>
        </div>
        <div class="company-details">
          <span class="company-label">Workspace</span>
          <span class="company-name">{{ companyName }}</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <!-- Main Menu Section -->
        <div class="nav-section">
          <span v-if="!sidebarMini" class="nav-section-title">Main Menu</span>

          <!-- Dashboard -->
          <router-link to="/dashboard" class="nav-link" :class="{ active: isActiveRoute('/dashboard') }">
            <span class="nav-icon">
              <q-icon name="dashboard" size="20px" />
            </span>
            <span v-if="!sidebarMini" class="nav-label">Dashboard</span>
          </router-link>
        </div>

        <!-- Management Section -->
        <div class="nav-section">
          <span v-if="!sidebarMini" class="nav-section-title">Management</span>

          <!-- Employees -->
          <div class="nav-group" :class="{ expanded: isEmployeesSectionOpen }">
            <button class="nav-group-header" @click="toggleSection('employees')">
              <span class="nav-icon">
                <q-icon name="people" size="20px" />
              </span>
              <span v-if="!sidebarMini" class="nav-label">Employees</span>
              <q-icon v-if="!sidebarMini" :name="isEmployeesSectionOpen ? 'expand_less' : 'expand_more'" size="18px" class="nav-arrow" />
            </button>
            <div v-if="!sidebarMini && isEmployeesSectionOpen" class="nav-group-items">
              <router-link to="/employees" class="nav-sublink" :class="{ active: isActiveRoute('/employees') }">
                All Employees
              </router-link>
              <router-link to="/departments" class="nav-sublink" :class="{ active: isActiveRoute('/departments') }">
                Departments
              </router-link>
              <router-link to="/designations" class="nav-sublink" :class="{ active: isActiveRoute('/designations') }">
                Designations
              </router-link>
            </div>
          </div>

          <!-- Attendance -->
          <div class="nav-group" :class="{ expanded: isAttendanceSectionOpen }">
            <button class="nav-group-header" @click="toggleSection('attendance')">
              <span class="nav-icon">
                <q-icon name="schedule" size="20px" />
              </span>
              <span v-if="!sidebarMini" class="nav-label">Attendance</span>
              <q-icon v-if="!sidebarMini" :name="isAttendanceSectionOpen ? 'expand_less' : 'expand_more'" size="18px" class="nav-arrow" />
            </button>
            <div v-if="!sidebarMini && isAttendanceSectionOpen" class="nav-group-items">
              <router-link to="/attendance" class="nav-sublink" :class="{ active: isActiveRoute('/attendance', true) }">
                Mark Attendance
              </router-link>
              <router-link to="/attendance/report" class="nav-sublink" :class="{ active: isActiveRoute('/attendance/report') }">
                Reports
              </router-link>
              <router-link to="/attendance/regularization" class="nav-sublink" :class="{ active: isActiveRoute('/attendance/regularization') }">
                Regularization
              </router-link>
            </div>
          </div>

          <!-- Leave -->
          <div class="nav-group" :class="{ expanded: isLeaveSectionOpen }">
            <button class="nav-group-header" @click="toggleSection('leave')">
              <span class="nav-icon">
                <q-icon name="event" size="20px" />
              </span>
              <span v-if="!sidebarMini" class="nav-label">Leave</span>
              <q-icon v-if="!sidebarMini" :name="isLeaveSectionOpen ? 'expand_less' : 'expand_more'" size="18px" class="nav-arrow" />
            </button>
            <div v-if="!sidebarMini && isLeaveSectionOpen" class="nav-group-items">
              <router-link to="/leave" class="nav-sublink" :class="{ active: isActiveRoute('/leave', true) }">
                My Leaves
              </router-link>
              <router-link to="/leave/requests" class="nav-sublink" :class="{ active: isActiveRoute('/leave/requests') }">
                Requests
              </router-link>
              <router-link v-if="isAdmin" to="/leave/types" class="nav-sublink" :class="{ active: isActiveRoute('/leave/types') }">
                Leave Types
              </router-link>
            </div>
          </div>

          <!-- Payroll -->
          <div class="nav-group" :class="{ expanded: isPayrollSectionOpen }">
            <button class="nav-group-header" @click="toggleSection('payroll')">
              <span class="nav-icon">
                <q-icon name="payments" size="20px" />
              </span>
              <span v-if="!sidebarMini" class="nav-label">Payroll</span>
              <q-icon v-if="!sidebarMini" :name="isPayrollSectionOpen ? 'expand_less' : 'expand_more'" size="18px" class="nav-arrow" />
            </button>
            <div v-if="!sidebarMini && isPayrollSectionOpen" class="nav-group-items">
              <router-link to="/payroll" class="nav-sublink" :class="{ active: isActiveRoute('/payroll', true) }">
                Pay Slips
              </router-link>
              <router-link to="/payroll/structure" class="nav-sublink" :class="{ active: isActiveRoute('/payroll/structure') }">
                Salary Structure
              </router-link>
              <router-link v-if="isAdmin" to="/payroll/manage" class="nav-sublink" :class="{ active: isActiveRoute('/payroll/manage') }">
                Payroll Management
              </router-link>
              <router-link v-if="isAdmin" to="/payroll/salary-builder" class="nav-sublink" :class="{ active: isActiveRoute('/payroll/salary-builder') }">
                Structure Builder
              </router-link>
            </div>
          </div>

          <!-- Reports -->
          <div class="nav-group" :class="{ expanded: isReportsSectionOpen }">
            <button class="nav-group-header" @click="toggleSection('reports')">
              <span class="nav-icon">
                <q-icon name="assessment" size="20px" />
              </span>
              <span v-if="!sidebarMini" class="nav-label">Reports</span>
              <q-icon v-if="!sidebarMini" :name="isReportsSectionOpen ? 'expand_less' : 'expand_more'" size="18px" class="nav-arrow" />
            </button>
            <div v-if="!sidebarMini && isReportsSectionOpen" class="nav-group-items">
              <router-link to="/reports" class="nav-sublink" :class="{ active: isActiveRoute('/reports', true) }">
                All Reports
              </router-link>
              <router-link to="/reports/t10-certificate" class="nav-sublink" :class="{ active: isActiveRoute('/reports/t10-certificate') }">
                T10 Certificate (APIT)
              </router-link>
              <router-link to="/reports/epf-etf" class="nav-sublink" :class="{ active: isActiveRoute('/reports/epf-etf') }">
                EPF & ETF Forms
              </router-link>
            </div>
          </div>

          <!-- Claims -->
          <div class="nav-group" :class="{ expanded: isClaimsSectionOpen }">
            <button class="nav-group-header" @click="toggleSection('claims')">
              <span class="nav-icon">
                <q-icon name="receipt_long" size="20px" />
              </span>
              <span v-if="!sidebarMini" class="nav-label">Claims</span>
              <q-icon v-if="!sidebarMini" :name="isClaimsSectionOpen ? 'expand_less' : 'expand_more'" size="18px" class="nav-arrow" />
            </button>
            <div v-if="!sidebarMini && isClaimsSectionOpen" class="nav-group-items">
              <router-link to="/claims" class="nav-sublink" :class="{ active: isActiveRoute('/claims', true) }">
                My Claims
              </router-link>
              <router-link to="/claims/approvals" class="nav-sublink" :class="{ active: isActiveRoute('/claims/approvals') }">
                Approvals
              </router-link>
            </div>
          </div>
        </div>

        <!-- Settings Section (Admin Only) -->
        <div v-if="isAdmin" class="nav-section">
          <span v-if="!sidebarMini" class="nav-section-title">Administration</span>

          <div class="nav-group" :class="{ expanded: isSettingsSectionOpen }">
            <button class="nav-group-header" @click="toggleSection('settings')">
              <span class="nav-icon">
                <q-icon name="settings" size="20px" />
              </span>
              <span v-if="!sidebarMini" class="nav-label">Settings</span>
              <q-icon v-if="!sidebarMini" :name="isSettingsSectionOpen ? 'expand_less' : 'expand_more'" size="18px" class="nav-arrow" />
            </button>
            <div v-if="!sidebarMini && isSettingsSectionOpen" class="nav-group-items">
              <router-link to="/settings/company" class="nav-sublink" :class="{ active: isActiveRoute('/settings/company') }">
                Company
              </router-link>
              <router-link to="/settings/branches" class="nav-sublink" :class="{ active: isActiveRoute('/settings/branches') }">
                Branches
              </router-link>
              <router-link to="/settings/roles" class="nav-sublink" :class="{ active: isActiveRoute('/settings/roles') }">
                Roles
              </router-link>
            </div>
          </div>
        </div>
      </nav>

      <!-- User Profile Section -->
      <div v-if="!sidebarMini" class="sidebar-footer">
        <div class="user-profile">
          <q-avatar size="40px" color="grey-8" text-color="white">
            {{ userInitials }}
          </q-avatar>
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-email">{{ userEmail }}</span>
          </div>
          <q-btn flat dense round icon="logout" size="sm" @click="handleLogout" class="logout-btn">
            <q-tooltip>Sign Out</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Collapse Toggle -->
      <button class="sidebar-toggle" @click.stop="toggleSidebarMini">
        <q-icon :name="sidebarMini ? 'chevron_right' : 'chevron_left'" size="20px" />
      </button>
    </q-drawer>

    <!-- Page Content -->
    <q-page-container class="page-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { useUIStore } from 'src/stores/ui';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const uiStore = useUIStore();

// Sidebar state
const sidebarOpen = computed({
  get: () => uiStore.isSidebarOpen,
  set: (value) => uiStore.setSidebarOpen(value),
});

const sidebarMini = computed({
  get: () => uiStore.isSidebarMini,
  set: (value) => uiStore.setSidebarMini(value),
});

// Section toggle states
const expandedSections = reactive({
  employees: true,
  attendance: false,
  leave: false,
  payroll: false,
  reports: false,
  claims: false,
  settings: false,
});

// Auth state
const userName = computed(() => authStore.userName);
const userEmail = computed(() => authStore.userEmail ?? '');
const userInitials = computed(() => authStore.userInitials);
const companyName = computed(() => authStore.companyName);
const isAdmin = computed(() => authStore.isAdmin);

// Current page
const currentPageTitle = computed(() => {
  return (route.meta?.title as string) || '';
});

// Notifications (placeholder)
const notifications = ref<Array<{ id: string; type: string; title: string; message: string }>>([]);
const unreadNotifications = computed(() => notifications.value.length);

// Computed section states
const isEmployeesSectionOpen = computed(() => expandedSections.employees);
const isAttendanceSectionOpen = computed(() => expandedSections.attendance);
const isLeaveSectionOpen = computed(() => expandedSections.leave);
const isPayrollSectionOpen = computed(() => expandedSections.payroll);
const isReportsSectionOpen = computed(() => expandedSections.reports);
const isClaimsSectionOpen = computed(() => expandedSections.claims);
const isSettingsSectionOpen = computed(() => expandedSections.settings);

// Methods
const toggleSidebar = () => {
  uiStore.toggleSidebar();
};

const toggleSidebarMini = () => {
  uiStore.toggleSidebarMini();
};

const handleSidebarClick = (e: Event) => {
  if (sidebarMini.value) {
    uiStore.setSidebarMini(false);
    e.stopPropagation();
  }
};

const toggleSection = (section: keyof typeof expandedSections) => {
  expandedSections[section] = !expandedSections[section];
};

const isActiveRoute = (path: string, exact = false) => {
  if (exact) {
    return route.path === path;
  }
  return route.path.startsWith(path);
};

const getCompanyInitial = (name: string) => {
  return name.charAt(0).toUpperCase();
};

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    leave: 'event',
    attendance: 'schedule',
    payroll: 'payments',
    claim: 'receipt_long',
  };
  return icons[type] || 'notifications';
};

const getNotificationColor = (type: string) => {
  const colors: Record<string, string> = {
    leave: 'primary',
    attendance: 'warning',
    payroll: 'positive',
    claim: 'info',
  };
  return colors[type] || 'grey';
};

const handleLogout = () => {
  $q.dialog({
    title: 'Sign Out',
    message: 'Are you sure you want to sign out?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void authStore.logout();
    void router.push('/auth/login');
  });
};
</script>

<style lang="scss" scoped>
// ==========================================
// HEADER STYLES
// ==========================================
.dashboard-header {
  background-color: #ffffff;
  color: #000000;
  border-bottom: 1px solid #e5e5e5;
}

.menu-btn {
  margin-right: 8px;
}

.breadcrumb {
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  color: #737373;

  &:hover {
    color: #000000;
    background-color: #f5f5f5;
  }
}

.user-menu-btn {
  padding: 4px 8px;
  color: #000000;

  .user-name {
    font-weight: 500;

    @media (max-width: 1024px) {
      display: none;
    }
  }
}

// ==========================================
// SIDEBAR STYLES - REDESIGNED
// ==========================================
.dashboard-sidebar {
  background: #ffffff !important;
  color: #000000;
  border-right: 1px solid #e5e5e5;

  :deep(.q-drawer__content) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}

// Brand/Logo Section
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  border-bottom: 1px solid #e5e5e5;
}

.brand-logo {
  width: 44px;
  height: 44px;
  background: #000000;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.logo-icon {
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  color: #000000 !important;
  letter-spacing: -0.5px;
}

.brand-tag {
  font-size: 11px;
  color: #737373 !important;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 2px;
}

// Company Selector
.company-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  margin: 16px 16px 0;
  background: #f5f5f5;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
}

.company-avatar {
  width: 36px;
  height: 36px;
  background: #000000;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: #ffffff !important;
}

.company-details {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.company-label {
  font-size: 10px;
  color: #737373 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.company-name {
  font-size: 14px;
  font-weight: 600;
  color: #000000 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// Navigation
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
}

.nav-section {
  margin-bottom: 24px;
}

.nav-section-title {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: #737373 !important;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 12px;
  margin-bottom: 8px;
}

// Nav Link
.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 2px 0;
  border-radius: 10px;
  color: #404040 !important;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
    color: #000000 !important;
  }

  &.active {
    background: #000000 !important;
    color: #ffffff !important;
    font-weight: 600;

    .nav-icon {
      color: #ffffff !important;
    }
  }
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: inherit;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
  color: inherit;
}

// Nav Group (Expandable)
.nav-group {
  margin: 2px 0;
}

.nav-group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 10px;
  color: #404040 !important;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    color: #000000 !important;
  }

  .nav-group.expanded & {
    color: #000000 !important;
  }
}

.nav-arrow {
  margin-left: auto;
  color: #737373 !important;
  transition: transform 0.2s ease;

  .nav-group.expanded & {
    color: #404040 !important;
  }
}

.nav-group-items {
  padding: 8px 0 8px 24px;
  border-left: 2px solid #e5e5e5;
  margin-left: 28px;
}

.nav-sublink {
  display: block;
  padding: 10px 16px;
  margin: 2px 0;
  border-radius: 8px;
  font-size: 13px;
  color: #525252 !important;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    color: #000000 !important;
  }

  &.active {
    background: #000000;
    color: #ffffff !important;
    font-weight: 500;
  }
}

// User Profile Footer
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5e5e5;
  margin-top: auto;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 12px;
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #000000 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: #737373 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  color: #737373 !important;

  &:hover {
    color: #ef4444 !important;
  }
}

// Sidebar Toggle Button
.sidebar-toggle {
  position: absolute;
  top: 50%;
  right: -14px;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #737373;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: #f5f5f5;
    color: #000000;
  }
}

// ==========================================
// PAGE CONTAINER
// ==========================================
.page-container {
  background-color: #fafafa;
  min-height: calc(100vh - 56px);
}

// ==========================================
// TRANSITIONS
// ==========================================
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// ==========================================
// MINI SIDEBAR OVERRIDES
// ==========================================
:deep(.q-drawer--mini) {
  .sidebar-brand {
    padding: 24px 16px;
    justify-content: center;
  }

  .company-selector,
  .sidebar-footer,
  .nav-section-title,
  .nav-group-items {
    display: none;
  }

  .nav-link,
  .nav-group-header {
    justify-content: center;
    padding: 12px;
  }

  .nav-icon {
    margin: 0;
  }

  .sidebar-toggle {
    right: -12px;
  }
}
</style>
