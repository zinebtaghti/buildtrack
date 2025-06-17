import { StyleSheet } from 'react-native';
import { lightTheme, darkTheme } from '@/context/ThemeContext';

export const createThemedStyles = (isDarkMode: boolean) => {
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    surface: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      borderColor: theme.border,
      borderWidth: 1,
    },
    text: {
      color: theme.text,
      fontFamily: 'Inter-Regular',
    },
    textSecondary: {
      color: theme.textSecondary,
      fontFamily: 'Inter-Regular',
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    input: {
      backgroundColor: theme.inputBackground,
      color: theme.text,
      borderRadius: 8,
      padding: 12,
      borderColor: theme.border,
      borderWidth: 1,
    },
    button: {
      backgroundColor: theme.buttonPrimary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontFamily: 'Inter-Medium',
    },
    buttonSecondary: {
      backgroundColor: theme.buttonSecondary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonSecondaryText: {
      color: theme.primary,
      fontSize: 16,
      fontFamily: 'Inter-Medium',
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 16,
      borderColor: theme.border,
      borderWidth: 1,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  });
};
