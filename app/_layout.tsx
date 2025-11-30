import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { config } from '@/tamagui.config';
import { useEffect } from 'react';
import { PortalProvider, TamaguiProvider, Theme } from 'tamagui';

function RootLayoutContent() {

  const { isLoadingAuth, isAuthenticated } = useAuth(); // Get auth state from context

  useEffect(() => {
    // Hide the splash screen once the initial authentication state is determined
    if (!isLoadingAuth) {
      SplashScreen.hideAsync();
    }
  }, [isLoadingAuth]); // Dependency: isLoadingAuth changes when auth check is done

  if (isLoadingAuth) {
    // While checking auth status, keep the splash screen visible
    return null;
  }
  
  return (
    <Stack>
      {isAuthenticated ? (
        // Authenticated routes (e.g., home, dashboard)
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        // Unauthenticated routes (e.g., login, signup)
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <TamaguiProvider config={config}>
          <PortalProvider>
            <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
              <RootLayoutContent />
              <StatusBar style="auto" />
            </Theme>
          </PortalProvider>
        </TamaguiProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
