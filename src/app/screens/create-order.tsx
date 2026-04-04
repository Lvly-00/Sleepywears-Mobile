import api from '@/src/services/api';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-native-paper';

import { CollectionDropdown } from '../../components/collection-dropdown';
import { ItemCard } from '../../components/item-card';
import { OrderFooter } from '../../components/order-footer';

interface Item {
    id: number;
    price: number;
    status: string;
}

interface Collection {
    name: string;
    status: string;
    items: Item[];
}



export default function CreateOrderScreen() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCollections = async () => {
        try {
            const res = await api.get('/collections');
            const dataArray = Array.isArray(res.data) ? res.data : res.data.data || [];

            console.log("--- DEBUG START ---");
            dataArray.forEach((c: any, index: number) => {
                console.log(`Collection ${index} [${c.name}]:`);
                console.log(`  - Status: "${c.status}"`);
                console.log(`  - Items Count: ${c.items?.length || 0}`);
                if (c.items && c.items.length > 0) {
                    console.log(`  - Sample Item Status: "${c.items[0].status}"`);
                }
            });
            console.log("--- DEBUG END ---");

            // More permissive filtering for testing
            const activeCollections: Collection[] = dataArray
                .filter((c: any) => {
                    const isActive = c.status?.toLowerCase() === "active";
                    // If you want to see collections even if items are empty for now:
                    return isActive;
                })
                .map((c: any) => ({
                    ...c,
                    // Make the item filter more lenient
                    items: (c.items || []).filter((i: any) =>
                        !i.status || i.status.toLowerCase() === "available"
                    )
                }));

            setCollections(activeCollections);
            if (activeCollections.length > 0) {
                setSelectedCollection(activeCollections[0]);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchCollections(); }, []);

    useEffect(() => {
        if (selectedCollection) {
            setItems(selectedCollection.items || []);
        }
    }, [selectedCollection]);

    const subtotal = useMemo(() => {
        return selectedItems.reduce((acc, item) => acc + Number(item.price), 0);
    }, [selectedItems]);

    const handleItemToggle = (item: Item) => {
        const isSelected = selectedItems.find(i => i.id === item.id);
        if (isSelected) {
            setSelectedItems(prev => prev.filter(i => i.id !== item.id));
        } else {
            setSelectedItems(prev => [...prev, item]);
        }
    };

    const handlePlaceOrder = () => {
        router.push({
            pathname: '/screens/confirm-order',
            params: { items: JSON.stringify(selectedItems) }
        });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color="#8B5E34" size="large" />
            </View>
        );
    }

    return (
        <Provider>
            <View style={styles.container}>
                <CollectionDropdown
                    collections={collections}
                    selected={selectedCollection}
                    onSelect={(collection: Collection) => setSelectedCollection(collection)}
                />

                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={3}
                    columnWrapperStyle={styles.columnWrapper}
                    renderItem={({ item }) => (
                        <ItemCard
                            item={item}
                            isSelected={selectedItems.some(i => i.id === item.id)}
                            isSelectionMode={true}
                            onPress={() => handleItemToggle(item)}
                            onLongPress={() => { }}
                        />
                    )}
                    contentContainerStyle={styles.gridContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No items available.</Text>
                    }
                />

                <OrderFooter
                    subtotal={subtotal}
                    count={selectedItems.length}
                    onPress={handlePlaceOrder}
                />
            </View>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    gridContent: {
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 100,
    },

    columnWrapper: {
        justifyContent: 'flex-start',
        gap: 10,
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
    },
});