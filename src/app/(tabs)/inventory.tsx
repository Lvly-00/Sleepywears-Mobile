import SuccessModal from '@/src/components/success-modal';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Searchbar, Text } from 'react-native-paper';
import { ActionDialog } from '../../components/action-dialog';
import { CollectionCard } from '../../components/collection-card';
import CollectionSkeleton from '../../components/inventory-skeleton-loader';
import FabScreenWrapper from '../../components/ui/fab-screen-wrapper';
import api from '../../services/api';

export default function InventoryScreen() {
    const [collections, setCollections] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true); // Initial load
    const [refreshing, setRefreshing] = useState(false); // Pull to refresh
    const [isMoreLoading, setIsMoreLoading] = useState(false); // Infinite scroll loading
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isFabExtended, setIsFabExtended] = useState(true);
    const [successVisible, setSuccessVisible] = useState(false);
    const [modalState, setModalState] = useState({ visible: false, loading: false, msg: "" });

    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [showActions, setShowActions] = useState(false);

    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);


    const fetchCollections = useCallback(async (cursor: string | null = null, isRefreshing = false) => {
        if (cursor) {
            setIsMoreLoading(true);
        } else if (!isRefreshing && collections.length === 0) {
            setLoading(true);
        }
        try {
            const res = await api.get('/collections', {
                params: {
                    cursor: cursor,
                    search: searchQuery || undefined, // Send search to backend
                    per_page: 15
                }
            });

            const newData = res.data.data || [];
            const cursorUrl = res.data.next_page_url;

            // Extract the cursor string from the full URL provided by Laravel
            const nextCursorStr = cursorUrl ? new URL(cursorUrl).searchParams.get('cursor') : null;

            setCollections(prev => cursor ? [...prev, ...newData] : newData);

            setNextCursor(nextCursorStr);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsMoreLoading(false);
        }
    }, [searchQuery, collections.length])
    // Refresh data when scoming from Create/Edit screens
    useFocusEffect(
        useCallback(() => {
            fetchCollections(null, true);
        }, [fetchCollections])
    );

    // Initial Load & Search Trigger
    useEffect(() => {
        // Debounce search to avoid spamming the server while typing
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(() => {
            fetchCollections(null, false);
        }, 500); // 500ms delay

        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchQuery]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCollections(null, true);
    }, [searchQuery]);

    const handleLoadMore = () => {
        // Only load more if we have a cursor and aren't already loading
        if (nextCursor && !isMoreLoading) {
            fetchCollections(nextCursor);
        }
    };

    const handleLongPress = (item: any) => {
        setSelectedItem(item);
        setShowActions(true);
    };

    const handleCardPress = (item: any) => {
        router.push({
            pathname: '/screens/items',
            params: { collectionId: item.id, collectionName: item.name },
        });
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        setShowActions(false);

        setModalState({
            visible: true,
            loading: true,
            msg: "Deleting collection..."
        });

        try {
            await api.delete(`/collections/${selectedItem.id}`);
            setModalState({
                visible: true,
                loading: false,
                msg: "Collection deleted successfully!"
            });
            setTimeout(() => {
                setModalState(prev => ({ ...prev, visible: false }));
                setCollections(prev => prev.filter(c => c.id !== selectedItem.id));
            }, 1500);
        } catch (err) {
            console.error('Delete error:', err);
            setModalState({
                visible: false,
                loading: false,
                msg: "Failed to delete collection."
            });
        }
    };

    const onScroll = ({ nativeEvent }: any) => {
        const y = Math.floor(nativeEvent?.contentOffset?.y) ?? 0;
        setIsFabExtended(y <= 0);
    };

    return (
        <FabScreenWrapper
            fabLabel="Add Collection"
            fabIcon="plus"
            isExtended={isFabExtended}
            onFabPress={() => router.push('/screens/create-collection')}
            fabBackgroundColor="#0A1D56"
            fabTextColor="#ffffff"
        >
            <View style={styles.container}>
                <Searchbar
                    placeholder="Search Collection..."
                    placeholderTextColor={'#7A7A7A'}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    loading={loading && searchQuery.length > 0}
                    style={styles.searchBar}
                    inputStyle={styles.searchInputText}
                />

               {loading && collections.length === 0 ? (
                    <CollectionSkeleton repeat={8} />
                ) : (
                    <FlatList
                        data={collections} // Use full list from state
                        onScroll={onScroll}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <CollectionCard
                                item={item}
                                onPress={() => handleCardPress(item)}
                                onLongPress={() => handleLongPress(item)}
                            />
                        )}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        // Infinite Scroll Props
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.2}
                        ListFooterComponent={
                            isMoreLoading ? (
                                <ActivityIndicator style={{ marginVertical: 20 }} color="#0A1D56" />
                            ) : null
                        }
                        ListEmptyComponent={
                            !loading ? <Text style={styles.emptyText}>No collections found.</Text> : null
                        }
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                )}
            </View>

            <ActionDialog
                visible={showActions}
                item={selectedItem}
                onDismiss={() => setShowActions(false)}
                onEdit={() => {
                    setShowActions(false);
                    router.push({
                        pathname: '/screens/edit-collection',
                        params: {
                            collectionId: selectedItem.id,
                            collectionName: selectedItem.name,
                        },
                    });
                }}
                onDelete={handleDelete}
            />

            <SuccessModal
                visible={modalState.visible}
                isLoading={modalState.loading}
                message={modalState.msg}
            />
        </FabScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    searchBar: {
        margin: 15,
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
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#7A7A7A',
        fontSize: 16
    },
});