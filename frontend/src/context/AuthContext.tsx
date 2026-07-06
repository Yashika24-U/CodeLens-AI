import React, { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";
import { Navigate } from "react-router-dom";

// 1. Define the User shape
interface User {
  id: string;
  email: string;
  username: string;
}

interface LoginResponse {
  success: boolean;
  user: User;
  message?: string;
}

// 2. Define what the Context provides to the rest of the app
interface AuthContextType {
  user: User | null;
  loading: boolean;
  token?: string;
  login: (email: string, password: string) => Promise<unknown>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// 3. Initialize Context (Exported safely from here!)
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // We type the response so TS knows response.data.user exists
    const checkAuth = async () => {
      try {
        const response = await api.get<{ user: User }>("/auth/me", {
          withCredentials: true,
        });
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResponse> => {
    // Axios allows us to pass a generic type to describe the response body
    const response = await api.post<LoginResponse>("/api/auth/login", {
      email,
      password,
    });
    setUser(response.data.user);
    return response.data;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.get("/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
