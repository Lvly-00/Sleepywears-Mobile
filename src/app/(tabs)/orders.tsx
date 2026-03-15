import AddPaymentModal from '@/src/components/add-payment-modal';
import api from '@/src/services/api';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Badge, Button, IconButton, Provider, Surface } from 'react-native-paper';

// --- Types ---
interface Order {
  id: number;
  formatted_id: string;
  first_name: string;
  last_name: string;
  order_date: string;
  total: number;
  items_count?: number;
  payment?: {
    payment_status: 'Paid' | 'Unpaid';
    payment_method?: string;
    additional_fee?: number;
  };
}

export default function OrdersScreen() {
  // --- State ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // --- Fetch Orders ---
  const fetchOrders = async (page: number, searchTerm: string, isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get("/orders", {
        params: {
          page,
          per_page: 10,
          search: searchTerm.trim() || undefined,
        },
      });

      const data = res.data.data || [];
      setOrders(data);
      setTotalPages(res.data.last_page || 1);
    } catch (err) {
      console.error("Error fetching orders:", err);
      Alert.alert("Error", "Failed to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, search);
  }, [currentPage]);

  // --- Handlers ---
  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders(1, search);
  };

  const handleOpenPayment = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  // Update local state when an order is updated (paid)
  const handleOrderUpdated = (updatedOrder: Order) => {
    setOrders((prevOrders) =>
      prevOrders.map((ord) => (ord.id === updatedOrder.id ? updatedOrder : ord))
    );
  };

  const handleDelete = (order: Order) => {
    Alert.alert(
      "Delete Order",
      `Are you sure you want to delete ${order.formatted_id}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/orders/${order.id}`);
              // If last item on page is deleted, go back a page
              if (orders.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
              } else {
                fetchOrders(currentPage, search);
              }
            } catch (err) {
              Alert.alert("Error", "Failed to delete order.");
            }
          } 
        }
      ]
    );
  };

  // --- Render Item ---
  const renderOrderItem = ({ item }: { item: Order }) => {
    const isPaid = item.payment?.payment_status === "Paid";
    
    return (
      <Surface style={styles.card} elevation={1}>
        <TouchableOpacity 
          onPress={() => router.push({
            pathname: '/screens/invoice',
            params: { orderData: JSON.stringify(item) }
          })}
        >
          {/* Header: ID and Date */}
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>{item.formatted_id}</Text>
            <Text style={styles.date}>
              {new Date(item.order_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </View>

          {/* Body: Customer Name */}
          <Text style={styles.customerName}>{item.first_name} {item.last_name}</Text>

          {/* Footer: Price and Status */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.priceLabel}>Total Price</Text>
              <Text style={styles.price}>₱{Math.round(item.total).toLocaleString()}</Text>
            </View>

            <View style={styles.actionContainer}>
              <Badge 
                style={[
                    styles.badge, 
                    { 
                        backgroundColor: isPaid ? "#A5BDAE" : "#D9D9D9", 
                        color: isPaid ? "#1E4620" : "#7A7A7A" 
                    }
                ]}
              >
                {item.payment?.payment_status || "Unpaid"}
              </Badge>
              
              <View style={styles.iconGroup}>
                 {!isPaid && (
                    <IconButton 
                        icon="cash-plus" 
                        size={22} 
                        iconColor="#276D58" 
                        onPress={() => handleOpenPayment(item)} 
                        containerColor="#E8F5E9"
                        style={{ marginRight: 8 }}
                    />
                 )}
                 <IconButton 
                    icon="trash-can-outline" 
                    size={22} 
                    iconColor="#9E2626" 
                    onPress={() => handleDelete(item)} 
                    containerColor="#FFEBEE"
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Surface>
    );
  };

  return (
    <Provider>
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.header}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by ID or Name..."
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <Button 
              mode="contained" 
              style={styles.addBtn} 
              onPress={() => router.push('/screens/create-order')}
            >
              + Add
            </Button>
          </View>
        </View>

        {loading && orders.length === 0 ? (
          <ActivityIndicator color="#AB8262" size="large" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(1, search, true)} />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No orders found.</Text>
            }
            ListFooterComponent={
              totalPages > 1 ? (
                <View style={styles.pagination}>
                    <IconButton 
                        icon="chevron-left" 
                        disabled={currentPage === 1} 
                        onPress={() => setCurrentPage(prev => prev - 1)} 
                    />
                    <Text style={styles.pageInfo}>Page {currentPage} of {totalPages}</Text>
                    <IconButton 
                        icon="chevron-right" 
                        disabled={currentPage === totalPages} 
                        onPress={() => setCurrentPage(prev => prev + 1)} 
                    />
                </View>
              ) : null
            }
          />
        )}

        {/* The Payment Modal */}
        <AddPaymentModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          order={selectedOrder}
          onOrderUpdated={handleOrderUpdated}
        />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F0ED' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#FFF', elevation: 2 },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchInput: { 
    flex: 1, 
    backgroundColor: '#F5F5F5', 
    borderRadius: 10, 
    paddingHorizontal: 15, 
    height: 45,
    borderWidth: 1,
    borderColor: '#DDD'
  },
  addBtn: { backgroundColor: '#0D0F66', borderRadius: 10, justifyContent: 'center' },
  listContent: { padding: 15, paddingBottom: 100 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 12,
    borderLeftWidth: 6,
    borderLeftColor: '#AB8262' 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#AB8262' },
  date: { fontSize: 12, color: '#888' },
  customerName: { fontSize: 19, fontWeight: '700', color: '#333', marginVertical: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 },
  priceLabel: { fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },
  price: { fontSize: 20, fontWeight: '700', color: '#0D0F66' },
  actionContainer: { alignItems: 'flex-end' },
  badge: { borderRadius: 6, width: 85, marginBottom: 8, fontWeight: 'bold' },
  iconGroup: { flexDirection: 'row' },
  pagination: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    marginBottom: 30 
  },
  pageInfo: { fontSize: 14, color: '#666', fontWeight: '500' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});