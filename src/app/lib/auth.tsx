"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useApolloClient } from "@apollo/client";
import { ME_QUERY } from "../graphql/auth";

export type UserRole = "ADMIN" | "REVIEWER";

export type User = {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (payload: AuthPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const apolloClient = useApolloClient();

  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  const hasToken =
    typeof window !== "undefined" &&
    window.localStorage.getItem(AUTH_TOKEN_KEY);

  const { data, loading, error } = useQuery(ME_QUERY, {
    skip: !hasToken,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (!loading && !initialized) {
      if (data?.me) {
        setUser(data.me as User);
      } else if (error) {
        // Clear invalid tokens
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(AUTH_TOKEN_KEY);
          window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
      setInitialized(true);
    }
  }, [data, error, loading, initialized]);

  const login = useCallback(
    async (payload: AuthPayload) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(AUTH_TOKEN_KEY, payload.accessToken);
        window.localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
      }

      setUser(payload.user);
      await apolloClient.clearStore();
      router.push("/dashboard");
    },
    [apolloClient, router],
  );

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    setUser(null);
    await apolloClient.clearStore();

    if (pathname !== "/login") {
      router.push("/login");
    }
  }, [apolloClient, pathname, router]);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      loading: loading && !initialized,
      login,
      logout,
    }),
    [user, loading, initialized, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
};

export const useCurrentUser = () => {
  const { user, loading } = useAuth();
  return { user, loading };
};


