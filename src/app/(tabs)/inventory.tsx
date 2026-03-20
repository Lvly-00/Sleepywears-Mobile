import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Searchbar, Text } from 'react-native-paper';
import { ActionDialog } from '../../components/action-dialog';
import { CollectionCard } from '../../components/collection-card';
import FabScreenWrapper from '../../components/ui/fab-screen-wrapper';
import api from '../../services/api';

export default function InventoryScreen() {
    const [collections, setCollections] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isFabExtended, setIsFabExtended] = useState(true);

    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [showActions, setShowActions] = useState(false);

    const fetchCollections = async () => {
        try {
            const res = await api.get('/collections');
            const data = Array.isArray(res.data?.data) ? res.data.data : [];

            const sortedData = data.sort((a: any, b: any) => {
                if (a.status === 'Active' && b.status === 'Sold Out') return -1;
                if (a.status === 'Sold Out' && b.status === 'Active') return 1;
                return 0;
            });

            setCollections(sortedData);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchCollections(); }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCollections();
    }, []);

    const filteredCollections = useMemo(() => {
        return collections.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, collections]);

    const handleLongPress = (item: any) => {
        setSelectedItem(item);
        setShowActions(true);
    };

    // ✅ FIXED navigation (PASS NAME HERE)
    const handleCardPress = (item: any) => {
        router.push({
            pathname: '/screens/items',
            params: {
                collectionId: item.id,
                collectionName: item.name,
            },
        });
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        try {
            await api.delete(`/collections/${selectedItem.id}`);
            setCollections(prev => prev.filter(c => c.id !== selectedItem.id));
            setShowActions(false);
        } catch (err) {
            console.error('Delete error:', err);
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
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                />

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={filteredCollections}
                        onScroll={onScroll}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <CollectionCard
                                item={item}
                                onPress={() => handleCardPress(item)} // ✅ USE FIXED FUNCTION
                                onLongPress={() => handleLongPress(item)}
                            />
                        )}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListEmptyComponent={<Text style={styles.emptyText}>No collections found.</Text>}
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
        </FabScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchBar: {
        margin: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ADB5BD',
        elevation: 0,
        height: 45,
    },
    searchInput: { minHeight: 0, color: '#11181C' },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#7A7A7A',
        fontSize: 16
    },
});