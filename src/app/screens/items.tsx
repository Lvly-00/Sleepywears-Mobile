import SuccessModal from '@/src/components/success-modal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ItemCard } from '../../components/item-card';
import { DeleteConfirmationModal } from '../../components/item-delete-confirmation';
import ItemSkeleton from '../../components/items-skeleton-loader';
import FabScreenWrapper from '../../components/ui/fab-screen-wrapper';
import api from '../../services/api';

export default function ItemsScreen() {
    const [collectionCapital, setCollectionCapital] = useState(0);
    const { collectionId, collectionName } = useLocalSearchParams<{ collectionId: string, collectionName: string }>();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalState, setModalState] = useState({ visible: false, loading: false, msg: "" });
    const [revenue, setRevenue] = useState(0);

    const totals = useMemo(() => {
        return {
            capital: collectionCapital,
            revenue: revenue
        };
    }, [collectionCapital, revenue]);

    const isSelectionMode = selectedIds.size > 0;

    const fetchItems = async () => {
        if (!collectionId) return;
        try {
            setLoading(true);
            const res = await api.get('/items', { params: { collection_id: collectionId } });

            if (res.data && Array.isArray(res.data.items)) {
                setItems(res.data.items);
                setCollectionCapital(Number(res.data.collection_capital || 0));
                setRevenue(Number(res.data.calculated_revenue || 0)); // ✅ USE BACKEND VALUE
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchItems(); }, [collectionId]));

    const toggleSelection = (id: string | number) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleConfirmDelete = async () => {
        setIsModalVisible(false);
        setModalState({ visible: true, loading: true, msg: "Deleting items..." });
        try {
            const deletePromises = Array.from(selectedIds).map(id =>
                api.delete(`/items/${id}`)
            );
            await Promise.all(deletePromises);
            setModalState({ visible: true, loading: false, msg: "Item(s) deleted successfully!" });

            setTimeout(async () => {
                setModalState({ ...modalState, visible: false });
                setSelectedIds(new Set());
                await fetchItems();
            }, 1500);
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    // 2. Summary Header Component
    const SummaryHeader = () => (
        <View style={styles.summaryContainer}>
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>Capital</Text>
                <Text style={[styles.statValue, { color: '#0f0f0f' }]}>
                    ₱{totals.capital.toLocaleString()}
                </Text>
            </View>
            <View style={styles.statSeparator} />
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>Revenue</Text>
                <Text style={[
                    styles.statValue,
                    { color: totals.revenue >= 0 ? '#22c55e' : '#ef4444' }
                ]}>
                    ₱{totals.revenue.toLocaleString()}
                </Text>
            </View>
        </View>
    );

    const renderHeaderRight = () => {
        if (!isSelectionMode) return null;
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                <TouchableOpacity onPress={() => setSelectedIds(new Set(items.map(i => i.id)))}>
                    <MaterialCommunityIcons name="select-all" size={24} color="#ffffff" />
                </TouchableOpacity>

                {selectedIds.size === 1 && (
                    <TouchableOpacity onPress={() => {
                        const item = items.find(i => i.id === Array.from(selectedIds)[0]);
                        router.push({ pathname: '/screens/edit-item', params: { item: JSON.stringify(item), collectionId } });
                        setSelectedIds(new Set());
                    }}>
                        <MaterialCommunityIcons name="pencil" size={24} color="#ffffff" />
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ffffff" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <FabScreenWrapper
            fabLabel="Add Item"
            fabIcon="plus"
            onFabPress={() => router.push({ pathname: '/screens/create-item', params: { collectionId } })}
            visible={!isSelectionMode}
            style={styles.fabScreenWrapper}
        >
            <Stack.Screen
                options={{
                    title: isSelectionMode ? `${selectedIds.size} Selected` : (collectionName || 'Collection'),
                    headerRight: renderHeaderRight,
                    headerLeft: isSelectionMode ? () => (
                        <TouchableOpacity onPress={() => setSelectedIds(new Set())} style={{ paddingRight: 25 }}>
                            <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
                        </TouchableOpacity>
                    ) : undefined
                }}
            />

            <View style={styles.container}>
                {loading && items.length === 0 ? (
                    <ItemSkeleton repeat={12} />
                ) : (
                    <FlatList
                        data={items}
                        numColumns={3}
                        keyExtractor={(item) => item.id.toString()}
                        columnWrapperStyle={items.length > 0 ? styles.row : undefined}
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                        // 3. Show stats even if list is empty
                        ListHeaderComponent={<SummaryHeader />}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="image-off-outline" size={60} color="#ccc" />
                                <Text style={styles.emptyText}>No items available</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <ItemCard
                                item={item}
                                isSelected={selectedIds.has(item.id)}
                                isSelectionMode={isSelectionMode}
                                onPress={() => isSelectionMode ? toggleSelection(item.id) : null}
                                onLongPress={() => toggleSelection(item.id)}
                            />
                        )}
                    />
                )}
            </View>

            <DeleteConfirmationModal
                visible={isModalVisible}
                title="Delete Confirmation"
                message={`Are you sure you want to delete ${selectedIds.size} selected item${selectedIds.size > 1 ? 's' : ''}?`}
                onCancel={() => !isDeleting && setIsModalVisible(false)}
                onConfirm={handleConfirmDelete}
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
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    row: {
        justifyContent: 'flex-start',
        gap: 10
    },
    summaryContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statSeparator: {
        width: 1,
        height: '80%',
        backgroundColor: '#eee',
        alignSelf: 'center',
    },
    statLabel: {
        fontSize: 11,
        color: '#888',
        textTransform: 'uppercase',
        fontWeight: '700',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
        marginTop: 10,
        fontWeight: '500'
    },
    fabScreenWrapper: {
        paddingBottom: 20,
    },
});