import api from '@/src/services/api';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Card, IconButton, Surface, Text } from 'react-native-paper';
import FabScreenWrapper from '../../components/ui/fab-screen-wrapper';

const { width } = Dimensions.get('window');

interface SummaryData {
  totalRevenue: number;
  grossIncome: number;
  netIncome: number;
  totalItemsSold: number;
  totalCustomers: number;
}

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData>({
    totalRevenue: 0,
    grossIncome: 0,
    netIncome: 0,
    totalItemsSold: 0,
    totalCustomers: 0,
  });

  const [chartDataSets, setChartDataSets] = useState<any[]>([]);
  const [collections, setCollections] = useState<string[]>([]);

  const COLORS = ["#944E1B", "#54361C", "#F0BB78", "#AB8262", "#232D80"];
  const monthName = new Date().toLocaleString("default", { month: "long" });

  const formatNumber = (num: number) =>
    !num || isNaN(num) ? "0" : Math.round(num).toLocaleString();

  const buildChartData = (data: any) => {
    const monthDays = new Date().getDate(); // Or 30/31 for full month
    const collectionNames = data.collectionSales.map((c: any) => c.collection_name);
    setCollections(collectionNames);

    // Transform Recharts object format into Gifted Charts array format
    const datasets = collectionNames.map((name: string, index: number) => {
      const lineData = [];
      for (let i = 1; i <= monthDays; i++) {
        const dayData = data.dailySales.find((d: any) => Number(d.date) === i);
        lineData.push({
          value: dayData && dayData[name] ? dayData[name] : 0,
          label: i % 5 === 0 ? `${i}` : '', // Show labels every 5 days for clarity
        });
      }
      return {
        data: lineData,
        color: COLORS[index % COLORS.length],
        thickness: 3,
        hideDataPoints: true,
      };
    });

    setChartDataSets(datasets);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard");
      const data = res.data;

      setSummary({
        totalRevenue: data.totalRevenue,
        grossIncome: data.grossIncome,
        netIncome: data.netIncome,
        totalItemsSold: data.totalItemsSold,
        totalCustomers: data.totalCustomers,
      });

      buildChartData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      <ScrollView contentContainerStyle={styles.container}>
        {/* 1. WELCOME HEADER */}
       

        {loading ? (
          <ActivityIndicator animating={true} color="#0A0B32" style={{ marginVertical: 40 }} />
        ) : (
          <>
            {/* 2. STATS GRID (2 columns) */}
            <View style={styles.statsGrid}>
              <Surface style={styles.statCard} elevation={1}>
                <IconButton icon="cash-multiple" iconColor="#AB8262" size={24} />
                <Text style={styles.statValue}>₱{formatNumber(summary.netIncome)}</Text>
                <Text style={styles.statLabel}>Net Income</Text>
              </Surface>

              <Surface style={styles.statCard} elevation={1}>
                <IconButton icon="trending-up" iconColor="#0A0B32" size={24} />
                <Text style={styles.statValue}>₱{formatNumber(summary.grossIncome)}</Text>
                <Text style={styles.statLabel}>Gross Income</Text>
              </Surface>

              <Surface style={styles.statCard} elevation={1}>
                <IconButton icon="tag-outline" iconColor="#0A0B32" size={24} />
                <Text style={styles.statValue}>{formatNumber(summary.totalItemsSold)}</Text>
                <Text style={styles.statLabel}>Items Sold</Text>
              </Surface>

              <Surface style={styles.statCard} elevation={1}>
                <IconButton icon="account-group-outline" iconColor="#AB8262" size={24} />
                <Text style={styles.statValue}>{formatNumber(summary.totalCustomers)}</Text>
                <Text style={styles.statLabel}>Customers</Text>
              </Surface>
            </View>

            {/* 3. CHART SECTION */}
            <View style={styles.activitySection}>
              <Text style={styles.sectionTitle}>Monthly Performance</Text>
              <Card style={styles.chartCard}>
                <Card.Content>
                  <View style={styles.chartWrapper}>
                    <LineChart
                      dataSet={chartDataSets}
                      height={200}
                      width={width - 100}
                      initialSpacing={10}
                      spacing={15}
                      yAxisThickness={0}
                      xAxisThickness={1}
                      xAxisColor="#C2C2C2"
                      yAxisTextStyle={styles.axisText}
                      xAxisLabelTextStyle={styles.axisText}
                      noOfSections={3}
                      formatYLabel={(label) => {
                        const val = parseInt(label);
                        return val >= 1000 ? `${val / 1000}k` : label;
                      }}
                    />
                  </View>
                  
                  {/* Legend */}
                  <View style={styles.legendContainer}>
                    {collections.map((name, i) => (
                      <View key={name} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: COLORS[i % COLORS.length] }]} />
                        <Text style={styles.legendText}>{name}</Text>
                      </View>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            </View>
          </>
        )}
      </ScrollView>
    </FabScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
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
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
  },
  chartWrapper: {
    paddingLeft: -20, // Adjust for Y-axis labels
    marginBottom: 20,
  },
  axisText: {
    fontFamily: 'LeagueSpartan',
    fontSize: 10,
    color: '#999',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  legendText: {
    fontFamily: 'LeagueSpartan',
    fontSize: 12,
    color: '#333',
  },
});