'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, ChangePasswordData, UpdateProfileData } from '@/types/auth';
import { authService } from './services/authService';

interface AuthContextType {
  user: User | null;
  users: User[];
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  getToken: () => string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<boolean>;
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
  createUser: (userData: { email: string; displayName: string; role: 'admin' | 'user'; password: string }) => Promise<boolean>;
  updateUser: (userId: string, data: { displayName?: string; role?: 'admin' | 'user' }) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to load session:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await authService.login(credentials);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setUser(data.user || data);
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  // For this simple implementation, we omit the admin user management fetches 
  // and placeholder them to return false. They can be added as needed.
  const changePassword = async (data: ChangePasswordData) => {
    setError(null);
    try {
      await authService.changePassword(data);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
      return false;
    }
  };
  const updateProfile = async (data: UpdateProfileData) => {
    setError(null);
    try {
      const userData = await authService.updateProfile(data);
      setUser(userData);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      return false;
    }
  };
  const createUser = async () => false;
  const updateUser = async () => false;
  const deleteUser = async () => false;
  const resetUserPassword = async () => false;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      users,
      token: getToken(),
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isLoading,
      error,
      getToken,
      login,
      logout,
      changePassword,
      updateProfile,
      createUser,
      updateUser,
      deleteUser,
      resetUserPassword,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}