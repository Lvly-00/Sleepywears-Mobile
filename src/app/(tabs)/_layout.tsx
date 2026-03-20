import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';

import { BottomNavigation } from 'react-native-paper';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0A0B32',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 800,
          fontSize: 40,
        },
        headerTitleAlign: 'left',
        headerRight: () => (
          <Image
            source={require('@/assets/images/Logo.png')}
            style={{
              width: 80,
              height: 80,
              marginRight: 15,
              resizeMode: 'contain'
            }}
          />
        ),
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          activeColor="#F1F0ED"

          inactiveColor="#ffffff"
          theme={{
            colors: {
              secondaryContainer: '#1C4D8D',
            }
          }}
          style={{
            backgroundColor: '#0A0B32'


          }}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({ focused, color, size: 24 });
            }
            return null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? (options.tabBarLabel as string)
                : options.title !== undefined
                  ? options.title
                  : route.name;

            return label;
          }}
        />
      )}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}