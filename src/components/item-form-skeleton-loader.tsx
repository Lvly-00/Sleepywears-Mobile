import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function ItemFormSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0.4,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Image Picker Skeleton */}
      <Animated.View style={[styles.imageSkeleton, { opacity: pulseAnim }]} />
      
      {/* Label Skeleton */}
      <Animated.View style={[styles.labelSkeleton, { opacity: pulseAnim }]} />
      {/* Input Skeleton */}
      <Animated.View style={[styles.inputSkeleton, { opacity: pulseAnim }]} />

      {/* Label Skeleton */}
      <Animated.View style={[styles.labelSkeleton, { opacity: pulseAnim, marginTop: 20 }]} />
      {/* Input Skeleton */}
      <Animated.View style={[styles.inputSkeleton, { opacity: pulseAnim }]} />

      {/* Button Skeleton */}
      <Animated.View style={[styles.buttonSkeleton, { opacity: pulseAnim }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  imageSkeleton: {
    width: '70%',
    aspectRatio: 0.8,
    alignSelf: 'center',
    backgroundColor: '#E1E1E1',
    borderRadius: 8,
    marginBottom: 40,
  },
  labelSkeleton: {
    width: 100,
    height: 16,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
    marginBottom: 10,
  },
  inputSkeleton: {
    width: '100%',
    height: 40,
    backgroundColor: '#F2F2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    marginBottom: 10,
  },
  buttonSkeleton: {
    width: '100%',
    height: 55,
    backgroundColor: '#E1E1E1',
    borderRadius: 8,
    marginTop: 20,
  },
});