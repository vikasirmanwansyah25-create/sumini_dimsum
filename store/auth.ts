import { create } from "zustand";
import { User } from "@/lib/types";

interface AuthState {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  login: (username: string, password: string) => User | null;
  logout: () => void;
  addUser: (user: Omit<User, "id" | "createdAt">) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  users: [],
  isLoading: false,

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/users");
      const users = await res.json();
      set({ users, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  login: (username: string, password: string) => {
    const { users } = get();
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (user) {
      set({ currentUser: user });
      return user;
    }
    return null;
  },

  logout: () => {
    set({ currentUser: null });
  },

  addUser: async (userData: Omit<User, "id" | "createdAt">) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const newUser = await res.json();
    set((state) => ({ users: [newUser, ...state.users] }));
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updatedUser = await res.json();
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? updatedUser : user)),
    }));
  },

  deleteUser: async (id: string) => {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
      currentUser: state.currentUser?.id === id ? null : state.currentUser,
    }));
  },
}));