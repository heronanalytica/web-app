"use client";
import { createContext, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  role: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const initialValue: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  loading: false,
  refresh: async () => {},
};

export const AuthContext = createContext<AuthContextValue>(initialValue);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/auth/me`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Not authenticated");

      const data = await res.json();
      setUser(data.data);
      console.log("Set User data:", data.data)
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("User changed:", user);
    console.log("isAuthenticated:", !!user);
  }, [user]);

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        refresh: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
