import { create } from "zustand";

interface AdminState {
  activeTab: string;
  sidebarOpen: boolean;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  activeTab: "overview",
  sidebarOpen: true,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
