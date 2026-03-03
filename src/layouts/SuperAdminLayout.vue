<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="sidebarOpen = !sidebarOpen"
          class="menu-btn"
        />

        <q-toolbar-title class="toolbar-title">
          {{ currentPageTitle }}
        </q-toolbar-title>

        <q-space />

        <q-btn flat dense round icon="refresh" @click="refreshData" class="header-btn">
          <q-tooltip>Refresh</q-tooltip>
        </q-btn>

        <q-btn flat dense round icon="logout" @click="handleLogout" class="logout-btn">
          <q-tooltip>Logout</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Sidebar -->
    <q-drawer
      v-model="sidebarOpen"
      show-if-above
      :width="280"
      :breakpoint="1024"
      class="sidebar"
    >
      <!-- Logo & Brand Section -->
      <div class="sidebar-brand">
        <div class="brand-logo">
          <span class="logo-icon">A</span>
        </div>
        <div class="brand-info">
          <span class="brand-name">Super Admin</span>
          <span class="brand-tag">ANLYTIX PLATFORM</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-section-title">Overview</span>

          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            :class="{ active: isActiveRoute(item.path) }"
          >
            <span class="nav-icon">
              <q-icon :name="item.icon" size="20px" />
            </span>
            <span class="nav-label">{{ item.label }}</span>
          </router-link>
        </div>
      </nav>

      <!-- User Profile Footer -->
      <div class="sidebar-footer">
        <div class="user-profile">
          <q-avatar size="40px" color="grey-8" text-color="white">
            {{ adminInitials }}
          </q-avatar>
          <div class="user-info">
            <span class="user-name">{{ superAdminStore.superAdmin?.full_name || 'Admin' }}</span>
            <span class="user-role">{{ superAdminStore.superAdmin?.role || 'Super Admin' }}</span>
          </div>
          <q-btn flat dense round icon="logout" size="sm" @click="handleLogout" class="logout-btn-small">
            <q-tooltip>Sign Out</q-tooltip>
          </q-btn>
        </div>
      </div>
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
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSuperAdminStore } from 'src/stores/superAdmin';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const superAdminStore = useSuperAdminStore();

const sidebarOpen = ref(true);

const navItems = [
  { path: '/super-admin', label: 'Dashboard', icon: 'dashboard' },
  { path: '/super-admin/companies', label: 'Companies', icon: 'business' },
  { path: '/super-admin/users', label: 'Users', icon: 'people' },
  { path: '/super-admin/analytics', label: 'Analytics', icon: 'analytics' },
  { path: '/super-admin/billing', label: 'Billing', icon: 'receipt_long' },
  { path: '/super-admin/support', label: 'Support', icon: 'support_agent' },
  { path: '/super-admin/settings', label: 'Settings', icon: 'settings' },
];

const currentPageTitle = computed(() => {
  const item = navItems.find((i) => i.path === route.path);
  return item?.label || 'Dashboard';
});

const adminInitials = computed(() => {
  const name = superAdminStore.superAdmin?.full_name || 'SA';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const isActiveRoute = (path: string) => {
  if (path === '/super-admin') {
    return route.path === '/super-admin' || route.path === '/super-admin/dashboard';
  }
  return route.path.startsWith(path);
};

const refreshData = async () => {
  $q.notify({ type: 'info', message: 'Refreshing data...' });
  await superAdminStore.fetchStats();
  await superAdminStore.fetchCompanies();
  $q.notify({ type: 'positive', message: 'Data refreshed' });
};

const handleLogout = () => {
  $q.dialog({
    title: 'Sign Out',
    message: 'Are you sure you want to sign out?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void superAdminStore.logout();
    void router.push('/super-admin/login');
  });
};
</script>

<style lang="scss" scoped>
// ==========================================
// HEADER STYLES
// ==========================================
.header {
  background-color: #ffffff;
  color: #000000;
  border-bottom: 1px solid #e5e5e5;
}

.menu-btn {
  margin-right: 8px;
}

.toolbar-title {
  font-size: 18px;
  font-weight: 600;
}

.header-btn {
  color: #737373;

  &:hover {
    color: #000000;
    background-color: #f5f5f5;
  }
}

.logout-btn {
  color: #737373;

  &:hover {
    color: #ef4444;
  }
}

// ==========================================
// SIDEBAR STYLES - WHITE THEME
// ==========================================
.sidebar {
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
  font-size: 18px;
  font-weight: 700;
  color: #000000;
}

.brand-tag {
  font-size: 10px;
  color: #737373;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 2px;
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
  color: #737373;
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
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #737373;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn-small {
  color: #737373;

  &:hover {
    color: #ef4444;
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
</style>
