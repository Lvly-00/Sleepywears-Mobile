import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
// CHANGED: Use the modern SafeAreaView
import { AnimatedFAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FabScreenWrapperProps {
  children: React.ReactNode;
  fabIcon?: string;
  fabLabel: string;
  onFabPress: () => void;
  visible?: boolean;
  style?: ViewStyle;
  fabBackgroundColor?: string; 
  fabTextColor?: string;
  // Optional: Allow the screen to tell the FAB to extend/collapse
  isExtended?: boolean; 
}

const FabScreenWrapper = ({
  children,
  fabIcon = 'plus',
  fabLabel,
  onFabPress,
  visible = true,
  style,
  fabBackgroundColor = '#0A256C',
  fabTextColor = '#FFFFFF',
  isExtended = true, // Default to true
}: FabScreenWrapperProps) => {

  return (
    <SafeAreaView style={[styles.container, style]} edges={['right', 'left']}>
      {/* 
        REMOVED <ScrollView>: 
        This was causing the "VirtualizedLists" error. 
        Scrolling is now handled by the children (e.g., the FlatList in InventoryScreen).
      */}
      <View style={styles.content}>
        {children}
      </View>

      <AnimatedFAB
        icon={fabIcon}
        label={fabLabel}
        extended={isExtended} 
        onPress={onFabPress}
        visible={visible}
        animateFrom={'right'}
        iconMode={'dynamic'}
        color={fabTextColor} 
        style={[
          styles.fabStyle, 
          { backgroundColor: fabBackgroundColor } 
        ]}
        // labelStyle={{ 
        //   fontFamily: 'LeagueSpartan-Bold', 
        //   marginLeft: 8,
        //   color: fabTextColor 
        // }} 
      />
    </SafeAreaView>
  );
};

export default FabScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Ensures consistent background
  },
  content: {
    flex: 1,
  },
  fabStyle: {
    bottom: 16,
    right: 16,
    position: 'absolute',
  },
});