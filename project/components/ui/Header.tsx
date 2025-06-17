import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, MoreVertical } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { AppBar } from './AppBar';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
  showMenu?: boolean;
  leftIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onMenuPress?: () => void;
  elevated?: boolean;
  hideBottomBorder?: boolean;
}

export function Header({
  title,
  showBack = false,
  showNotification = false,
  showMenu = false,
  leftIcon,
  onLeftPress,
  onMenuPress,
  elevated = true,
  hideBottomBorder = false,
}: HeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    iconButton: {
      padding: 8,
      marginRight: 8,
      borderRadius: 8,
    },
    title: {
      fontSize: 20,
      textAlign: 'center',
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      flex: 1,
    },
  });

  return (
    <AppBar elevated={elevated} hideBottomBorder={hideBottomBorder}>
      {(showBack || leftIcon) && (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onLeftPress || router.back}
        >
          {leftIcon || <ArrowLeft size={24} color={colors.text} />}
        </TouchableOpacity>
      )}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {showNotification && (
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      {showMenu && (
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={onMenuPress}
        >
          <MoreVertical size={24} color={colors.text} />
        </TouchableOpacity>
      )}
    </AppBar>
  );
}