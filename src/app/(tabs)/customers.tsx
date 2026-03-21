import api from '@/src/services/api';
import { Customer } from '@/src/types/customer';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Searchbar } from 'react-native-paper';
import { AlphabetSidebar } from '../../components/alphabet-sidebar'; // Import the new component
import { ActionModal } from '../../components/customers-action-modal';

export default function CustomerLogsScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Refs
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionListRef = useRef<SectionList>(null);

  // 1. Functional Scrolling Logic
  const scrollToLetter = (letter: string) => {
    // Find the first section that is equal to or greater than the letter (alphabetically)
    const sectionIndex = sections.findIndex(section => section.title >= letter);

    if (sectionIndex !== -1) {
      sectionListRef.current?.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        animated: true,
        viewOffset: 0,
      });
    }
  };

  const fetchCustomers = async (cursor: string | null = null, isRefreshing = false) => {
    if (cursor) setIsMoreLoading(true);
    else if (!isRefreshing) setLoading(true);

    try {
      const res = await api.get("/customers", {
        params: {
          cursor: cursor,
          search: search || undefined,
          per_page: 15
        }
      });

      const newData = res.data.data || [];
      const cursorUrl = res.data.next_page_url;

      // Extract cursor string from Laravel URL
      const nextCursorStr = cursorUrl ? new URL(cursorUrl).searchParams.get('cursor') : null;

      setCustomers(prev => cursor ? [...prev, ...newData] : newData);
      setNextCursor(nextCursorStr);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsMoreLoading(false);
    }
  };

  // Debounced Search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      fetchCustomers(null, false);
    }, 500);

    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCustomers(null, true);
  }, [search]);

  const handleLoadMore = () => {
    if (nextCursor && !isMoreLoading) {
      fetchCustomers(nextCursor);
    }
  };

  // Memoized Sections
  const sections = useMemo(() => {
    const groups = customers.reduce((acc, obj) => {
      const key = obj.first_name[0].toUpperCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(obj);
      return acc;
    }, {} as any);

    return Object.keys(groups).sort().map(key => ({
      title: key,
      data: groups[key]
    }));
  }, [customers]);

  const handleLongPress = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search Customer..."
          placeholderTextColor={'#7A7A7A'}
          onChangeText={setSearch}
          value={search}
          style={styles.searchBar}
          inputStyle={styles.searchInputText}
          elevation={0}
        />
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator color="#1D2671" />
          </View>
        ) : (
          <SectionList
            ref={sectionListRef} // Attach Ref
            sections={sections}
            keyExtractor={(item) => item.id.toString()}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.headerContainer}>
                <Text style={styles.sectionHeader}>{title}</Text>
                <View style={styles.headerLine} />
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() =>
                  router.push({
                    pathname: '/screens/customer-details',
                    params: { customer: JSON.stringify(item) }
                  })
                }
                onLongPress={() => handleLongPress(item)}
              >
                <Text style={styles.itemText}>
                  {item.first_name} {item.last_name}
                </Text>
              </TouchableOpacity>
            )}
            // Handle scrolling to items not yet rendered (important for infinite scroll)
            onScrollToIndexFailed={(info) => {
              sectionListRef.current?.scrollToLocation({
                sectionIndex: info.index,
                itemIndex: 0,
                animated: false,
              });
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isMoreLoading ? (
                <ActivityIndicator style={{ marginVertical: 20 }} size="small" color="#1D2671" />
              ) : <View style={{ height: 50 }} />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No customers found.</Text>
            }
          />
        )}

        {/* Componentized Sidebar */}
        <AlphabetSidebar onLetterPress={scrollToLetter} />
      </View>

      <ActionModal
        visible={modalVisible}
        customerName={selectedCustomer ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}` : ""}
        onClose={() => setModalVisible(false)}
        onDelete={() => { /* Handle Delete API call here */ setModalVisible(false); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 5,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ADB5BD',
    elevation: 0,
    height: 45,
  },
  searchInputText: {
    fontSize: 15,
    minHeight: 0,
    color: '#11181C'
  },
  headerContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  sectionHeader: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  headerLine: {
    height: 1,
    backgroundColor: '#F0F0F0',
    width: '100%',
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  itemText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
    fontSize: 15,
  }
});