'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, hashPassword, LoginCredentials, ChangePasswordData, UpdateProfileData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  changePassword: (data: ChangePasswordData) => Promise<boolean>;
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
  createUser: (userData: { email: string; displayName: string; role: 'admin' | 'user'; password: string }) => Promise<boolean>;
  updateUser: (userId: string, data: { displayName?: string; role?: 'admin' | 'user' }) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'power_monitoring_auth';
const USERS_KEY = 'power_monitoring_users';

// Mock users with hashed passwords - in production, these would come from a backend
const defaultUsers: Array<User & { passwordHash: string }> = [
  {
    id: 'USR-001',
    email: 'admin@power-monitor.com',
    displayName: 'Admin User',
    role: 'admin',
    passwordHash: '', // Will be set after hashing 'admin123'
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: undefined,
  },
];

async function initializeDefaultUsers() {
  const users = [...defaultUsers];
  users[0].passwordHash = await hashPassword('admin123');
  return users;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<User & { passwordHash: string }>>([]);

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUsers = localStorage.getItem(USERS_KEY);
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        } else {
          const initialized = await initializeDefaultUsers();
          setUsers(initialized);
          localStorage.setItem(USERS_KEY, JSON.stringify(initialized));
        }

        const storedSession = localStorage.getItem(STORAGE_KEY);
        if (storedSession) {
          const sessionUser = JSON.parse(storedSession);
          setUser(sessionUser);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // Save user changes to localStorage
  const saveUsers = useCallback((updatedUsers: Array<User & { passwordHash: string }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    try {
      const foundUser = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      
      if (!foundUser) {
        setError('Invalid email or password');
        return false;
      }

      const isValidPassword = await hashPassword(credentials.password) === foundUser.passwordHash;
      
      if (!isValidPassword) {
        setError('Invalid email or password');
        return false;
      }

      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        displayName: foundUser.displayName,
        role: foundUser.role as 'admin' | 'user',
        createdAt: foundUser.createdAt,
        lastLogin: new Date().toISOString(),
      };

      // Update last login
      const updatedUsers = users.map(u => 
        u.id === foundUser.id ? { ...u, lastLogin: userData.lastLogin } : u
      );
      saveUsers(updatedUsers);

      // Store session
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (err) {
      setError('An error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [users, saveUsers]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordData): Promise<boolean> => {
    setError(null);
    
    if (!user) {
      setError('You must be logged in to change password');
      return false;
    }

    if (data.newPassword !== data.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    if (data.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    try {
      const foundUser = users.find(u => u.id === user.id);
      if (!foundUser) {
        setError('User not found');
        return false;
      }

      const currentHash = await hashPassword(data.currentPassword);
      if (currentHash !== foundUser.passwordHash) {
        setError('Current password is incorrect');
        return false;
      }

      const newHash = await hashPassword(data.newPassword);
      const updatedUsers = users.map(u =>
        u.id === user.id ? { ...u, passwordHash: newHash } : u
      );
      saveUsers(updatedUsers);
      
      return true;
    } catch (err) {
      setError('An error occurred while changing password');
      return false;
    }
  }, [user, users, saveUsers]);

  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<boolean> => {
    setError(null);
    
    if (!user) {
      setError('You must be logged in to update profile');
      return false;
    }

    try {
      // Check if email is being changed and if it's already in use
      if (data.email && data.email !== user.email) {
        const emailExists = users.some(u => u.email.toLowerCase() === data.email!.toLowerCase());
        if (emailExists) {
          setError('Email is already in use');
          return false;
        }
      }

      const updatedUsers = users.map(u => {
        if (u.id === user.id) {
          return {
            ...u,
            displayName: data.displayName || u.displayName,
            email: data.email || u.email,
          };
        }
        return u;
      });
      
      saveUsers(updatedUsers);

      // Update current user session
      const updatedUser: User = {
        ...user,
        displayName: data.displayName || user.displayName,
        email: data.email || user.email,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return true;
    } catch (err) {
      setError('An error occurred while updating profile');
      return false;
    }
  }, [user, users, saveUsers]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createUser = useCallback(async (userData: { email: string; displayName: string; role: 'admin' | 'user'; password: string }): Promise<boolean> => {
    setError(null);

    if (!user || user.role !== 'admin') {
      setError('Only admins can create users');
      return false;
    }

    if (!userData.email || !userData.password || !userData.displayName) {
      setError('All fields are required');
      return false;
    }

    // Check if email already exists
    const emailExists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (emailExists) {
      setError('Email already in use');
      return false;
    }

    try {
      const passwordHash = await hashPassword(userData.password);
      const newUser = {
        id: `USR-${String(users.length + 1).padStart(3, '0')}`,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);
      return true;
    } catch (err) {
      setError('Failed to create user');
      return false;
    }
  }, [user, users, saveUsers]);

  const updateUser = useCallback(async (userId: string, data: { displayName?: string; role?: 'admin' | 'user' }): Promise<boolean> => {
    setError(null);

    if (!user || user.role !== 'admin') {
      setError('Only admins can update users');
      return false;
    }

    // Cannot update yourself (prevent removing own admin)
    if (userId === user.id) {
      setError('Cannot modify your own account');
      return false;
    }

    try {
      const updatedUsers = users.map(u => {
        if (u.id === userId) {
          return { ...u, ...data };
        }
        return u;
      });
      saveUsers(updatedUsers);
      return true;
    } catch (err) {
      setError('Failed to update user');
      return false;
    }
  }, [user, users, saveUsers]);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    setError(null);

    if (!user || user.role !== 'admin') {
      setError('Only admins can delete users');
      return false;
    }

    // Cannot delete yourself
    if (userId === user.id) {
      setError('Cannot delete your own account');
      return false;
    }

    try {
      const updatedUsers = users.filter(u => u.id !== userId);
      saveUsers(updatedUsers);
      return true;
    } catch (err) {
      setError('Failed to delete user');
      return false;
    }
  }, [user, users, saveUsers]);

  const resetUserPassword = useCallback(async (userId: string, newPassword: string): Promise<boolean> => {
    setError(null);

    if (!user || user.role !== 'admin') {
      setError('Only admins can reset passwords');
      return false;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    try {
      const passwordHash = await hashPassword(newPassword);
      const updatedUsers = users.map(u => {
        if (u.id === userId) {
          return { ...u, passwordHash };
        }
        return u;
      });
      saveUsers(updatedUsers);
      return true;
    } catch (err) {
      setError('Failed to reset password');
      return false;
    }
  }, [user, users, saveUsers]);

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