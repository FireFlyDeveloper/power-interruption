'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface AppSettings {
  darkMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  notifications: boolean;
  emailAlerts: boolean;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const STORAGE_KEY = 'power-interruption-settings';

const defaultSettings: AppSettings = {
  darkMode: true,
  autoRefresh: true,
  refreshInterval: 30,
  notifications: true,
  emailAlerts: false,
};

function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch {}
  return defaultSettings;
}

function saveSettings(settings: AppSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

function applyDarkMode(darkMode: boolean) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (darkMode) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    applyDarkMode(s.darkMode);
    setLoaded(true);
  }, []);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      if (key === 'darkMode') {
        applyDarkMode(value as boolean);
      }
      return next;
    });
  }, []);

  return (
    <AppSettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}
