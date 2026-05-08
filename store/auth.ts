// import { create } from "zustand";
// import { User } from "@/lib/types";

// interface AuthState {
//   currentUser: User | null;
//   users: User[];
//   isLoading: boolean;
//   fetchUsers: () => Promise<void>;
//   login: (username: string, password: string) => User | null;
//   logout: () => void;
//   addUser: (user: Omit<User, "id" | "createdAt">) => Promise<void>;
//   updateUser: (id: string, data: Partial<User>) => Promise<void>;
//   deleteUser: (id: string) => Promise<void>;
// }

// export const useAuthStore = create<AuthState>((set, get) => ({
//   currentUser: null,
//   users: [],
//   isLoading: false,

//   fetchUsers: async () => {
//     set({ isLoading: true });
//     try {
//       const res = await fetch("/api/users");
//       const data = await res.json();
//       const users = Array.isArray(data) ? data : (data.users || data.data || []);
//       set({ users, isLoading: false });
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       set({ isLoading: false });
//     }
//   },

//   login: (username: string, password: string) => {
//     const { users } = get();
//     const user = users.find(
//       (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
//     );
//     if (user) {
//       set({ currentUser: user });
//       return user;
//     }
//     return null;
//   },

//   logout: () => {
//     set({ currentUser: null });
//   },

//   addUser: async (userData: Omit<User, "id" | "createdAt">) => {
//     const res = await fetch("/api/users", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(userData),
//     });
//     const newUser = await res.json();
//     set((state) => ({ users: [...state.users, newUser.data || newUser] }));
//   },

//   updateUser: async (id: string, data: Partial<User>) => {
//     const res = await fetch(`/api/users/${id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });
//     const updatedUser = await res.json();
//     set((state) => ({
//       users: state.users.map((user) => (user.id === id ? (updatedUser.data || updatedUser) : user)),
//     }));
//   },

//   deleteUser: async (id: string) => {
//     await fetch(`/api/users/${id}`, { method: "DELETE" });
//     set((state) => ({
//       users: state.users.filter((user) => user.id !== id),
//       currentUser: state.currentUser?.id === id ? null : state.currentUser,
//     }));
//   },
// }));


import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";

interface AuthState {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  // Ubah tipe return login jadi Promise karena sekarang request ke DB
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  addUser: (user: Omit<User, "id" | "createdAt">) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  currentUser: null,
  users: [],
  isLoading: false,

   fetchUsers: async () => {
     set({ isLoading: true });
     try {
       const res = await fetch("/api/users");
       const json = await res.json();
       const users = json.success ? json.data : (Array.isArray(json) ? json : []);
       const mappedUsers = users.map((u: any) => ({
         ...u,
         cabang: u.cabang || null
       }));
       set({ users: mappedUsers, isLoading: false });
     } catch (error) {
       console.error("Error fetching users:", error);
       set({ isLoading: false });
     }
   },

  // Logika login yang baru, langsung cek ke Supabase
  login: async (username, password) => {
  set({ isLoading: true });
  console.log("Mencoba login untuk:", username); // Debug 1

  try {
    const { data, error } = await supabase
      .from('User')
      .select(`
        *,
        cabang:Cabang!User_cabangId_fkey(*)
      `)
      .eq('username', username)
      .eq('password', password)
      .maybeSingle();

    if (error) {
      console.error("Supabase Error:", error.code, error.message); 
      set({ isLoading: false });
      return null;
    }

    console.log("User ditemukan:", data); // Debug 2
    set({ currentUser: data, isLoading: false });
    return data;
  } catch (err) {
    console.error("Sistem Error:", err);
    set({ isLoading: false });
    return null;
  }
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
     
     if (!res.ok) {
       const error = await res.json();
       throw new Error(error.error || error.message || "Gagal menambah user");
     }
     
     const json = await res.json();
     const newUser = json.success ? json.data : json;
     set((state) => ({ users: [...state.users, newUser] }));
   },

  updateUser: async (id: string, data: Partial<User>) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Gagal mengupdate user");
    }
    
    const json = await res.json();
    const updatedUser = json.success ? json.data : json;
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? updatedUser : user)),
    }));
  },

  deleteUser: async (id: string) => {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Gagal menghapus user");
    }
    
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
      currentUser: state.currentUser?.id === id ? null : state.currentUser,
    }));
  },
}),
{
  name: "auth-storage", // nama di localStorage
  partialize: (state) => ({ currentUser: state.currentUser }), // hanya simpan currentUser
}
));