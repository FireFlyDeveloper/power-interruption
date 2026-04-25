'use client';

import { useEffect } from 'react';
import { useAppSettings } from '@/context/AppSettingsContext';

/**
 * Injects CSS overrides for light mode into a <style> element in the <head>.
 * Targets arbitrary-value Tailwind classes like "bg-[#0C1119]" by matching
 * the hex color portion with the "#" prefix, e.g., [class*="#0C1119"].
 */
export default function StyleInjector() {
  const { settings } = useAppSettings();

  useEffect(() => {
    let styleEl = document.getElementById('light-mode-overrides');
    if (settings.darkMode) {
      if (styleEl) styleEl.remove();
      return;
    }

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'light-mode-overrides';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = [
      '/* ======= LIGHT MODE OVERRIDES ======= */',

      // ██████ BACKGROUNDS ██████
      // Dark hex→light: target via [class*="#HEX"] to match bg-[#HEX]
      'html.light [class*="#0C1119"] { background-color: #f8fafc !important; }',
      'html.light [class*="#0F1A28"] { background-color: #f1f5f9 !important; }',
      'html.light [class*="#0F1724"] { background-color: #ffffff !important; }',
      'html.light [class*="#0F1E30"] { background-color: #f1f5f9 !important; }',
      'html.light [class*="#0F1D2F"] { background-color: #f8fafc !important; }',
      'html.light [class*="#0F2037"] { background-color: #f1f5f9 !important; }',
      'html.light [class*="#101E30"] { background-color: #f1f5f9 !important; }',
      'html.light [class*="#101C2A"] { background-color: #ffffff !important; }',
      'html.light [class*="#101C2C"] { background-color: #ffffff !important; }',
      'html.light [class*="#122336"] { background-color: #f1f5f9 !important; }',
      'html.light [class*="#141C28"] { background-color: #ffffff !important; }',
      'html.light [class*="#142336"] { background-color: #ffffff !important; }',
      'html.light [class*="#1E314A"] { background-color: #e2e8f0 !important; }',
      'html.light [class*="#1F314F"] { background-color: #e2e8f0 !important; }',
      'html.light [class*="#263F63"] { background-color: #e2e8f0 !important; }',
      'html.light [class*="#253D60"] { background-color: #e2e8f0 !important; }',
      'html.light [class*="#2A3E5A"] { background-color: #d1d5db !important; }',
      'html.light [class*="#1a2234"] { background-color: #ffffff !important; }',
      'html.light [class*="#3D4F5F"] { background-color: #e2e8f0 !important; }',

      // Status/action button backgrounds
      'html.light [class*="#1E5F4A"] { background-color: #f0fdf4 !important; }',
      'html.light [class*="#4A2E2E"] { background-color: #fef2f2 !important; }',
      'html.light [class*="#4A4024"] { background-color: #fffbeb !important; }',
      'html.light [class*="#1F4733"] { background-color: #f0fdf4 !important; }',

      // ██████ BORDERS ██████
      'html.light [class*="#273953"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#3E5D88"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#2A3E5A"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#46648B"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#25344A"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#2F4565"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#2E405B"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#375F8F"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#375A84"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#34537A"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#38618B"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#3866A0"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#2C4668"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#2D4567"] { border-color: #cbd5e1 !important; }',
      'html.light [class*="#4D73A5"] { border-color: #cbd5e1 !important; }',
      // Status badge borders
      'html.light [class*="#B45F5F"] { border-color: #fca5a5 !important; }',
      'html.light [class*="#C6993A"] { border-color: #fcd34d !important; }',
      'html.light [class*="#479A6E"] { border-color: #86efac !important; }',

      // ██████ TEXT COLORS ██████
      // Standard Tailwind text classes
      'html.light [class*="text-white"] { color: #1e293b !important; }',
      'html.light [class*="text-gray-300"] { color: #334155 !important; }',
      'html.light [class*="text-gray-400"] { color: #475569 !important; }',
      'html.light [class*="text-gray-500"] { color: #64748b !important; }',
      'html.light [class*="text-gray-600"] { color: #e2e8f0 !important; }',
      'html.light [class*="text-green-400"] { color: #16a34a !important; }',
      'html.light [class*="text-red-400"] { color: #dc2626 !important; }',

      // Custom accent text colors
      'html.light [class*="#B6D0F5"] { color: #2563eb !important; }',
      'html.light [class*="#F9B5B5"] { color: #dc2626 !important; }',
      'html.light [class*="#FCC5C5"] { color: #dc2626 !important; }',
      'html.light [class*="#FCDBA0"] { color: #d97706 !important; }',
      'html.light [class*="#FCE6B4"] { color: #d97706 !important; }',
      'html.light [class*="#F0CF8F"] { color: #d97706 !important; }',
      'html.light [class*="#BCF0D5"] { color: #16a34a !important; }',
      'html.light [class*="#B2D2F5"] { color: #2563eb !important; }',
      'html.light [class*="#E5A5A5"] { color: #dc2626 !important; }',

      // ██████ FALLBACKS ██████
      'html.light, html.light body { background-color: #f8fafc !important; color: #1e293b !important; }',
      'html.light input::placeholder { color: #94a3b8 !important; }',

      // Overlay backgrounds (keep visible but lighter)
      'html.light [class*="black/80"] { background-color: rgba(0,0,0,0.3) !important; }',
      'html.light [class*="black/70"] { background-color: rgba(0,0,0,0.25) !important; }',
    ].join('\n');
  }, [settings.darkMode]);

  return null;
}
