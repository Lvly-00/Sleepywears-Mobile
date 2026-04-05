import api from '@/src/services/api';
import { router, useLocalSearchParams } from 'expo-router';
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
  const { highlightId } = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);
  const processedHighlightId = useRef<string | null>(null);

  const [activeHighlight, setActiveHighlight] = useState<string | null>(null); const [orders, setOrders] = useState<any[]>([]);
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

  //Hightlight Redirected Orders
  useEffect(() => {
    if (!highlightId || orders.length === 0 || processedHighlightId.current === highlightId.toString()) {
      return;
    }

    const targetId = highlightId.toString();
    const index = orders.findIndex(o => o.id.toString() === targetId);

    if (index !== -1) {
      processedHighlightId.current = targetId;

      setActiveHighlight(targetId);

      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5
        });
      }, 100);

      const timer = setTimeout(() => {
        setActiveHighlight(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [highlightId, orders]);

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

  useEffect(() => {
    if (selectedOrder) {
      // Log the actual field we are using for the logic
      console.log("LOGGED PAYMENT STATUS:", selectedOrder?.payment?.payment_status);
      console.log("IS IT EQUAL TO 'paid'?", selectedOrder?.payment?.payment_status?.trim().toLowerCase() === 'paid');
    }
  }, [selectedOrder]);

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

  const renderItem = useCallback(({ item }: { item: any }) => {
    const isHighlighted = activeHighlight === item.id.toString();

    return (
      <View style={isHighlighted ? styles.highlightContainer : null}>
        <OrderItem
          item={item}
          onPress={handleOrderPress}
          onLongPress={handleLongPress}
        />
      </View>
    );
  }, [handleOrderPress, handleLongPress, activeHighlight]);


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
              extraData={activeHighlight}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              onScroll={onScroll}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListFooterComponent={() => loadingMore ? <ActivityIndicator style={{ margin: 20 }} color="#0A256C" /> : null}
              ListEmptyComponent={<Text style={styles.emptyText}>{search.trim().length > 0 ? "No results found." : "No orders found."}</Text>}

              getItemLayout={(data, index) => (
                { length: 90, offset: 90 * index, index } // Adjust '90' to your OrderItem height
              )}
              removeClippedSubviews={true}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          )}
        </View>

        <OrderActionModal
          visible={actionVisible}
          customerName={selectedOrder ? `${selectedOrder.first_name} ${selectedOrder.last_name}` : ""}
          onClose={() => setActionVisible(false)}
          showAddPayment={selectedOrder?.payment?.payment_status?.toLowerCase() !== 'paid'}
          onAddPayment={() => { setActionVisible(false); setTimeout(() => setPaymentVisible(true), 350); }}
          onDeletePress={() => { setActionVisible(false); setTimeout(() => setDeleteVisible(true), 350); }}
        />

        <DeleteConfirmModal
          visible={deleteVisible}
          customerName={selectedOrder ? `${selectedOrder.first_name} ${selectedOrder.last_name}` : ""}
          onClose={() => setDeleteVisible(false)}
          onConfirm={confirmDelete}
        />

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
  },
  highlightContainer: {
    borderWidth: 2,
    borderColor: '#1B4E8C',
    backgroundColor: '#e0ecff',
    marginVertical: 6,
    marginHorizontal: -4,
    padding: 3,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  }
});