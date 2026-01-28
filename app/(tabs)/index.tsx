import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#dddddd', dark: '#bfc7c7' }}
      headerImage={
        <Image
          source={require('@/assets/images/pngegg.png')}
          style={styles.reactLogo}
        />
      }
    >
      {/* Dashboard Title */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Sleepywears Dashboard</ThemedText>
        <ThemedText type="subtitle">Overview</ThemedText>
      </ThemedView>

      {/* Stats */}
      <ThemedView style={styles.statsRow}>
        <DashboardCard title="Users" value="1,245" />
        <DashboardCard title="Sales" value="₱32,400" />
        <DashboardCard title="Errors" value="3" />
      </ThemedView>

      {/* Actions */}
      <ThemedView style={styles.actions}>
        <Link href="/modal" asChild>
          <Pressable style={styles.actionButton}>
            <ThemedText type="defaultSemiBold">Open Modal</ThemedText>
          </Pressable>
        </Link>

        <Link href="/explore" asChild>
          <Pressable style={styles.actionButtonSecondary}>
            <ThemedText type="defaultSemiBold">Explore</ThemedText>
          </Pressable>
        </Link>
      </ThemedView>
    </ParallaxScrollView>
  );
}

/* Dashboard Card Component */
function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText type="title">{value}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    opacity: 0.85,
  },
  reactLogo: {
    height: 178,
    width: 290,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});
