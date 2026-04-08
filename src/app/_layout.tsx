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
              name="index"
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="screens/forgot-password"
              options={{ headerShown: false }}
            />


            <Stack.Screen
              name="screens/verify-otp"
              options={{ headerShown: false }}
            />


            <Stack.Screen
              name="screens/reset-password"
              options={{ headerShown: false }}
            />


            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen name="screens/create-order" options={{
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

            <Stack.Screen
              name="screens/invoice"
              options={{
                presentation: 'fullScreenModal',
                title: 'Invoice',
                // headerLeft: () => null, <--- REMOVE OR COMMENT THIS LINE
                headerBackVisible: false,
                headerStyle: {
                  backgroundColor: '#0A0B32',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: '800',
                  fontSize: 24, // Sized down slightly to fit buttons
                },
                headerTitleAlign: 'center', // 'center' usually looks better with icons on both sides
              }}
            />

            <Stack.Screen name="screens/create-collection" options={{
              presentation: 'fullScreenModal',
              title: 'Add Collection',
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
              // title: 'Items',
              headerStyle: {
                backgroundColor: '#0A0B32',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: '800',
                fontSize: 30,
              },
              headerTitleAlign: 'left',

            }} />

            <Stack.Screen name="screens/create-item" options={{
              presentation: 'fullScreenModal',
              title: 'Add Item',
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

            <Stack.Screen name="screens/edit-item" options={{
              presentation: 'fullScreenModal',
              title: 'Edit Item',
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


            <Stack.Screen name="screens/customer-details" options={{
              presentation: 'fullScreenModal',
              title: 'View Customer',
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

            
            <Stack.Screen name="screens/edit-customer" options={{
              presentation: 'fullScreenModal',
              title: 'Edit Customer',
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

            <Stack.Screen name="screens/profile-information" options={{
              presentation: 'fullScreenModal',
              title: 'Profile Information',
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

            <Stack.Screen name="screens/update-password" options={{
              presentation: 'fullScreenModal',
              title: 'Update Password',
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

            <Stack.Screen name="screens/notification-center" options={{
              presentation: 'fullScreenModal',
              title: 'Notification Center',
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

            <Stack.Screen name="screens/view-all-customers" options={{
              presentation: 'fullScreenModal',
              title: 'View All Customers',
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

            <Stack.Screen name="screens/verify-otp-account" options={{
              presentation: 'fullScreenModal',
              title: 'Biometric Authentication',
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
