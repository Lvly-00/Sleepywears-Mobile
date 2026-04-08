import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function CollectionFormSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const SkeletonBox = ({ style }: { style?: any }) => (
    <Animated.View style={[{ backgroundColor: '#E1E1E1', borderRadius: 4 }, style, { opacity: pulseAnim }]} />
  );

  const InputGroupSkeleton = () => (
    <View style={styles.inputGroup}>
      <SkeletonBox style={styles.labelSkeleton} />
      <SkeletonBox style={styles.inputLine} />
    </View>
  );

  return (
    <View style={styles.container}>
      <InputGroupSkeleton />
      <InputGroupSkeleton />
      <InputGroupSkeleton />
      <InputGroupSkeleton />

      <SkeletonBox style={styles.buttonSkeleton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  inputGroup: {
    marginBottom: 25,
  },
  labelSkeleton: {
    width: 140,
    height: 16,
    marginBottom: 10,
  },
  inputLine: {
    width: '100%',
    height: 35,
    borderRadius: 0,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  buttonSkeleton: {
    width: '100%',
    height: 55,
    borderRadius: 8,
    marginTop: 10,
  },
});