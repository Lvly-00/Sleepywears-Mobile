import api from '@/src/services/api';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Provider, Searchbar } from 'react-native-paper';

// Internal Components
import AddPaymentModal from '../../components/add-payment-modal';
import { OrderActionModal } from '../../components/order-action-modal';
import { DeleteConfirmModal } from '../../components/order-delete-confirmation';
import OrderItem from '../../components/order-item';
import FabScreenWrapper from '../../components/ui/fab-screen-wrapper';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isExtended, setIsExtended] = useState(true);

  // MODAL STATES
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [actionVisible, setActionVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);

  // LOCK to prevent duplicate calls during infinite scroll
  const isFetching = useRef(false);

  const fetchOrders = async (cursor: string | null = null, searchTerm: string, isRefresh = false) => {
    if (isFetching.current) return;
    isFetching.current = true;

    if (!cursor) {
      if (!isRefresh) setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await api.get("/orders", {
        params: { cursor: cursor || undefined, search: searchTerm, per_page: 15 }
      });

      const newData = res.data.data;

      setOrders(prev => {
        if (!cursor) return newData;
        // Prevent "Duplicate Key" errors by checking if ID already exists
        const existingIds = new Set(prev.map(o => o.id));
        const filteredNewData = newData.filter((o: any) => !existingIds.has(o.id));
        return [...prev, ...filteredNewData];
      });

      setNextCursor(res.data.next_cursor);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchOrders(null, search);
  }, []);

  // HANDLERS
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(null, search, true);
  }, [search]);

  const loadMore = useCallback(() => {
    if (!loadingMore && nextCursor && !isFetching.current) {
      fetchOrders(nextCursor, search);
    }
  }, [loadingMore, nextCursor, search]);

  const onScroll = ({ nativeEvent }: any) => {
    const currentScrollOffset = nativeEvent.contentOffset.y;
    setIsExtended(currentScrollOffset <= 0);
  };

  const handleOrderPress = useCallback((item: any) => {
    router.push({ pathname: '/screens/invoice', params: { orderData: JSON.stringify(item) } });
  }, []);

  const handleLongPress = useCallback((item: any) => {
    setSelectedOrder(item);
    setActionVisible(true);
  }, []);

  /**
   * FIX: Modal Transition
   * We must close the Action Modal and wait for its animation to finish 
   * before opening the next Modal (Add Payment or Delete).
   */
  const handleOpenAddPayment = () => {
    setActionVisible(false);
    setTimeout(() => {
      setPaymentVisible(true);
    }, 350); // 350ms delay for smooth transition
  };

  const handleOpenDeleteConfirm = () => {
    setActionVisible(false);
    setTimeout(() => {
      setDeleteVisible(true);
    }, 350);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/orders/${selectedOrder.id}`);
      setDeleteVisible(false);
      onRefresh(); // Reload list
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => (
    <OrderItem
      item={item}
      onPress={handleOrderPress}
      onLongPress={handleLongPress}
    />
  ), [handleOrderPress, handleLongPress]);

  return (
    <Provider>
      <FabScreenWrapper
        fabLabel="Add Order"
        onFabPress={() => router.push('/screens/create-order')}
        isExtended={isExtended}
        fabBackgroundColor="#0A256C"
      >
        <View style={styles.container}>
          <Searchbar
            placeholder="Search Order..."
            placeholderTextColor={'#7A7A7A'}
            onChangeText={(t) => { setSearch(t); fetchOrders(null, t); }}
            value={search}
            inputStyle={styles.searchInputText}
            style={styles.searchBar}
          />

          {loading && orders.length === 0 ? (
            <ActivityIndicator style={{ marginTop: 50 }} color="#0A256C" size="large" />
          ) : (
            <FlatList
              data={orders}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              onScroll={onScroll}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListFooterComponent={() => loadingMore ? <ActivityIndicator style={{ margin: 20 }} color="#0A256C" /> : null}
              ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
              // Performance items
              removeClippedSubviews={true}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          )}
        </View>

        {/* 1. INITIAL ACTION MODAL ( 설계 1 Reference ) */}
        <OrderActionModal
          visible={actionVisible}
          customerName={selectedOrder ? `${selectedOrder.first_name} ${selectedOrder.last_name}` : ""}
          onClose={() => setActionVisible(false)}
          onAddPayment={handleOpenAddPayment}
          onDeletePress={handleOpenDeleteConfirm}
        />

        {/* 2. DELETE CONFIRMATION ( 설계 2 Reference ) */}
        <DeleteConfirmModal
          visible={deleteVisible}
          customerName={selectedOrder ? `${selectedOrder.first_name} ${selectedOrder.last_name}` : ""}
          onClose={() => setDeleteVisible(false)}
          onConfirm={confirmDelete}
        />

        {/* 3. ADD PAYMENT MODAL */}
        <AddPaymentModal
          visible={paymentVisible}
          onClose={() => setPaymentVisible(false)}
          order={selectedOrder}
          onOrderUpdated={onRefresh}
        />
      </FabScreenWrapper>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  searchBar: {
    margin: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ADB5BD',
    backgroundColor: '#FFF',
    elevation: 0,
    height: 45,
  },
  searchInputText: {
    fontSize: 15,
    minHeight: 0,
    color: '#11181C'
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#7A7A7A',
    fontSize: 16
  }
});