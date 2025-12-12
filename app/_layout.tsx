import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { WalletProvider } from '@/contexts/WalletContext';
import { UserProvider } from '@/contexts/UserContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <WalletProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </UserProvider>
    </WalletProvider>
  );
}
