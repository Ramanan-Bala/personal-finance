"use client";

import api from "@/lib/api/axios";
import { toastStore } from "@/lib/store/toast-store";
import { useRouter } from "next/navigation";
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

interface Verify2faDTO {
  email: string;
  otp: string;
}

interface ResetPasswordDTO {
  email: string;
  otp: string;
  newPassword: string;
}

interface User {
  email: string;
  name: string;
  phone?: string;
  is2faEnabled?: boolean;
  currency?: string;
  dateFormat?: string;
  fontFamily?: string;
  timezone?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  name: string;
  phone?: string;
  is2faEnabled?: boolean;
  currency?: string;
  dateFormat?: string;
  fontFamily?: string;
  timezone?: string;
}

interface LoginAcceptResponse {
  twoFactorRequired: boolean;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: LoginDTO) => Promise<LoginResponse | LoginAcceptResponse>;
  register: (userData: RegisterDTO) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  verify2fa: (data: Verify2faDTO) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordDTO) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  const handleLoginSuccess = (response: { data: LoginResponse }) => {
    const userData: User = {
      email: response.data.email,
      name: response.data.name,
      phone: response.data.phone,
      is2faEnabled: response.data.is2faEnabled,
      currency: response.data.currency,
      dateFormat: response.data.dateFormat,
      fontFamily: response.data.fontFamily,
      timezone: response.data.timezone,
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
    return response.data;
  };

  const login = async (formData: LoginDTO) => {
    const response = await api.post<LoginResponse | LoginAcceptResponse>(
      "/auth/login",
      formData,
    );
    if (response.status === 202) {
      return response.data; // twoFactorRequired
    }
    return handleLoginSuccess(response as { data: LoginResponse });
  };

  const verify2fa = async (data: Verify2faDTO) => {
    const response = await api.post<LoginResponse>("/auth/verify-2fa", data);
    handleLoginSuccess(response);
  };

  const register = async (formData: RegisterDTO) => {
    const response = await api.post<LoginResponse>("/auth/register", formData);
    handleLoginSuccess(response);
  };

  const forgotPassword = async (email: string) => {
    await api.post("/auth/forgot-password", { email });
  };

  const resetPassword = async (data: ResetPasswordDTO) => {
    await api.post("/auth/reset-password", data);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const updateProfile = async (userData: Partial<User>) => {
    const response = await api.patch<User>("/users/profile", userData, {
      showSuccessToast: true,
    });
    updateUser(response.data);
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
        updateProfile,
        verify2fa,
        forgotPassword,
        resetPassword,
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
