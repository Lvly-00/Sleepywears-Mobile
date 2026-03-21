import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Switch, Text } from 'react-native-paper';

export default function AccountScreen() {
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);

  const handleLogout = () => {
    console.log('User logged out');
    router.replace('/screens');
  };

  // Reusable Component for the Menu Items
  const MenuItem = ({ title, onPress, defaultColor = '#1A1C3D', activeColor = '#3134d4', rightElement }: any) => {
    return (
      <Pressable
        onPress={onPress}
        disabled={!onPress && !rightElement}
        style={({ pressed }) => [
          styles.menuItem,
          pressed && { backgroundColor: '#F0F0F0' } // Slight background darken on press
        ]}
      >
        {({ pressed }) => (
          <>
            <Text
              style={[
                styles.menuText,
                { color: pressed ? activeColor : defaultColor } // Text changes color on press
              ]}
            >
              {title}
            </Text>
            {rightElement && <View>{rightElement}</View>}
          </>
        )}
      </Pressable>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* MENU SECTION */}
      <View style={styles.menuSection}>
        <MenuItem
          title="Profile Information"
          defaultColor="#0A0B32"
          onPress={() => router.push('/screens/profile-information')}
        />

        <MenuItem
          title="Update Password"
          defaultColor="#0A0B32"
          onPress={() => router.push('/screens/update-password')}
        />

        <MenuItem
          title="Notification Center"
          defaultColor="#0A0B32"
          onPress={() => router.push('/screens/notification-center')}
        />

        {/* BIOMETRICS TOGGLE */}
        <MenuItem
          title="Biometrics"
          rightElement={
            <Switch
              value={isBiometricsEnabled}
              onValueChange={() => setIsBiometricsEnabled(!isBiometricsEnabled)}
              color="#3134d4"
            />
          }
        />

        <View style={styles.dividerContainer}>
          <Divider style={styles.divider} />
        </View>

        <MenuItem
          title="Logout"
          defaultColor="#FF3B30"
          activeColor="#B02A22"
          onPress={handleLogout}
        />
      </View>

      <Text style={styles.versionText}>Version 1.0.2 (Build 24)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  menuItem: {
    backgroundColor: '#F7F6F6',
    height: 60,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuText: {
    fontFamily: 'LeagueSpartan-Medium',
    fontSize: 17,
  },
  dividerContainer: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  divider: {
    height: 1.5,
    width: '100%',
    backgroundColor: '#EEEEEE',
  },
  versionText: {
    textAlign: 'center',
    fontFamily: 'LeagueSpartan',
    fontSize: 13,
    color: '#C7C7CC',
    marginTop: 30,
  },
});