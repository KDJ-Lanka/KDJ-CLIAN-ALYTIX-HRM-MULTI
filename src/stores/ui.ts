import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', {
  state: () => ({
    sidebarOpen: true,
    sidebarMini: false,
    rightDrawerOpen: false,
    notifications: [] as Array<{
      id: string;
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      timeout?: number;
    }>,
  }),

  getters: {
    isSidebarOpen: (state) => state.sidebarOpen,
    isSidebarMini: (state) => state.sidebarMini,
  },

  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },

    toggleSidebarMini() {
      this.sidebarMini = !this.sidebarMini;
    },

    setSidebarOpen(value: boolean) {
      this.sidebarOpen = value;
    },

    setSidebarMini(value: boolean) {
      this.sidebarMini = value;
    },

    toggleRightDrawer() {
      this.rightDrawerOpen = !this.rightDrawerOpen;
    },

    addNotification(notification: {
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      timeout?: number;
    }) {
      const id = Date.now().toString();
      this.notifications.push({ ...notification, id });
      return id;
    },

    removeNotification(id: string) {
      const index = this.notifications.findIndex((n) => n.id === id);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    },

    clearNotifications() {
      this.notifications = [];
    },
  },
});
