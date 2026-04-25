'use client';

import { useEffect } from 'react';
import { useAppSettings } from '@/context/AppSettingsContext';

/**
 * Injects CSS overrides for light mode into a <style> element in the <head>.
 * This approach bypasses Tailwind v4's build-time CSS stripping.
 */
export default function StyleInjector() {
  const { settings } = useAppSettings();

  useEffect(() => {
    let styleEl = document.getElementById('light-mode-overrides');
    if (settings.darkMode) {
      // Dark mode — no overrides needed. Remove existing if any.
      if (styleEl) styleEl.remove();
      return;
    }

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'light-mode-overrides';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
/* Light mode: override hardcoded Tailwind arbitrary colors */
html.light, html.light body {
  background-color: #f8fafc !important;
  color: #1e293b !important;
}

/* Background overrides — dark bg -> light bg */
html.light [class*="-0C1119"] { background-color: #f8fafc !important; }
html.light [class*="-141C28"] { background-color: #ffffff !important; }
html.light [class*="-142336"] { background-color: #f1f5f9 !important; }
html.light [class*="-1F314F"] { background-color: #e2e8f0 !important; }
html.light [class*="-122336"],
html.light [class*="-101E30"],
html.light [class*="-101C2C"],
html.light [class*="-101C2A"],
html.light [class*="-0F1724"],
html.light [class*="-0F1A28"],
html.light [class*="-0F1D2F"],
html.light [class*="-0F1E30"],
html.light [class*="-0F2037"],
html.light [class*="-1a2234"] { background-color: #f1f5f9 !important; }

/* Border overrides */
html.light [class*="-273953"] { border-color: #cbd5e1 !important; }
html.light [class*="-3E5D88"] { border-color: #94a3b8 !important; }

/* Text overrides — keep status indicators, override standard text */
html.light [class*="gray-200"] { color: #1e293b !important; }
html.light [class*="gray-300"] { color: #334155 !important; }
html.light [class*="gray-400"] { color: #64748b !important; }
html.light [class*="gray-500"] { color: #94a3b8 !important; }
html.light [class*="text-white"] { color: #1e293b !important; }

/* Keep status indicator text colors (green/red/gold) */
html.light [class*="E5A5A5"] { color: #e5a5a5 !important; }
html.light [class*="F9B5B5"] { color: #f9b5b5 !important; }
html.light [class*="FCC5C5"] { color: #fcc5c5 !important; }
html.light [class*="FCDBA0"] { color: #fcdba0 !important; }
html.light [class*="FCE6B4"] { color: #fce6b4 !important; }
html.light [class*="F0CF8F"] { color: #f0cf8f !important; }
html.light [class*="BCF0D5"] { color: #bcf0d5 !important; }
html.light [class*="B2D2F5"] { color: #b2d2f5 !important; }
html.light [class*="B6D0F5"] { color: #b6d0f5 !important; }
html.light [class*="059669"] { color: #059669 !important; }
html.light [class*="d97706"] { color: #d97706 !important; }
html.light [class*="dc2626"] { color: #dc2626 !important; }

/* Hover state overrides */
html.light [class*="1F3450"]:hover { background-color: #e2e8f0 !important; }
html.light [class*="2A3E5A"]:hover { background-color: #e2e8f0 !important; }
html.light [class*="4D5F6F"]:hover { background-color: #e2e8f0 !important; }
`;
  }, [settings.darkMode]);

  return null;
}
