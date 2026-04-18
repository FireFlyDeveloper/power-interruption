'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, ChangePasswordData, UpdateProfileData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
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
        const res = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setUser(null);
        }
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        return true;
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
        return false;
      }
    } catch (err) {
      setError('An error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
    }
  }, []);

  // For this simple implementation, we omit the admin user management fetches 
  // and placeholder them to return false. They can be added as needed.
  const changePassword = async (data: ChangePasswordData) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
        credentials: 'include'
      });
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to change password');
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      setError('An error occurred while changing password');
      return false;
    }
  };
  const updateProfile = async (data: UpdateProfileData) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
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
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isLoading,
      error,
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