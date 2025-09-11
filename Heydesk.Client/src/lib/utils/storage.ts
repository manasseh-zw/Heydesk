// Storage utilities for persisting state
export const storage = {
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to save to localStorage:`, error);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Failed to read from localStorage:`, error);
      return null;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove from localStorage:`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn(`Failed to clear localStorage:`, error);
    }
  },
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_STATE: 'heydesk_auth_state',
  CUSTOMER_AUTH_STATE: 'heydesk_customer_auth_state',
  PENDING_SUPPORT_ORG_SLUG: 'heydesk_pending_support_org_slug',
} as const;
