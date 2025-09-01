import type { User } from "@/lib/types/auth";
import { Store } from "@tanstack/store";

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export const authState = new Store<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

export const authActions = {
  setUser: (user: User | null) => {
    authState.setState((state) => ({
      ...state,
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }));
  },
  clearUser: () => {
    authState.setState((state) => ({
      ...state,
      user: null,
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
