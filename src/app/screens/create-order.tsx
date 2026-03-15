import api from '@/src/services/api';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Dimensions,
    FlatList,
    Image,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Button, IconButton, Menu, Provider } from 'react-native-paper';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2; // 2 Columns with padding

// ----------------------------------------------------------------------
// HELPER: Image URL Formatter (Ported from Web)
// ----------------------------------------------------------------------
const fixImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("items/") || !url.includes(".")) {
        return `https://res.cloudinary.com/dz0q8u0ia/image/upload/f_auto,q_auto/${url}`;
    }
    if (url.startsWith("http")) return url;
    return `https://your-api-url.com/storage/${url.replace(/^public\//, "")}`;
};

export default function CreateOrderScreen() {
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Collections (Similar to Web logic)
    const fetchCollections = async () => {
        try {
            const res = await api.get('/collections');
            const dataArray = Array.isArray(res.data) ? res.data : res.data.data || [];
            
            const activeCollections = dataArray
                .filter((c) => c.status === "Active")
                .map((c) => ({
                    ...c,
                    items: (c.items || []).filter(i => i.status === "Available")
                }))
                .filter((c) => c.items.length > 0);

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

    // Fetch Items when collection changes
    useEffect(() => {
        if (selectedCollection) {
            setItems(selectedCollection.items || []);
        }
    }, [selectedCollection]);

    const handleItemToggle = (item) => {
        const isSelected = selectedItems.find(i => i.id === item.id);
        if (isSelected) {
            setSelectedItems(prev => prev.filter(i => i.id !== item.id));
        } else {
            setSelectedItems(prev => [...prev, item]);
        }
    };

    const handlePlaceOrder = () => {
        const orderCode = "ORD-" + Math.floor(100000 + Math.random() * 900000);
        router.push({
            pathname: '/screens/confirm-order',
            params: { orderCode, items: JSON.stringify(selectedItems) }
        });
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedItems.some(i => i.id === item.id);
        
        return (
            <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => handleItemToggle(item)}
                style={[
                    styles.card, 
                    isSelected && styles.cardSelected
                ]}
            >
                {/* Image Section (Portrait 4:5 Aspect Ratio) */}
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: fixImageUrl(item.image) }} 
                        style={styles.image}
                        resizeMode="cover"
                    />
                    {isSelected && (
                        <View style={styles.checkmarkOverlay}>
                            <IconButton icon="check-circle" iconColor="#AB8262" size={30} />
                        </View>
                    )}
                </View>

                {/* Info Section */}
                <View style={styles.cardInfo}>
                    <Text numberOfLines={1} style={styles.itemCode}>
                        {item.item_code || item.code} <Text style={{color: '#DDD'}}>|</Text> {item.name}
                    </Text>
                    <Text style={styles.itemPrice}>₱{item.price}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}><ActivityIndicator color="#AB8262" size="large" /></View>
        );
    }

    return (
        <Provider>
            <View style={styles.container}>
                {/* Header / Dropdown Area */}
                <View style={styles.header}>
                    <Text style={styles.label}>Select Collection</Text>
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                            <Button
                                mode="outlined"
                                onPress={() => setMenuVisible(true)}
                                style={styles.dropdown}
                                contentStyle={styles.dropdownContent}
                                labelStyle={styles.dropdownLabel}
                                icon="chevron-down"
                            >
                                {selectedCollection ? selectedCollection.name : 'Choose Collection'}
                            </Button>
                        }
                    >
                        {collections.map((c) => (
                            <Menu.Item 
                                key={c.id} 
                                onPress={() => { setSelectedCollection(c); setMenuVisible(false); }} 
                                title={c.name} 
                            />
                        ))}
                    </Menu>
                </View>

                {/* Items Grid */}
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    renderItem={renderItem}
                    contentContainerStyle={styles.gridContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No available items in this collection.</Text>
                    }
                />

                {/* Floating Place Order Button */}
                {selectedItems.length > 0 && (
                    <Button
                        mode="contained"
                        style={styles.fab}
                        labelStyle={styles.fabLabel}
                        onPress={handlePlaceOrder}
                    >
                        Place Order ({selectedItems.length})
                    </Button>
                )}
            </View>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F0ED' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingTop: 50 },
    label: { 
        fontSize: 12, 
        fontFamily: 'LeagueSpartan', 
        color: '#888', 
        textTransform: 'uppercase', 
        marginBottom: 8,
        letterSpacing: 1
    },
    dropdown: { backgroundColor: '#FFF', borderColor: '#AB8262', borderRadius: 12 },
    dropdownContent: { flexDirection: 'row-reverse', height: 50, justifyContent: 'space-between' },
    dropdownLabel: { color: '#333', fontSize: 16 },
    gridContent: { paddingHorizontal: 10, paddingBottom: 100 },
    
    // Card Styling
    card: {
        backgroundColor: '#FFF',
        width: COLUMN_WIDTH,
        margin: 5,
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEE',
        elevation: 2,
    },
    cardSelected: {
        borderColor: '#AB8262',
        backgroundColor: '#EAE7E2',
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1080 / 1350, // Match Mantine AspectRatio
        backgroundColor: '#f9f9f9',
    },
    image: { width: '100%', height: '100%' },
    checkmarkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardInfo: { padding: 10, alignItems: 'center' },
    itemCode: { 
        fontSize: 13, 
        fontFamily: 'LeagueSpartan-Bold', 
        textTransform: 'uppercase',
        textAlign: 'center'
    },
    itemPrice: { 
        fontSize: 16, 
        color: '#AB8262', 
        fontFamily: 'LeagueSpartan', 
        marginTop: 4 
    },

    // Floating Button
    fab: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#AB8262',
        borderRadius: 15,
        elevation: 8,
    },
    fabLabel: { fontSize: 16, paddingVertical: 8, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});