"use client";

import { toastStore } from "@/lib/store/toast-store";
import api from "@/lib/api/axios";
import { redirect } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface LoginDTO {
  email: string;
  password: string;
}

interface RegisterDTO extends LoginDTO {
  name: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: Omit<LoginResponse, "accessToken" | "refreshToken"> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: LoginDTO) => Promise<void>;
  register: (userData: RegisterDTO) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<LoginResponse>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<
    LoginResponse,
    "accessToken" | "refreshToken"
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = useMemo(() => !!user, [user]);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (formData: LoginDTO) => {
    const response = await api.post<LoginResponse>("/auth/login", formData);
    const userData = {
      email: response.data.email,
      name: response.data.name,
    };
    setUser(userData);
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    toastStore.getState().addToast({
      title: "Login",
      description: "Login successful",
      type: "success",
    });
    redirect("/dashboard");
  };

  const register = async (formData: RegisterDTO) => {
    const response = await api.post<LoginResponse>("/auth/register", formData);
    const userData = {
      email: response.data.email,
      name: response.data.name,
    };
    setUser(userData);
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    toastStore.getState().addToast({
      title: "Login",
      description: "Login successful",
      type: "success",
    });
    redirect("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (userData: Partial<LoginResponse>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
