import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { Surface } from 'react-native-paper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SkeletonItem = ({ style }: { style?: any }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ backgroundColor: '#E1E9EE', borderRadius: 4 }, style, { opacity }]}
    />
  );
};

export const DashboardSkeleton = () => {
  return (
    <ScrollView style={styles.container} scrollEnabled={false}>
      {/* 1. TOP PERFORMANCE PILL SKELETON */}
      <Surface style={styles.piContainer} elevation={1}>
        {[1, 2, 3].map((_, i) => (
          <View key={i} style={styles.piItem}>
            <SkeletonItem style={styles.piIcon} />
            <View>
              <SkeletonItem style={styles.piTextSmall} />
              <SkeletonItem style={styles.piTextLarge} />
            </View>
            {i < 2 && <View style={styles.divider} />}
          </View>
        ))}
      </Surface>

      {/* 2. CRITICAL RISKS SKELETON */}
      <View style={styles.riskCard}>
        <View style={styles.riskHeader}>
          <SkeletonItem style={{ width: 120, height: 24 }} />
          <SkeletonItem style={{ width: 100, height: 30, borderRadius: 12 }} />
        </View>
        <View style={styles.riskGrid}>
          {[1, 2, 3].map((_, i) => (
            <View key={i} style={{ alignItems: 'center', flex: 1 }}>
              <SkeletonItem style={styles.riskCircle} />
              <SkeletonItem style={{ width: '60%', height: 14, marginTop: 8 }} />
            </View>
          ))}
        </View>
      </View>

      {/* 3. SUMMARY SECTION SKELETON */}
      <View style={styles.summarySection}>
        <SkeletonItem style={{ width: 150, height: 30, marginBottom: 20 }} />
        <View style={styles.statsGrid}>
          {[1, 2, 3, 4].map((_, i) => (
            <View key={i} style={styles.statCard}>
              <SkeletonItem style={{ width: '70%', height: 15, marginBottom: 10 }} />
              <SkeletonItem style={{ width: 40, height: 40, borderRadius: 20, marginBottom: 10 }} />
              <SkeletonItem style={{ width: '80%', height: 20 }} />
            </View>
          ))}
        </View>
      </View>

      {/* 4. CHART SECTION SKELETON */}
      <Surface style={styles.chartSurface} elevation={1}>
        <SkeletonItem style={{ width: '60%', height: 25, alignSelf: 'center', marginBottom: 30 }} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 150 }}>
          <SkeletonItem style={{ width: 20, height: '100%', marginRight: 10 }} />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <SkeletonItem key={i} style={{ width: 30, height: `${Math.random() * 80 + 20}%` }} />
            ))}
          </View>
        </View>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  piContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 15,
    marginBottom: 15,
    justifyContent: 'space-around',
  },
  piItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  piIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  piTextSmall: { width: 40, height: 10, marginBottom: 4 },
  piTextLarge: { width: 50, height: 12 },
  divider: { width: 1, height: '70%', backgroundColor: '#EEE', marginLeft: 15 },

  riskCard: {
    backgroundColor: '#F2E8E5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  riskGrid: { flexDirection: 'row' },
  riskCircle: { width: 40, height: 40, borderRadius: 10 },

  summarySection: {
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFF',
    width: '48%',
    aspectRatio: 1.1,
    borderRadius: 24,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chartSurface: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 20,
    height: 280,
  },
});