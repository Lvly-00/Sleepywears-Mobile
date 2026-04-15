import { DashboardSkeleton } from '@/src/components/dashboard-skeleton-loader';
import api from '@/src/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { LineChart } from 'react-native-gifted-charts';
import { Surface, Text } from 'react-native-paper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#05004E',
  background: '#F8F9FA',
  summaryBg: '#f1f1f1',
  riskBg: '#F2E8E5',
  cardBg: '#FFFFFF',
  accentBrown: '#944E1B',
  valueBrown: '#5D4324',
  chartLines: ["#54361C", "#944E1B", "#F0BB78", "#AB8262", "#232D80"]
};

const ICONS = {
  netIncome: require('@/assets/images/net-income.png'),
  grossIncome: require('@/assets/images/gross-income.png'),
  totalItemsSold: require('@/assets/images/items-sold.png'),
  activeCustomers: require('@/assets/images/active-customers.png'),
};

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedKriId, setSelectedKriId] = useState('all');
  const [isFocus, setIsFocus] = useState(false);
  const [chartDataSets, setChartDataSets] = useState<any[]>([]);
  const [chartMaxValue, setChartMaxValue] = useState(15000);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const fetchData = useCallback(async (isSilent: boolean) => {
    try {
      if (!isSilent && !data) setLoading(true);

      const res = await api.get('/dashboard');
      const d = res.data;

      setData(d);
      setLastFetched(Date.now());
      // Process Chart Data
      if (d.dailySales && d.collectionSales) {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        let globalMax = 0;

        const datasets = d.collectionSales.map((colName: string, index: number) => {
          const color = COLORS.chartLines[index % COLORS.chartLines.length];
          const lineData = [];
          for (let i = 1; i <= daysInMonth; i++) {
            const dayEntry = d.dailySales.find((entry: any) => Number(entry.date) === i);
            const val = dayEntry ? Number(dayEntry[colName]) || 0 : 0;
            if (val > globalMax) globalMax = val;
            lineData.push({ value: val, label: i.toString(), dataPointText: val > 0 ? `${Math.round(val)}` : '' });
          }
          return { data: lineData, color, thickness: 3, curved: true, hideDataPoints: false, dataPointsColor: color, dataPointsRadius: 4, textColor: color };
        });
        setChartMaxValue(globalMax > 0 ? globalMax * 1.3 : 15000);
        setChartDataSets(datasets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      if (data) {
        fetchData(true);
      } else {
        fetchData(false);
      }
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);


  if (loading || !data) {
    return <DashboardSkeleton />;
  }
  if (!data) return null;

  const collectionsWithRisk = data.collections.filter((col: any) => {
    const kri = data.kris[col.id];
    return kri && (kri.receivables > 0 || kri.unpaid_orders > 0 || kri.dead_stock > 0);
  });

  const globalRisk = data.kris['all'];
  const hasGlobalRisk = globalRisk && (globalRisk.receivables > 0 || globalRisk.unpaid_orders > 0 || globalRisk.dead_stock > 0);

  const dropdownData = [];
  if (hasGlobalRisk) {
    dropdownData.push({ id: 'all', name: 'All Collections' });
  }
  dropdownData.push(...collectionsWithRisk);

  const currentKri = data.kris[selectedKriId];
  // Ensure we show the card if the current selection has risk
  const hasRisk = currentKri && (currentKri.receivables > 0 || currentKri.unpaid_orders > 0 || currentKri.dead_stock > 0);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* 1. TOP PERFORMANCE PILL */}
        <View style={styles.pillHeader}>

          <Text style={styles.pillTitle}>Today's Progress</Text>
        </View>
        <Surface style={styles.piContainer} elevation={1}>
          <PIItem icon="cart-outline" value={data.pi.orders} label="Orders" />
          <View style={styles.divider} />
          <PIItem icon="account-plus-outline" value={data.pi.leads} label="New Customers" />
          <View style={styles.divider} />
          <PIItem icon="file-document-outline" value={data.pi.invoices} label="Invoices" />
        </Surface>

        {/* 2. CRITICAL RISKS SECTION */}
        {hasRisk && (
          <View style={styles.riskCard}>
            <View style={styles.riskHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="shield-alert-outline" size={24} color="#7E3A3A" />
                <Text style={styles.riskTitle}>Critical Risks</Text>
              </View>

              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: '#000' }]}
                selectedTextStyle={styles.dropdownText}
                data={dropdownData}
                labelField="name"
                valueField="id"
                value={selectedKriId}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setSelectedKriId(item.id);
                  setIsFocus(false);
                }}
                renderRightIcon={() => (
                  <MaterialCommunityIcons name="chevron-down" size={22} color="#000" />
                )}
              />
            </View>

            <View style={styles.riskGrid}>
              <RiskStat
                icon="cash-multiple"
                label="Uncollected Sales"
                value={`₱${Math.round(currentKri.receivables).toLocaleString()}`}
              />
              <RiskStat
                icon="clock-outline"
                label="Unpaid Orders"
                value={currentKri.unpaid_orders}
              />
              <RiskStat
                icon="package-variant-closed"
                label="Unsold Items"
                value={currentKri.dead_stock}
              />
            </View>
          </View>
        )}


        {/* 3. SUMMARY SECTION */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionHeading}>Summary</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Net Income" value={`₱${Math.round(data.netIncome).toLocaleString()}`} icon={ICONS.netIncome} />
            <StatCard title="Gross Income" value={`₱${Math.round(data.grossIncome).toLocaleString()}`} icon={ICONS.grossIncome} />
            <StatCard title="Total Items Sold" value={data.totalItemsSold} suffix="pieces" icon={ICONS.totalItemsSold} />
            <StatCard title="Active Customers" value={data.totalCustomers} suffix="total" icon={ICONS.activeCustomers} />
          </View>
        </View>

        {/* 4. CHART SECTION */}
        <Surface style={styles.chartSurface} elevation={1}>
          <Text style={styles.chartTitle}>{currentMonth} Collection Sales</Text>
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.yAxisBox}><Text style={styles.yAxisText}>Profit</Text></View>
            <View style={{ flex: 1 }}>
              <LineChart
                dataSet={chartDataSets}
                height={220}
                width={SCREEN_WIDTH - 120}
                spacing={60}
                initialSpacing={20}
                maxValue={chartMaxValue}
                noOfSections={4}
                verticalLinesColor="#F5F5F5"
                yAxisTextStyle={styles.axisText}
                xAxisLabelTextStyle={styles.axisText}
                formatYLabel={(l) => Number(l) >= 1000 ? `${(Number(l) / 1000)}k` : l}
                textFontSize={9}
                textShiftY={-10}
                focusEnabled={false}
              />
            </View>
          </View>
        </Surface>
      </ScrollView>
    </View>
  );
}

const PIItem = ({ icon, value, label }: any) => (
  <View style={styles.piItem}>
    <MaterialCommunityIcons name={icon} size={24} color="#0A0B32" />
    <View style={{ marginLeft: 8 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#000000' }}>{value}</Text>
      <Text style={{ fontSize: 14, color: '#000000' }}>{label}</Text>
    </View>
  </View>
);

const RiskStat = ({ icon, label, value }: any) => (
  <View style={styles.riskStatItem}>
    <View style={styles.riskTopRow}>
      <View style={styles.riskIconCircle}>
        {/* Main Icon */}
        <MaterialCommunityIcons name={icon} size={22} color="#7E3A3A" />

        {/* Circle Cross Badge */}
        <View style={styles.badgeContainer}>
          <MaterialCommunityIcons name="close" size={10} color="#7E3A3A" strokeWidth={2} />
        </View>
      </View>
      <Text style={styles.riskValue}>{value}</Text>
    </View>
    <Text style={styles.riskLabel}>{label}</Text>
  </View>
);

const StatCard = ({ title, value, suffix, icon }: any) => (
  <View style={styles.statCard}>
    <Text style={styles.statTitle}>{title}</Text>
    <Image source={icon} style={styles.statIcon} resizeMode="contain" />
    <Text style={styles.statValue}>{value}</Text>
    {suffix && <Text style={styles.statSuffix}>{suffix}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  // ================= PI PILLS =================
  piContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 5,
    marginBottom: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pillTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#000',
  },
  piItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: '70%',
    backgroundColor: '#EEE',
  },

  // ================= RISK CARD =================
  riskCard: {
    backgroundColor: COLORS.riskBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0B4B4',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  riskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#000',
  },
  dropdown: {
    height: 30,
    width: 160,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
  },

  dropdownText: {
    fontSize: 14,
    fontWeight: '500'
  },

  riskGrid: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  riskStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  riskTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  riskIconCircle: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 10,
    marginRight: 10,
    marginLeft: -15,
    position: 'relative',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },


  badgeContainer: {
    position: 'absolute',
    bottom: 3,
    right: 4,
    backgroundColor: '#FFF',
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  riskValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  riskLabel: {
    fontSize: 14,
    color: '#000',
    textAlign: 'left',
    fontWeight: '500'
  },

  // ================= SUMMARY =================
  summarySection: {
    backgroundColor: COLORS.summaryBg,
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: -15
  },
  statCard: {
    backgroundColor: '#FFF',
    padding: 10,
    width: '48%',
    aspectRatio: 1.1,
    borderRadius: 24,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  statTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: "#000",
  },
  statIcon: {
    width: 42,
    height: 42,
    marginBottom: 8,
    tintColor: COLORS.accentBrown,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.valueBrown,
  },
  statSuffix: {
    fontSize: 20,
    color: '#7A6F58',
  },

  // ================= CHART =================
  chartSurface: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  chartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: "#05004E"
  },
  yAxisBox: {
    width: 20,
    justifyContent: 'center',
  },
  yAxisText: {
    transform: [{ rotate: '-90deg' }],
    color: '#707070',
    fontSize: 10,
    width: 30,
    textAlign: 'center',
  },
  axisText: {
    fontSize: 9,
    color: '#707070',
  },
});