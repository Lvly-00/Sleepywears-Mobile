import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <PaperProvider>

      <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen name="create-order" options={{
            presentation: 'card', title: 'Create Order',
            headerStyle: {
              backgroundColor: '#0A0B32',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 800,
              fontSize: 30,
            },
            headerTitleAlign: 'left',
          }} />

          <Stack.Screen name="confirm-order" options={{
            presentation: 'card', title: 'Confirm Order',
            headerStyle: {
              backgroundColor: '#0A0B32',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 800,
              fontSize: 30,
            },
            headerTitleAlign: 'left',
          }} />

          <Stack.Screen name="invoice" options={{
            presentation: 'fullScreenModal',
            title: 'Invoice',
            headerLeft: () => null,
            headerBackVisible: false,
            headerStyle: {
              backgroundColor: '#0A0B32',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 800,
              fontSize: 30,
            },
            headerTitleAlign: 'left',

          }} />

          <Stack.Screen name="create-collection" options={{
            presentation: 'fullScreenModal',
            title: 'New Collection',
            headerStyle: {
              backgroundColor: '#0A0B32',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 800,
              fontSize: 30,
            },
            headerTitleAlign: 'left',

          }} />

          <Stack.Screen name="items" options={{
            presentation: 'fullScreenModal',
            title: 'Items',
            headerStyle: {
              backgroundColor: '#0A0B32',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 800,
              fontSize: 30,
            },
            headerTitleAlign: 'left',

          }} />

          <Stack.Screen name="create-item" options={{
            presentation: 'fullScreenModal',
            title: 'New Item',
            headerStyle: {
              backgroundColor: '#0A0B32',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 800,
              fontSize: 30,
            },
            headerTitleAlign: 'left',

          }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>

  );
}
