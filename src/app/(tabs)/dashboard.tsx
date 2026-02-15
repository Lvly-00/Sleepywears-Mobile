import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, IconButton, Surface, Text } from 'react-native-paper';
import FabScreenWrapper from '../../components/ui/fab-screen-wrapper';

export default function DashboardScreen() {
  
  const handleQuickAction = () => {
    router.push('/screens/create-order');
  };

  return (
    <FabScreenWrapper
      fabLabel="Quick Order"
      fabIcon="cart-plus"
      onFabPress={handleQuickAction}
      fabBackgroundColor="#0A0B32"
      style={{ backgroundColor: '#F1F0ED' }}
    >
      <View style={styles.container}>
        {/* 1. WELCOME HEADER */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, Miku!</Text>
          <Text style={styles.subGreeting}>Here is what's happening today.</Text>
        </View>

        {/* 2. STATS GRID (2 columns) */}
        <View style={styles.statsGrid}>
          <Surface style={styles.statCard} elevation={1}>
            <IconButton icon="chart-line" iconColor="#AB8262" size={24} />
            <Text style={styles.statValue}>₱12,450</Text>
            <Text style={styles.statLabel}>Daily Sales</Text>
          </Surface>

          <Surface style={styles.statCard} elevation={1}>
            <IconButton icon="clipboard-list-outline" iconColor="#0A0B32" size={24} />
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>New Orders</Text>
          </Surface>

          <Surface style={styles.statCard} elevation={1}>
            <IconButton icon="account-group-outline" iconColor="#0A0B32" size={24} />
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Customers</Text>
          </Surface>

          <Surface style={styles.statCard} elevation={1}>
            <IconButton icon="package-variant-closed" iconColor="#AB8262" size={24} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </Surface>
        </View>

        {/* 3. RECENT ACTIVITY SECTION */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <Card style={styles.activityCard}>
            <Card.Content style={styles.activityRow}>
              <Avatar.Icon size={40} icon="cart-check" style={{ backgroundColor: '#F1F0ED' }} color="#2e7d32" />
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityTitle}>Order #1024 Placed</Text>
                <Text style={styles.activityTime}>2 minutes ago</Text>
              </View>
              <Text style={styles.activityAmount}>+₱1,200</Text>
            </Card.Content>
          </Card>

          <Card style={styles.activityCard}>
            <Card.Content style={styles.activityRow}>
              <Avatar.Icon size={40} icon="account-plus" style={{ backgroundColor: '#F1F0ED' }} color="#0A0B32" />
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityTitle}>New Customer Registered</Text>
                <Text style={styles.activityTime}>1 hour ago</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.activityCard}>
            <Card.Content style={styles.activityRow}>
              <Avatar.Icon size={40} icon="alert-circle-outline" style={{ backgroundColor: '#F1F0ED' }} color="#9E2626" />
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityTitle}>Pajama Set - Low Stock</Text>
                <Text style={styles.activityTime}>3 hours ago</Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      </View>
    </FabScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  greeting: {
    fontFamily: 'LeagueSpartan-Bold',
    fontSize: 32,
    color: '#0A0B32',
  },
  subGreeting: {
    fontFamily: 'LeagueSpartan',
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  statValue: {
    fontFamily: 'LeagueSpartan-Bold',
    fontSize: 22,
    color: '#0A0B32',
    marginTop: 5,
  },
  statLabel: {
    fontFamily: 'LeagueSpartan',
    fontSize: 14,
    color: '#AB8262',
  },
  activitySection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: 'LeagueSpartan-Bold',
    fontSize: 20,
    color: '#0A0B32',
    marginBottom: 15,
  },
  activityCard: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 15,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  activityTitle: {
    fontFamily: 'LeagueSpartan-Bold',
    fontSize: 16,
    color: '#333',
  },
  activityTime: {
    fontFamily: 'LeagueSpartan',
    fontSize: 12,
    color: '#999',
  },
  activityAmount: {
    fontFamily: 'LeagueSpartan-Bold',
    fontSize: 16,
    color: '#2e7d32',
  },
});