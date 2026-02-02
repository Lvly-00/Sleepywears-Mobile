import { router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

export default function InvoiceScreen() {

  // This handles the hardware back button (Android)
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Redirect to orders tab
        router.replace('/(tabs)/orders');
        return true; // Prevents the default back action
      };

      // Add listener when screen is focused
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Remove listener when screen is unfocused
      return () => subscription.remove();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invoice Generated</Text>
      
      {/* ... Your Invoice Content ... */}

      <Button 
        mode="contained" 
        onPress={() => router.replace('/(tabs)/orders')}
        style={styles.doneButton}
        labelStyle={{ fontFamily: 'LeagueSpartan-Bold' }}
      >
        Return to Orders
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F1F0ED', justifyContent: 'center' },
  title: { fontFamily: 'LeagueSpartan-Bold', fontSize: 24, textAlign: 'center', marginBottom: 20 },
  doneButton: { backgroundColor: '#0A0B32', marginTop: 20, borderRadius: 12 }
});