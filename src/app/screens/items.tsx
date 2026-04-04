import SuccessModal from '@/src/components/success-modal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ItemCard } from '../../components/item-card';
import { DeleteConfirmationModal } from '../../components/item-delete-confirmation';
import FabScreenWrapper from '../../components/ui/fab-screen-wrapper';
import api from '../../services/api';

export default function ItemsScreen() {
    const { collectionId, collectionName } = useLocalSearchParams<{ collectionId: string, collectionName: string }>();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalState, setModalState] = useState({ visible: false, loading: false, msg: "" });


    const isSelectionMode = selectedIds.size > 0;

    const fetchItems = async () => {
        if (!collectionId) return;
        try {
            setLoading(true);
            const res = await api.get('/items', { params: { collection_id: collectionId } });
            setItems(res.data);
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

    const renderHeaderRight = () => {
        if (!isSelectionMode) return null;
        const selectedItem = items.find(i => i.id === Array.from(selectedIds)[0]);
        const isSoldOut = selectedItem?.status === "Sold Out" || selectedItem?.is_available === false;


        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                <TouchableOpacity onPress={() => setSelectedIds(new Set(items.map(i => i.id)))}>
                    <MaterialCommunityIcons name="select-all" size={24} color="#ffffff" />
                </TouchableOpacity>

                {selectedIds.size === 1 && !isSoldOut && (
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
                    <ActivityIndicator size="large" color="#1C4D8D" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={items}
                        numColumns={3}
                        keyExtractor={(item) => item.id.toString()}
                        columnWrapperStyle={items.length > 0 ? styles.row : undefined}
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                        // 3. Display message when list is empty
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
        paddingTop: 20,

    },
    row: {
        justifyContent: 'flex-start',
        gap: 10
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100
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