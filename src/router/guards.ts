import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
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
        next({ path: '/super-admin/dashboard' });
        return;
      }
      next();
      return;
    }
    // For other super admin routes, check if super admin is authenticated
    const superAdminAuth = localStorage.getItem('superAdminAuth');
    if (superAdminAuth !== 'true') {
      next({ path: '/super-admin/login' });
      return;
    }
    next();
    return;
  }

  // Check for guest routes first (except super admin login)
  if (isGuestRoute && hasSession) {
    // Exception: allow super admin login page even with session
    if (to.path === '/super-admin/login') {
      next();
      return;
    }
    // Redirect to dashboard if user has session and tries to access guest routes
    next({ path: '/dashboard' });
    return;
  }

  if (requiresAuth && !hasSession) {
    // Redirect to login if route requires auth and no session
    next({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  next();
}
