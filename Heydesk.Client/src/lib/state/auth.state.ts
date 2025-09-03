import type { User } from "@/lib/types/auth";
import type { Organization } from "@/lib/types/organization";
import { Store } from "@tanstack/store";
import { storage, STORAGE_KEYS } from "@/lib/utils/storage";

export type AuthState = {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

// Load initial state from localStorage
const getInitialState = (): AuthState => {
  const savedState = storage.get<AuthState>(STORAGE_KEYS.AUTH_STATE);
  
  if (savedState) {
    return {
      ...savedState,
      isLoading: true, // Always start with loading true on app start
    };
  }
  
  return {
    user: null,
    organization: null,
    isAuthenticated: false,
    isLoading: true,
  };
};

export const authState = new Store<AuthState>(getInitialState());

// Helper to persist state to localStorage
const persistState = (state: AuthState) => {
  // Only persist user and organization data, not loading states
  const stateToPersist = {
    user: state.user,
    organization: state.organization,
    isAuthenticated: state.isAuthenticated,
    isLoading: false, // Don't persist loading state
  };
  storage.set(STORAGE_KEYS.AUTH_STATE, stateToPersist);
};

export const authActions = {
  setUser: (user: User | null) => {
    const newState = {
      user,
      organization: user?.organization || null,
      isAuthenticated: !!user,
      isLoading: false,
    };
    
    authState.setState((state) => ({
      ...state,
      ...newState,
    }));
    
    persistState(authState.state);
  },
  
  setOrganization: (organization: Organization | null) => {
    authState.setState((state) => ({
      ...state,
      organization,
    }));
    
    persistState(authState.state);
  },
  
  clearUser: () => {
    const newState = {
      user: null,
      organization: null,
      isAuthenticated: false,
      isLoading: false,
    };
    
    authState.setState((state) => ({
      ...state,
      ...newState,
    }));
    
    // Clear from localStorage on logout
    storage.remove(STORAGE_KEYS.AUTH_STATE);
  },
  
  setLoading: (isLoading: boolean) => {
    authState.setState((state) => ({
      ...state,
      isLoading,
    }));
    // Don't persist loading state changes
  },
};
