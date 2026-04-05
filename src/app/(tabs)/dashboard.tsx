import api from '@/src/services/api';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Divider, IconButton, Modal, Portal, Surface, Text } from 'react-native-paper';

const { width } = Dimensions.get('window');

// 1. Asset Mapping
const ICONS = {
  netIncome: require('@/assets/images/net-income.png'),
  grossIncome: require('@/assets/images/gross-income.png'),
  totalItemsSold: require('@/assets/images/items-sold.png'),
  activeCustomers: require('@/assets/images/active-customers.png'),
};

const COLORS = {
  primary: '#0A0B32',      // Navy Blue for Main Title
  background: '#F8F9FA',   // Screen Background
  summaryBg: '#F1F1F1',    // Light Grey Container for Summary
  cardBg: '#FFFFFF',       // White Card Background
  accentBrown: '#944E1B',  // Icon Tint
  valueBrown: '#5D4324',   // Dark Brown for Numbers
  suffixGrey: '#7A6F58',   // Brownish-Grey for Pieces/Total
  textBlack: '#000000',
  green: '#4CAF50',
  chartLines: ["#944E1B", "#54361C", "#F0BB78", "#AB8262", "#232D80"]
};

interface SummaryData {
  grossIncome: number;
  netIncome: number;
  totalItemsSold: number;
  totalCustomers: number;
  avgOrderValue: number;
  goalReached: number;
  stockHealth: string;
}

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [summary, setSummary] = useState<SummaryData>({
    grossIncome: 0,
    netIncome: 0,
    totalItemsSold: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    goalReached: 0,
    stockHealth: 'Loading...',
  });

  const [chartDataSets, setChartDataSets] = useState<any[]>([]);
  const [chartMaxValue, setChartMaxValue] = useState(1000);
  const [legendItems, setLegendItems] = useState<{ name: string; color: string }[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
  const formatCurrency = (num: number) => `₱${Math.round(num || 0).toLocaleString()}`;

  const fetchDashboardData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await api.get('/dashboard');
      const data = res.data;

      setSummary({
        grossIncome: data.grossIncome,
        netIncome: data.netIncome,
        totalItemsSold: data.totalItemsSold,
        totalCustomers: data.totalCustomers,
        avgOrderValue: data.avgOrderValue,
        goalReached: data.goalReached,
        stockHealth: data.stockHealth,
      });

      setAllOrders(data.detailedOrders || []);

      if (data.dailySales && data.collectionSales) {
        let globalMax = 0;
        const legend: { name: string; color: string }[] = [];

        const datasets = data.collectionSales.map((item: any, index: number) => {
          const collectionName = item.collection_name || item;
          const color = COLORS.chartLines[index % COLORS.chartLines.length];
          legend.push({ name: collectionName, color: color });

          const lineData = data.dailySales.map((d: any) => {
            const val = Number(d[collectionName]) || 0;
            if (val > globalMax) globalMax = val;
            return {
              value: val,
              label: d.date % 5 === 0 ? `${d.date}` : '',
              dataDay: d.date,
            };
          });

          return {
            data: lineData,
            color: color,
            thickness: 3,
            hideDataPoints: false,
            dataPointsRadius: 4,
            curved: true,
          };
        });

        setChartMaxValue(globalMax > 0 ? globalMax * 1.2 : 1000);
        setLegendItems(legend);
        setChartDataSets(datasets);
        setLastUpdate(Date.now());
      }
    } catch (err) {
      console.error('Dashboard Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData(true);
    }, [fetchDashboardData])
  );

  useEffect(() => {
    const interval = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleTap = (day: number) => {
    const orders = allOrders.filter((o) => Number(o.day) === Number(day));
    setSelectedDay(day);
    setSelectedOrders(orders);
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: COLORS.background }}
        contentContainerStyle={styles.container}
      >
        {/* SUMMARY SECTION CONTAINER */}
        <View style={styles.summaryContainer}>
          <Text style={styles.mainTitle}>Summary</Text>

          {loading ? (
            <ActivityIndicator animating={true} color={COLORS.primary} style={{ marginVertical: 60 }} />
          ) : (
            <View style={styles.statsGrid}>
              <StatCard
                title="Net Income"
                value={formatCurrency(summary.netIncome)}
                icon={ICONS.netIncome}
              />
              <StatCard
                title="Gross Income"
                value={formatCurrency(summary.grossIncome)}
                icon={ICONS.grossIncome}
              />
              <StatCard
                title="Total Items Sold"
                value={summary.totalItemsSold.toLocaleString()}
                suffix="pieces"
                icon={ICONS.totalItemsSold}
              />
              <StatCard
                title="Active Customers"
                value={summary.totalCustomers.toLocaleString()}
                suffix="total"
                icon={ICONS.activeCustomers}
              />
            </View>
          )}
        </View>

        {/* METRICS ROW */}
        {!loading && (
          <>
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Monthly Goal</Text>
                <Text style={styles.metricValue}>{summary.goalReached}% Reached</Text>
              </View>
              <View style={[styles.metricItem, styles.metricHighlight]}>
                <Text style={styles.metricLabel}>Avg. Order Value</Text>
                <Text style={styles.metricValue}>{formatCurrency(summary.avgOrderValue)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Stock Health</Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: summary.stockHealth === 'All Good' ? COLORS.green : '#D32F2F' },
                  ]}
                >
                  {summary.stockHealth}
                </Text>
              </View>
            </View>

            {/* CHART SECTION */}
            <View style={styles.mainChartContainer}>

              <Surface style={styles.chartContainer} elevation={0}>
                <Text style={styles.chartTitle}>{currentMonthName} Collection Sales</Text>
                <View style={styles.chartWrapper}>
                  {chartDataSets.length > 0 ? (
                    <LineChart
                      key={`chart-${lastUpdate}`}
                      dataSet={chartDataSets}
                      height={200}
                      width={width - 110}
                      maxValue={chartMaxValue}
                      noOfSections={4}
                      initialSpacing={15}
                      spacing={12}
                      yAxisThickness={0}
                      xAxisThickness={1}
                      xAxisColor="#E0E0E0"
                      yAxisTextStyle={styles.axisText}
                      xAxisLabelTextStyle={styles.axisText}
                      isAnimated
                      focusEnabled
                      pointerConfig={{
                        pointerStripColor: 'rgba(0,0,0,0.1)',
                        pointerStripWidth: 2,
                        pointerColor: COLORS.primary,
                        radius: 4,
                        onPress: (items: any) => {
                          if (items[0]?.dataDay) handleTap(items[0].dataDay);
                        },
                      }}
                      formatYLabel={(label) => {
                        const val = Number(label);
                        if (val >= 1000) return `₱${(val / 1000).toFixed(1)}k`;
                        return `₱${val}`;
                      }}
                    />
                  ) : (
                    <View style={styles.noDataBox}>
                      <Text style={styles.noDataText}>No sales data found for this month</Text>
                    </View>
                  )}
                </View>

                <View style={styles.legendContainer}>
                  {legendItems.map((item, idx) => (
                    <View key={idx} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.name}</Text>
                    </View>
                  ))}
                </View>
              </Surface>
            </View>
          </>
        )}
      </ScrollView>


      {/* MODAL SECTION */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Orders: Day {selectedDay}</Text>
          <Divider style={{ marginVertical: 10 }} />
          <FlatList
            data={selectedOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.orderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderMainText}>
                    {item.order_number} • {item.customer}
                  </Text>
                  <Text style={styles.orderSubText}>{item.collections.join(', ')}</Text>
                </View>
                <Text style={styles.orderAmountText}>{formatCurrency(item.total)}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.noOrdersText}>No orders on this day.</Text>}
          />
          <IconButton icon="close" style={{ alignSelf: 'center' }} onPress={() => setModalVisible(false)} />
        </Modal>
      </Portal>
    </View>
  );
}

// 2. StatCard Component following the Reference Image Hierarchy
const StatCard = ({ title, value, suffix, icon }: any) => (
  <View style={styles.statCard}>
    <Text style={styles.statTitle}>{title}</Text>

    <View style={styles.iconContainer}>
      <Image source={icon} style={styles.imageIcon} resizeMode="contain" />
    </View>

    <View style={styles.valueContainer}>
      <Text style={styles.statValue}>{value}</Text>
      {suffix && <Text style={styles.statSuffix}>{suffix}</Text>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  // Gray container for the summary grid
  summaryContainer: {
    backgroundColor: COLORS.summaryBg,
    borderRadius: 32,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.cardBg,
    width: '48%',
    aspectRatio: 1,
    padding: 15,
    borderRadius: 32,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statTitle: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconContainer: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIcon: {
    width: 42,
    height: 42,
    tintColor: COLORS.accentBrown,
  },
  valueContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.valueBrown,
  },
  statSuffix: {
    fontSize: 18,
    color: COLORS.suffixGrey,
    marginTop: -4,
  },
  // Metrics Row Styles
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    padding: 5,
    marginVertical: 15,
  },
  metricItem: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  metricHighlight: {
    backgroundColor: '#E8E8E8',
    borderRadius: 15,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  mainChartContainer: {
    backgroundColor: COLORS.summaryBg,
    borderRadius: 32,
    padding: 20,
    marginBottom: 10,
  },
  // Chart Styles
  chartContainer: {
    backgroundColor: 'COLORS.cardBg',
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 25,
  },
  chartWrapper: {
    marginLeft: -15,
    minHeight: 220,
    justifyContent: 'center',
  },
  axisText: {
    fontSize: 10,
    color: '#999',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
  noDataBox: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  // Modal Styles
  modal: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 25,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  orderRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  orderMainText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  orderSubText: {
    fontSize: 12,
    color: COLORS.accentBrown,
  },
  orderAmountText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  noOrdersText: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
  },
});