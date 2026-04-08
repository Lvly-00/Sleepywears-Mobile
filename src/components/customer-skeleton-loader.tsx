import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface CustomerSkeletonProps {
  repeatSections?: number;
  itemsPerSection?: number;
}

const CustomerSkeleton = ({ repeatSections = 3, itemsPerSection = 4 }: CustomerSkeletonProps) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const SkeletonRow = () => (
    <View style={styles.item}>
      <Animated.View style={[styles.itemTextPlaceholder, { opacity: pulseAnim }]} />
    </View>
  );

  const SkeletonSection = () => (
    <View>
      <View style={styles.headerContainer}>
        <Animated.View style={[styles.sectionHeaderPlaceholder, { opacity: pulseAnim }]} />
        <View style={styles.headerLine} />
      </View>
      {Array.from({ length: itemsPerSection }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: repeatSections }).map((_, i) => (
        <SkeletonSection key={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  sectionHeaderPlaceholder: {
    width: 20,
    height: 14,
    backgroundColor: '#E1E9EE',
    marginBottom: 5,
    borderRadius: 3,
  },
  headerLine: {
    height: 1,
    backgroundColor: '#F0F0F0',
    width: '100%',
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 18, // Matching item padding + height
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
    justifyContent: 'center',
  },
  itemTextPlaceholder: {
    height: 16,
    width: '60%',
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
});

export default CustomerSkeleton;