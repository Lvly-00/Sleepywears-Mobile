import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ViewStyle
} from 'react-native';
import { AnimatedFAB } from 'react-native-paper';

interface FabScreenWrapperProps {
  children: React.ReactNode;
  fabIcon?: string;
  fabLabel: string;
  onFabPress: () => void;
  visible?: boolean;
  style?: ViewStyle;
  // Added color props
  fabBackgroundColor?: string; 
  fabTextColor?: string;
}

const FabScreenWrapper = ({
  children,
  fabIcon = 'plus',
  fabLabel,
  onFabPress,
  visible = true,
  style,
  fabBackgroundColor = '#0A0B32', // Default to your dark blue
  fabTextColor = '#FFFFFF',       // Default to white
}: FabScreenWrapperProps) => { // Added type to props
  const [isExtended, setIsExtended] = useState(true);

  const onScroll = ({ nativeEvent }: any) => {
    const currentScrollPosition = Math.floor(nativeEvent?.contentOffset?.y) ?? 0;
    setIsExtended(currentScrollPosition <= 0);
  };

  return (
    <SafeAreaView style={[styles.container, style]}>
      <ScrollView 
        onScroll={onScroll} 
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {children}
      </ScrollView>

      <AnimatedFAB
        icon={fabIcon}
        label={fabLabel}
        extended={isExtended}
        onPress={onFabPress}
        visible={visible}
        animateFrom={'right'}
        iconMode={'dynamic'}
        
        // 1. Color of the Icon and Text
        color={fabTextColor} 
        
        // 2. Background Color of the Button
        style={[
          styles.fabStyle, 
          { backgroundColor: fabBackgroundColor ,
            
          } 
        ]}
        
        labelStyle={{ 
          fontFamily: 'LeagueSpartan-Bold', 
          marginLeft: 8,
          color: fabTextColor // Ensures label matches icon color
        }} 
      />
    </SafeAreaView>
  );
};

export default FabScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  fabStyle: {
    bottom: 16,
    right: 16,
    position: 'absolute',
  },
});