import type { User } from "@/lib/types/auth";
import type { Organization } from "@/lib/types/organization";
import { Store } from "@tanstack/store";

export type AuthState = {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export const authState = new Store<AuthState>({
  user: null,
  organization: null,
  isAuthenticated: false,
  isLoading: true,
});

export const authActions = {
  setUser: (user: User | null) => {
    authState.setState((state) => ({
      ...state,
      user,
      organization: user?.organization || null,
      isAuthenticated: !!user,
      isLoading: false,
    }));
  },
  setOrganization: (organization: Organization | null) => {
    authState.setState((state) => ({
      ...state,
      organization,
    }));
  },
  clearUser: () => {
    authState.setState((state) => ({
      ...state,
      user: null,
      organization: null,
      isAuthenticated: false,
      isLoading: false,
    }));
  },
  setLoading: (isLoading: boolean) => {
    authState.setState((state) => ({
      ...state,
      isLoading,
    }));
  },
};
