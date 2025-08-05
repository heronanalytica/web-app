"use client";
import { createContext, useEffect, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // 👈 need pathname
import { ROUTES } from "@/constants/routes";
import { fetcher } from "@/lib/fetcher";

type User = { id: string; email: string; role: string };

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

const SKIP_AUTH_REDIRECT: string[] = [
  ROUTES.HOMEPAGE,
  ROUTES.PRICING,
  ROUTES.CONTACT,
  ROUTES.LOGIN,
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname(); // current route
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await fetcher.get<User>("/api/auth/me");
      setUser(data);
    } catch {
      setUser(null);
      if (!SKIP_AUTH_REDIRECT.includes(pathname)) {
        router.push(ROUTES.LOGIN);
      }
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

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
