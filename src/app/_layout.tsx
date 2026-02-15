import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { useColorScheme } from '../hooks/use-color-scheme';



export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      <PaperProvider>
        <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen
              name="screens/index"
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="screens/forgot-password"
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="screens/reset-password"
              options={{ headerShown: false }}
            />


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

            <Stack.Screen name="screens/confirm-order" options={{
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

            <Stack.Screen name="screens/invoice" options={{
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

            <Stack.Screen name="screens/create-collection" options={{
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
            
             <Stack.Screen name="screens/edit-collection" options={{
              presentation: 'fullScreenModal',
              title: 'Edit Collection',
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

            <Stack.Screen name="screens/items" options={{
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

            <Stack.Screen name="screens/create-item" options={{
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
    </GestureHandlerRootView>

  );
}
