import api from '@/src/services/api';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Divider, IconButton, Surface } from 'react-native-paper';

// --- Types ---
interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  address?: string;
  contact_number: string;
  social_handle?: string;
  created_at: string;
}

export default function CustomerLogsScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Customers
  const fetchCustomers = async (targetPage: number, searchTerm: string, isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get("/customers", {
        params: {
          page: targetPage,
          per_page: 10,
          search: searchTerm.trim() || undefined,
        },
      });

      const data = res.data.data || [];
      setCustomers(data);
      setTotalPages(res.data.last_page || 1);
    } catch (err) {
      console.error("Fetch error:", err);
      Alert.alert("Error", "Failed to load customers.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page, search);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchCustomers(1, search);
  };

  const handleDelete = (customer: Customer) => {
    Alert.alert(
      "Permanently Delete?",
      `This will delete ${customer.first_name} ${customer.last_name} and all associated orders. Are you sure?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/customers/${customer.id}`);
              fetchCustomers(page, search);
            } catch (err) {
              Alert.alert("Error", "Could not delete customer.");
            }
          } 
        }
      ]
    );
  };

  const openLink = (url?: string) => {
    if (url && /^https?:\/\//.test(url)) {
      Linking.openURL(url).catch(() => Alert.alert("Error", "Invalid URL"));
    }
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.customerName}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.dateLabel}>Joined {new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <IconButton 
          icon="trash-can-outline" 
          iconColor="#9E2626" 
          size={22} 
          onPress={() => handleDelete(item)} 
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.detailRow}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{item.address || "—"}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Contact:</Text>
        <Text style={styles.value}>{item.contact_number}</Text>
      </View>

      {item.social_handle && (
        <TouchableOpacity onPress={() => openLink(item.social_handle)} style={styles.detailRow}>
          <Text style={styles.label}>Socials:</Text>
          <Text style={[styles.value, styles.linkText]} numberOfLines={1}>
            {item.social_handle}
          </Text>
        </TouchableOpacity>
      )}
    </Surface>
  );

  return (
    <View style={styles.container}>
      {/* Header Area */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customer Logs</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
          />
          <IconButton 
            icon="magnify" 
            mode="contained" 
            containerColor="#0D0F66" 
            iconColor="#FFF" 
            size={24} 
            onPress={handleSearch} 
          />
        </View>
      </View>

      {loading && customers.length === 0 ? (
        <ActivityIndicator color="#AB8262" size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCustomerItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchCustomers(1, search, true)} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No customers found.</Text>
          }
          ListFooterComponent={
            <View style={styles.pagination}>
              <IconButton 
                icon="chevron-left" 
                disabled={page === 1} 
                onPress={() => setPage(p => p - 1)} 
              />
              <Text style={styles.pageIndicator}>Page {page} of {totalPages}</Text>
              <IconButton 
                icon="chevron-right" 
                disabled={page === totalPages} 
                onPress={() => setPage(p => p + 1)} 
              />
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F0ED' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#FFF' },
  headerTitle: { 
    fontSize: 24, 
    fontFamily: 'LeagueSpartan-Bold', 
    color: '#0D0F66', 
    marginBottom: 15 
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { 
    flex: 1, 
    backgroundColor: '#F5F5F5', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    height: 48,
    borderWidth: 1,
    borderColor: '#DDD'
  },
  listContent: { padding: 15, paddingBottom: 100 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EAE7E2'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  customerName: { fontSize: 18, fontWeight: '700', color: '#333' },
  dateLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { marginVertical: 12, backgroundColor: '#F0F0F0' },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  label: { width: 80, fontSize: 13, color: '#777', fontWeight: '600' },
  value: { flex: 1, fontSize: 13, color: '#333' },
  linkText: { color: '#AB8262', textDecorationLine: 'underline' },
  pagination: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    paddingBottom: 20
  },
  pageIndicator: { fontSize: 14, color: '#666', fontWeight: '500' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});