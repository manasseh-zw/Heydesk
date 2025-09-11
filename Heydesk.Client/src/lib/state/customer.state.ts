import type { Customer } from "@/lib/types/auth";
import { Store } from "@tanstack/store";
import { storage, STORAGE_KEYS } from "@/lib/utils/storage";

export type CustomerAuthState = {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentOrganization: string | null; // Current organization slug for context switching
};

// Load initial state from localStorage
const getInitialState = (): CustomerAuthState => {
  const savedState = storage.get<CustomerAuthState>(STORAGE_KEYS.CUSTOMER_AUTH_STATE);
  
  if (savedState) {
    return {
      ...savedState,
      isLoading: true, // Always start with loading true on app start
    };
  }
  
  return {
    customer: null,
    isAuthenticated: false,
    isLoading: true,
    currentOrganization: null,
  };
};

export const customerAuthState = new Store<CustomerAuthState>(getInitialState());

// Helper to persist state to localStorage
const persistState = (state: CustomerAuthState) => {
  // Only persist customer data and current org, not loading states
  const stateToPersist = {
    customer: state.customer,
    isAuthenticated: state.isAuthenticated,
    isLoading: false, // Don't persist loading state
    currentOrganization: state.currentOrganization,
  };
  storage.set(STORAGE_KEYS.CUSTOMER_AUTH_STATE, stateToPersist);
};

export const customerAuthActions = {
  setCustomer: (customer: Customer | null) => {
    const newState = {
      customer,
      isAuthenticated: !!customer,
      isLoading: false,
      currentOrganization: customer?.organizations?.[0] || null, // Set first org slug as default
    };
    
    customerAuthState.setState((state) => ({
      ...state,
      ...newState,
    }));
    
    persistState(customerAuthState.state);
  },
  
  setCurrentOrganization: (organizationSlug: string | null) => {
    customerAuthState.setState((state) => ({
      ...state,
      currentOrganization: organizationSlug,
    }));
    
    persistState(customerAuthState.state);
  },
  
  clearCustomer: () => {
    const newState = {
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      currentOrganization: null,
    };
    
    customerAuthState.setState((state) => ({
      ...state,
      ...newState,
    }));
    
    // Clear from localStorage on logout
    storage.remove(STORAGE_KEYS.CUSTOMER_AUTH_STATE);
  },
  
  setLoading: (isLoading: boolean) => {
    customerAuthState.setState((state) => ({
      ...state,
      isLoading,
    }));
    // Don't persist loading state changes
  },
};
