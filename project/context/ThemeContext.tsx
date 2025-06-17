import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { createStyleSheet } from '@/styles/styleSheet';

interface ThemeContextType {
  isDarkMode: boolean;
  isTransitioning: boolean;
  toggleTheme: () => Promise<void>;
  colors: typeof lightTheme;
  styles: ReturnType<typeof createStyleSheet>;
}

export const lightTheme = {
  primary: '#0B5394',
  primaryLight: '#E3F2FD',
  primaryDark: '#083B66',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F3F5',
  text: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textTertiary: '#6B7280',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  success: '#059669',
  successLight: '#D1FAE5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  divider: '#E5E7EB',
  buttonPrimary: '#0B5394',
  buttonSecondary: '#E3F2FD',
  inputBackground: '#F9FAFB',
  cardBackground: '#FFFFFF',
  shadowColor: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  statusActive: '#059669',
  statusCompleted: '#047857',
  statusDelayed: '#D97706',
  statusOnHold: '#6B7280',
  headerBackground: '#FFFFFF',
  headerBorder: '#E5E7EB',
  headerText: '#1A1A1A',
  headerIcon: '#4A4A4A',
};

export const darkTheme = {
  primary: '#60A5FA',
  primaryLight: '#1E3A5F',
  primaryDark: '#93C5FD',
  background: '#111827',
  surface: '#1F2937',
  surfaceVariant: '#374151',
  text: '#F9FAFB',
  textSecondary: '#E5E7EB',
  textTertiary: '#9CA3AF',
  border: '#374151',
  borderLight: '#4B5563',
  error: '#EF4444',
  errorLight: '#7F1D1D',
  success: '#10B981',
  successLight: '#064E3B',
  warning: '#F59E0B',
  warningLight: '#78350F',
  divider: '#374151',
  buttonPrimary: '#60A5FA',
  buttonSecondary: '#1E3A5F',
  inputBackground: '#374151',
  cardBackground: '#1F2937',
  shadowColor: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  statusActive: '#10B981',
  statusCompleted: '#059669',
  statusDelayed: '#F59E0B',
  statusOnHold: '#9CA3AF',
  headerBackground: '#1F2937',
  headerBorder: '#374151',
  headerText: '#F9FAFB',
  headerIcon: '#E5E7EB',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeCache = new Map();

function getCachedStyles(colors: typeof lightTheme, isDarkMode: boolean) {
  const cacheKey = `${isDarkMode ? 'dark' : 'light'}-${colors.primary}`;
  if (!themeCache.has(cacheKey)) {
    themeCache.set(cacheKey, createStyleSheet(colors, isDarkMode));
  }
  return themeCache.get(cacheKey);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useUserSettings();
  const [isDarkMode, setIsDarkMode] = useState(() => settings.darkModeEnabled);
  
  // Update local state immediately when settings change
  useEffect(() => {
    setIsDarkMode(settings.darkModeEnabled);
  }, [settings.darkModeEnabled]);

  const currentTheme = isDarkMode ? darkTheme : lightTheme;
  const cachedStyles = getCachedStyles(currentTheme, isDarkMode);

  const toggleTheme = useCallback(async () => {
    try {
      // Update local state immediately
      setIsDarkMode(!isDarkMode);
      // Update persistent storage in background
      await updateSettings({ darkModeEnabled: !isDarkMode });
    } catch (error) {
      // Revert on error
      setIsDarkMode(isDarkMode);
      console.error('Failed to toggle theme:', error);
    }
  }, [isDarkMode, updateSettings]);
  const value = useMemo(() => ({
    isDarkMode,
    isTransitioning: false, // Remove transition state for instant updates
    toggleTheme,
    colors: currentTheme,
    styles: cachedStyles,
  }), [isDarkMode, toggleTheme, currentTheme, cachedStyles]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
