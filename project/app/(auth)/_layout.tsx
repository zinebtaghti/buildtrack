import { Stack } from 'expo-router/stack';
import { View, StyleSheet } from 'react-native';
import { Logo } from '@/components/ui/Logo';

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo size={120} />
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
});