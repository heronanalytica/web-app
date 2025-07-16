"use client";
import { createContext, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { fetcher } from "@/lib/fetcher";

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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await fetcher.get<User>("/api/auth/me");
      setUser(data);
    } catch {
      setUser(null);
      router.push(ROUTES.LOGIN);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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
