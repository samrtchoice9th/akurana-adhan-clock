import { useState, useEffect, useCallback } from 'react';

export type ThemeColor = 'green' | 'blue' | 'dark';
export type DesignStyle = 'modern' | 'classic' | 'glass';

interface ThemePreferences {
  color: ThemeColor;
  style: DesignStyle;
}

const STORAGE_KEY = 'akurana-theme-prefs';

const defaultPrefs: ThemePreferences = { color: 'green', style: 'modern' };

function loadPrefs(): ThemePreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {}
  return defaultPrefs;
}

function applyTheme(prefs: ThemePreferences) {
  const root = document.documentElement;

  // Remove previous classes
  root.classList.remove('theme-green', 'theme-blue', 'theme-dark', 'style-modern', 'style-classic', 'style-glass');
  root.classList.add(`theme-${prefs.color}`, `style-${prefs.style}`);
}

export function useTheme() {
  const [prefs, setPrefs] = useState<ThemePreferences>(loadPrefs);

  useEffect(() => {
    applyTheme(prefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const setColor = useCallback((color: ThemeColor) => {
    setPrefs(p => ({ ...p, color }));
  }, []);

  const setStyle = useCallback((style: DesignStyle) => {
    setPrefs(p => ({ ...p, style }));
  }, []);

  return { ...prefs, setColor, setStyle };
}

// Initialize theme on app load (before React renders)
export function initTheme() {
  const prefs = loadPrefs();
  applyTheme(prefs);
}
