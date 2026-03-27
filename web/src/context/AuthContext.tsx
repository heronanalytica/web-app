"use client";
import { createContext, useEffect, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { fetcher, FetcherError } from "@/lib/fetcher";
import { AuthUser, EAuthRole } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const initialValue: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  refresh: async () => {},
  logout: async () => {},
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
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await fetcher.get<AuthUser>("/api/auth/me");
      setUser(data);
    } catch (error) {
      const isAuthFailure =
        error instanceof FetcherError &&
        (error.status === 401 || error.status === 403);

      if (isAuthFailure) {
        setUser(null);
        if (!SKIP_AUTH_REDIRECT.includes(pathname)) {
          router.replace(ROUTES.LOGIN);
        }
        return;
      }

      console.error("Failed to refresh auth session:", error);
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const isAdmin = user?.role === EAuthRole.ADMIN;

  const logout = useCallback(async () => {
    try {
      await fetcher.post("/api/auth/logout");
      // Clear user data
      setUser(null);
      // Still redirect to homepage even if logout API call fails
      window.location.href = ROUTES.LOGIN;
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect to homepage even if logout API call fails
      window.location.href = ROUTES.LOGIN;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        loading,
        refresh: fetchUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
