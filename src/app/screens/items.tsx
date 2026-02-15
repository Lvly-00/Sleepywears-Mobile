import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import FabScreenWrapper from '../../components/ui/fab-screen-wrapper';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2; // 2 columns with padding

// -------------------- Types --------------------
interface Item {
    id: string | number;
    name: string;
    price: string | number;
    status: string;
    created_at: string;
    updated_at: string;
    image?: string;
    image_url?: string | null;
    item_code?: string;
    code?: string;
}

interface Collection {
    id: string | number;
    name: string;
}

// -------------------- Helpers --------------------
const sortItemsRealtime = (itemsList: Item[]): Item[] => {
    const statusOrder = (status: string) => {
        switch (status) {
            case 'Available':
                return 1;
            case 'Sold Out':
                return 2;
            default:
                return 3;
        }
    };

    return [...itemsList].sort((a, b) => {
        const aStatus = statusOrder(a.status);
        const bStatus = statusOrder(b.status);
        if (aStatus !== bStatus) return aStatus - bStatus;
        if (aStatus === 1 && bStatus === 1)
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    });
};

const fixImageUrl = (url?: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith('items/') || !url.includes('.')) {
        return `https://res.cloudinary.com/dz0q8u0ia/image/upload/f_auto,q_auto/${url}`;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Fallback for local storage
    return `https://your-api-domain.com/storage/${url.replace(/^public\//, '')}`;
};

// -------------------- Component --------------------
export default function ItemsScreen() {
    const { collectionId } = useLocalSearchParams<{ collectionId: string }>();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [collectionName, setCollectionName] = useState('Items');

    // -------------------- Fetch Logic --------------------
    const fetchCollectionDetails = async () => {
        if (!collectionId) return;
        try {
            const res = await api.get('/collections');
            // Handle both { data: [...] } and direct array responses
            const data: Collection[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            const current = data.find((c) => String(c.id) === String(collectionId));
            if (current) setCollectionName(current.name);
        } catch (err) {
            console.error('Error fetching collection:', err);
        }
    };

    const fetchItems = async () => {
        if (!collectionId) return;
        try {
            setLoading(true);
            const res = await api.get<Item[]>('/items', { params: { collection_id: collectionId } });
            const normalized = res.data.map((item) => ({
                ...item,
                image_url: fixImageUrl(item.image || item.image_url),
            }));
            setItems(sortItemsRealtime(normalized));
        } catch (err) {
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };

    // -------------------- Reload on Focus --------------------
    // This hook ensures that when you return from "Add Item" or "Edit Item", 
    // the list refreshes automatically.
    useFocusEffect(
        useCallback(() => {
            if (collectionId) {
                fetchCollectionDetails();
                fetchItems();
            }
        }, [collectionId])
    );

    // -------------------- Delete Item --------------------
    const handleDelete = (item: Item) => {
        Alert.alert('Delete Item', `Are you sure you want to delete ${item.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/items/${item.id}`);
                        setItems((prev) => prev.filter((i) => i.id !== item.id));
                    } catch (err) {
                        console.error('Error deleting item:', err);
                        Alert.alert('Error', 'Failed to delete item.');
                    }
                },
            },
        ]);
    };

    // -------------------- Render Item --------------------
    const renderItem = ({ item }: { item: Item }) => {
        const isSold = item.status !== 'Available';

        return (
            <View style={[styles.card, { opacity: isSold ? 0.85 : 1 }]}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
                        style={[styles.image, isSold && { tintColor: 'rgba(0,0,0,0.1)' }]}
                    />
                    {isSold && (
                        <View style={styles.soldOverlay}>
                            <View style={styles.soldStamp}>
                                <Text style={styles.soldText}>SOLD</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.itemCode} numberOfLines={1}>
                        {item.item_code || item.code} | <Text style={styles.itemName}>{item.name}</Text>
                    </Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceText}>₱{Number(item.price).toLocaleString()}</Text>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                onPress={() =>
                                    router.replace({
                                        pathname: '/screens/edit-item',
                                        params: { item: JSON.stringify(item), collectionId, },
                                    })
                                }
                                style={styles.iconBtn}
                            >
                                <MaterialCommunityIcons name="pencil" size={18} color="#276D58" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
                                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#B80000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    // -------------------- Main Render --------------------
    return (
        <FabScreenWrapper
            fabLabel="Add Item"
            fabIcon="plus"
            onFabPress={() =>
                router.push({ pathname: '/screens/create-item', params: { collectionId } })
            }
            fabBackgroundColor="#1C4D8D"
            fabTextColor="#ffffff"
        >
            <View style={styles.container}>
                <Text style={styles.heading}>{collectionName}</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#A6976B" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No items found for this collection.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </FabScreenWrapper>
    );
}

// -------------------- Styles --------------------
const styles = StyleSheet.create({
    container: { paddingHorizontal: 15, paddingTop: 20, flex: 1 },
    heading: {
        fontSize: 24,
        fontFamily: 'LeagueSpartan-Bold',
        marginBottom: 20,
        color: '#0A0B32'
    },
    row: { justifyContent: 'space-between' },
    card: {
        backgroundColor: '#fff',
        width: COLUMN_WIDTH,
        borderRadius: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eee',
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1080 / 1350,
        backgroundColor: '#f5f5f5'
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    infoContainer: { padding: 10, alignItems: 'center' },
    itemCode: {
        fontFamily: 'LeagueSpartan-Bold',
        fontSize: 13,
        textAlign: 'center',
        color: '#333'
    },
    itemName: {
        fontFamily: 'LeagueSpartan',
        fontWeight: '400'
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        width: '100%'
    },
    priceText: {
        fontFamily: 'LeagueSpartan-Bold',
        color: '#A6976B',
        fontSize: 16
    },
    actionButtons: {
        flexDirection: 'row',
        position: 'absolute',
        right: -5
    },
    iconBtn: { padding: 5 },
    soldOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(250, 248, 243, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    soldStamp: {
        borderWidth: 3,
        borderColor: '#B80000',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        transform: [{ rotate: '-15deg' }]
    },
    soldText: {
        color: '#B80000',
        fontWeight: '900',
        fontSize: 18
    },
    emptyContainer: {
        marginTop: 50,
        alignItems: 'center'
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16
    },
});