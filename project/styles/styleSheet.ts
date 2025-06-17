import { StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';

type BaseStyles = {
  container: ViewStyle;
  card: ViewStyle;
  row: ViewStyle;
  divider: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  text: TextStyle;
  textSecondary: TextStyle;
  textTertiary: TextStyle;
  input: ViewStyle & TextStyle;
  inputFocused: ViewStyle;
  inputError: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  buttonSecondary: ViewStyle;
  buttonSecondaryText: TextStyle;
  buttonDisabled: ViewStyle;
  statusBadge: ViewStyle;
  statusActive: ViewStyle;
  statusCompleted: ViewStyle;
  statusDelayed: ViewStyle;
  statusOnHold: ViewStyle;
  statusText: TextStyle;
  statusTextActive: TextStyle;
  statusTextCompleted: TextStyle;
  statusTextDelayed: TextStyle;
  statusTextOnHold: TextStyle;
  progressBar: ViewStyle;
  progressFill: ViewStyle;
  progressActive: ViewStyle;
  progressCompleted: ViewStyle;
  progressDelayed: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  headerIcon: TextStyle;
};

export const createStyleSheet = (colors: any, isDarkMode: boolean) => {
  const baseStyles: BaseStyles = {
    // Layout styles
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: 8,
    },

    // Header styles
    header: {
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.headerBorder,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: colors.headerText,
      flex: 1,
      textAlign: 'center',
    },
    headerIcon: {
      color: colors.headerIcon,
    },

    // Text styles
    title: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    text: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.text,
      lineHeight: 20,
    },
    textSecondary: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      lineHeight: 20,
    },
    textTertiary: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textTertiary,
      lineHeight: 20,
    },

    // Input styles
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 48,
    },
    inputFocused: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    inputError: {
      borderColor: colors.error,
      borderWidth: 2,
    },

    // Button styles
    button: {
      backgroundColor: colors.buttonPrimary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    buttonText: {
      color: colors.surface,
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    buttonSecondary: {
      backgroundColor: colors.buttonSecondary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      minHeight: 48,
    },
    buttonSecondaryText: {
      color: colors.primary,
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    buttonDisabled: {
      opacity: 0.5,
    },

    // Status styles
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignSelf: 'flex-start',
    },
    statusActive: {
      backgroundColor: colors.successLight,
    },
    statusCompleted: {
      backgroundColor: colors.successLight,
    },
    statusDelayed: {
      backgroundColor: colors.warningLight,
    },
    statusOnHold: {
      backgroundColor: colors.surfaceVariant,
    },
    statusText: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
    },
    statusTextActive: {
      color: colors.statusActive,
    },
    statusTextCompleted: {
      color: colors.statusCompleted,
    },
    statusTextDelayed: {
      color: colors.statusDelayed,
    },
    statusTextOnHold: {
      color: colors.statusOnHold,
    },

    // Progress styles
    progressBar: {
      height: 8,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 4,
      marginBottom: 8,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressActive: {
      backgroundColor: colors.primary,
    },
    progressCompleted: {
      backgroundColor: colors.success,
    },
    progressDelayed: {
      backgroundColor: colors.warning,
    },
  };

  return StyleSheet.create(baseStyles);
};
