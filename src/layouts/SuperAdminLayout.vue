<template>
  <q-layout view="lHh Lpr lFf" class="super-admin-layout">
    <!-- Sidebar -->
    <q-drawer
      v-model="sidebarOpen"
      show-if-above
      :width="260"
      :breakpoint="1024"
      class="sidebar"
    >
      <div class="sidebar-header">
        <div class="brand">
          <q-icon name="admin_panel_settings" size="28px" />
          <span class="brand-text">Super Admin</span>
        </div>
        <div class="platform-badge">ANLYTIX PLATFORM</div>
      </div>

      <q-scroll-area class="sidebar-scroll">
        <q-list class="nav-list">
          <q-item-label header class="nav-label">Overview</q-item-label>

          <q-item
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            clickable
            class="nav-item"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <div class="sidebar-footer">
        <q-separator />
        <div class="admin-info">
          <q-avatar size="36px" color="black" text-color="white">
            {{ adminInitials }}
          </q-avatar>
          <div class="admin-details">
            <div class="admin-name">{{ superAdminStore.superAdmin?.full_name || 'Admin' }}</div>
            <div class="admin-role">{{ superAdminStore.superAdmin?.role }}</div>
          </div>
        </div>
      </div>
    </q-drawer>

    <!-- Header -->
    <q-header class="header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="sidebarOpen = !sidebarOpen" class="menu-btn" />

        <q-toolbar-title class="toolbar-title">
          {{ currentPageTitle }}
        </q-toolbar-title>

        <q-space />

        <q-btn flat dense round icon="refresh" @click="refreshData" class="q-mr-sm">
          <q-tooltip>Refresh</q-tooltip>
        </q-btn>

        <q-btn flat dense round icon="logout" @click="handleLogout" class="logout-btn">
          <q-tooltip>Logout</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Page Content -->
    <q-page-container>
      <router-view />
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
  }).onOk(() => {
    void superAdminStore.logout();
    void router.push('/super-admin/login');
  });
};
</script>

<style lang="scss" scoped>
.super-admin-layout {
  background: var(--color-gray-50);
}

.sidebar {
  background: var(--color-black) !important;
  color: var(--color-white);
}

.sidebar-header {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-gray-800);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.brand-text {
  font-size: 18px;
  font-weight: 700;
}

.platform-badge {
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--color-gray-400);
  margin-top: var(--spacing-1);
}

.sidebar-scroll {
  height: calc(100vh - 200px);
}

.nav-list {
  padding: var(--spacing-2);
}

.nav-label {
  color: var(--color-gray-500) !important;
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-1);
}

.nav-item {
  border-radius: var(--radius-md);
  margin: 2px 0;
  color: var(--color-gray-300) !important;

  :deep(.q-item__section--avatar) {
    color: var(--color-gray-300);
  }

  :deep(.q-item__label) {
    color: var(--color-gray-300);
  }

  &:hover {
    background: var(--color-gray-800);
    color: var(--color-white) !important;

    :deep(.q-item__section--avatar),
    :deep(.q-item__label) {
      color: var(--color-white);
    }
  }
}

.nav-item-active {
  background: var(--color-white) !important;
  color: var(--color-black) !important;

  :deep(.q-item__section--avatar),
  :deep(.q-item__label) {
    color: var(--color-black) !important;
  }
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-black);
}

.admin-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-gray-900);
}

.admin-details {
  display: flex;
  flex-direction: column;
}

.admin-name {
  font-weight: 500;
  font-size: 14px;
  color: var(--color-white);
}

.admin-role {
  font-size: 12px;
  color: var(--color-gray-400);
  text-transform: capitalize;
}

.header {
  background: var(--color-white);
  color: var(--color-black);
  border-bottom: 1px solid var(--color-gray-200);
}

.toolbar-title {
  font-size: 18px;
  font-weight: 600;
}

.menu-btn {
  margin-right: var(--spacing-2);
}

.logout-btn:hover {
  color: var(--color-error);
}
</style>
