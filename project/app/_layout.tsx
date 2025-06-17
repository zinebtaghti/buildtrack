import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuthContext } from '@/context/AuthContext';
import { ProjectProvider } from '@/context/ProjectContext';
import { TeamProvider } from '@/context/TeamContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Auth guard component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      // Keep splash screen visible while loading
      SplashScreen.preventAutoHideAsync();
      return;
    }

    const hideSplashAndNavigate = async () => {
      try {
        await SplashScreen.hideAsync();
        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
          // Redirect to login if not authenticated
          router.replace('/login');
        } else if (user && inAuthGroup) {
          // Redirect to home if authenticated
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    };

    hideSplashAndNavigate();
  }, [user, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium, 
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <AuthGuard>
        <ProjectProvider>
          <TeamProvider>
            <ThemeProvider>
              <RootLayoutWithTheme>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </RootLayoutWithTheme>
            </ThemeProvider>
          </TeamProvider>
        </ProjectProvider>
      </AuthGuard>
    </AuthProvider>
  );
}

function RootLayoutWithTheme({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useTheme();
  
  return (
    <>
      {children}
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </>
  );
}