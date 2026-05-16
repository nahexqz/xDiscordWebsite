import { create } from "zustand";
import axios from "axios";

export interface User {
  id: string;
  discordId: string;
  username: string;
  email?: string;
  avatar?: string;
  isAdmin: boolean;
  wallet?: {
    balance: number;
  };
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  fetchUser: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get("/api/auth/me");
      set({ user: res.data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  logout: async () => {
    try {
      await axios.post("/api/auth/logout");
      set({ user: null });
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  },

  setUser: (user) => set({ user }),
}));
