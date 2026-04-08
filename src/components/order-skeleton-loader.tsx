import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

interface OrderSkeletonProps {
  repeat?: number;
}

const OrderSkeleton = ({ repeat = 8 }: OrderSkeletonProps) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const sharedAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
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

    sharedAnimation.start();

    return () => sharedAnimation.stop();
  }, [pulseAnim]);

  const SkeletonItem = () => (
    <View style={styles.itemContainer}>
      {/* Left Circle Placeholder */}
      <Animated.View style={[styles.circle, { opacity: pulseAnim }]} />

      {/* Middle Content Placeholders */}
      <View style={styles.textContainer}>
        <Animated.View style={[styles.line, { width: '70%', opacity: pulseAnim }]} />
        <Animated.View style={[styles.line, { width: '40%', height: 10, marginTop: 8, opacity: pulseAnim }]} />
      </View>

      {/* Right Badge Placeholder */}
      <Animated.View style={[styles.badge, { opacity: pulseAnim }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: repeat }).map((_, index) => (
        <View key={index}>
          <SkeletonItem />
          {index < repeat - 1 && <View style={styles.separator} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E1E9EE',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  line: {
    height: 14,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
  badge: {
    width: 65,
    height: 25,
    borderRadius: 12,
    backgroundColor: '#E1E9EE',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
});

export default OrderSkeleton;