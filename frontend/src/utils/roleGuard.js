/**
 * ============================================================================
 * CRITICAL: CENTRALIZED ROLE ISOLATION ROUTE-GUARD (SINGLE SOURCE OF TRUTH)
 * ============================================================================
 * ⚠️ WARNING: DO NOT DUPLICATE OR BYPASS THIS LOGIC IN ANY COMPONENT.
 * Role isolation has previously regressed when individual components implemented
 * their own fragmented tab-checking arrays.
 *
 * ALL role-based tab access, page rendering, navigation links, and URL checks
 * MUST go strictly through the functions defined in this file.
 * ============================================================================
 */

export const ROLE_ALLOWED_TABS = {
  artisan: [
    'artisan-home',
    'artisan-orders',
    'camera',
    'voice',
    'pricing',
    'catalog',
    'detail',
    'certificate',
    'whatsapp',
    'analytics',
    'community'
  ],
  buyer: [
    'buyer-market',
    'detail',
    'cart',
    'orders',
    'wishlist',
    'certificate',
    'community'
  ],
  businessman: [
    'businessman-home',
    'businessman-orders',
    'gem',
    'detail',
    'certificate',
    'whatsapp',
    'community'
  ]
};

export const ROLE_DEFAULT_TAB = {
  artisan: 'artisan-home',
  buyer: 'buyer-market',
  businessman: 'businessman-home'
};

/**
 * Checks if a specific tab is permitted for the active user role.
 */
export const isTabAllowedForRole = (role, tab) => {
  const normalizedRole = role === 'businessman' ? 'businessman' : (role === 'buyer' ? 'buyer' : 'artisan');
  const allowed = ROLE_ALLOWED_TABS[normalizedRole] || ROLE_ALLOWED_TABS.artisan;
  return allowed.includes(tab);
};

/**
 * Returns a guaranteed valid tab for the given role.
 * If the requested tab is forbidden for the active role, returns the role's default home tab.
 */
export const getSafeTabForRole = (role, requestedTab) => {
  const normalizedRole = role === 'businessman' ? 'businessman' : (role === 'buyer' ? 'buyer' : 'artisan');
  if (isTabAllowedForRole(normalizedRole, requestedTab)) {
    return requestedTab;
  }
  console.warn(`[RoleGuard] Tab '${requestedTab}' is forbidden for role '${normalizedRole}'. Falling back to default home.`);
  return ROLE_DEFAULT_TAB[normalizedRole] || 'artisan-home';
};
