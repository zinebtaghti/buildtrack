import React from 'react';
import { View, StyleSheet, Platform, StatusBar, SafeAreaView, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface AppBarProps {
  children: React.ReactNode;
  translucent?: boolean;
  hideBottomBorder?: boolean;
  backgroundColor?: string;
  elevated?: boolean;
}

export function AppBar({ 
  children, 
  translucent = true,
  hideBottomBorder = false,
  backgroundColor,
  elevated = true
}: AppBarProps) {
  const { colors, isDarkMode } = useTheme();

  // Pre-calculate styles without useMemo for faster updates
  const containerStyle: ViewStyle = {
    backgroundColor: backgroundColor || colors.headerBackground,
    borderBottomWidth: hideBottomBorder ? 0 : StyleSheet.hairlineWidth,
    borderBottomColor: colors.headerBorder,
    ...(elevated && Platform.select({
      ios: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    })),
  };

  // Calculate status bar style - optimized for quick updates
  const barStyle = backgroundColor ? 
    calculateBarStyle(backgroundColor) : 
    isDarkMode ? 'light-content' : 'dark-content';

  const styles = StyleSheet.create({
    safeArea: {
      backgroundColor: backgroundColor || colors.headerBackground,
    },
    content: {
      paddingHorizontal: 16,
      minHeight: Platform.OS === 'ios' ? 44 : 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: Platform.OS === 'ios' ? 0 : 4,
      paddingBottom: Platform.OS === 'ios' ? 0 : 4,
    },
    statusBarPlaceholder: {
      height: Platform.OS === 'android' && translucent ? StatusBar.currentHeight : 0,
      backgroundColor: backgroundColor || colors.headerBackground,
    },
  });

  return (
    <>
      <StatusBar
        barStyle={barStyle}
        translucent={translucent}
        backgroundColor="transparent"
        animated={false}
      />
      <View style={styles.statusBarPlaceholder} />
      <SafeAreaView style={styles.safeArea}>
        <View style={containerStyle}>
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

// Moved outside component for better performance
function calculateBarStyle(backgroundColor: string) {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? 'dark-content' : 'light-content';
}
