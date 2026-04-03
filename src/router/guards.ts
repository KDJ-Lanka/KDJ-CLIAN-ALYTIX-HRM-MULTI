import type { RouteLocationNormalized, NavigationGuardReturn } from 'vue-router';

export function authGuard(
  to: RouteLocationNormalized
): NavigationGuardReturn {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresSuperAdmin = to.matched.some((record) => record.meta.requiresSuperAdmin);
  const isGuestRoute = to.matched.some((record) => record.meta.guest);

  // Check for Supabase session in localStorage (key format: sb-PROJECT_REF-auth-token)
  const hasSession = Object.keys(localStorage).some(key =>
    key.includes('auth-token')
  );

  // Handle super admin routes
  if (requiresSuperAdmin) {
    // Super admin login page - allow access
    if (to.path === '/super-admin/login') {
      // If already logged in as super admin, redirect to dashboard
      const superAdminAuth = localStorage.getItem('superAdminAuth');
      if (superAdminAuth === 'true') {
        return { path: '/super-admin/dashboard' };
      }
      return true;
    }
    // For other super admin routes, check if super admin is authenticated
    const superAdminAuth = localStorage.getItem('superAdminAuth');
    if (superAdminAuth !== 'true') {
      return { path: '/super-admin/login' };
    }
    return true;
  }

  // Check for guest routes first (except super admin login)
  if (isGuestRoute && hasSession) {
    // Exception: allow super admin login page even with session
    if (to.path === '/super-admin/login') {
      return true;
    }
    // Redirect to dashboard if user has session and tries to access guest routes
    return { path: '/dashboard' };
  }

  if (requiresAuth && !hasSession) {
    // Redirect to login if route requires auth and no session
    return {
      path: '/auth/login',
      query: { redirect: to.fullPath },
    };
  }

  return true;
}
