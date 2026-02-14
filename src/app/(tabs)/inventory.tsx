import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, TouchableRipple } from 'react-native-paper';
import FabScreenWrapper from '../../components/ui/FabScreenWrapper';
import api from "../../services/api";

export default function InventoryScreen() {
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const sortCollections = (list: any[]) => {
        const order: any = { Active: 0, "Sold Out": 1 };
        return [...list].sort((a, b) => order[a.status] - order[b.status]);
    };

    const fetchCollections = async () => {
        try {
            const res = await api.get("/collections");
            const data = Array.isArray(res.data?.data) ? res.data.data : [];
            setCollections(sortCollections(data));
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCollections();
    }, []);

    const handleItemPress = (id: number) => {
        router.push({
            pathname: '/screens/items',
            params: { collectionId: id }
        });
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableRipple
            onPress={() => handleItemPress(item.id)}
            rippleColor="rgba(10, 11, 50, .1)"
            style={styles.orderItem}
        >
            <View style={styles.itemContent}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.orderText}>{item.name || "Unnamed"}</Text>
                    <Text style={styles.subText}>
                        Stock: {Array.isArray(item.items) ? item.items.filter((i: any) => i.status === "Available").length : 0} | 
                        Qty: {item.qty || 0}
                    </Text>
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[
                        styles.orderStatus, 
                        { color: item.status === 'Active' ? '#276D58' : '#7A7A7A' }
                    ]}>
                        {item.status}
                    </Text>
                    <Text style={styles.priceText}>
                        ₱{new Intl.NumberFormat("en-PH").format(Math.floor(item.capital || 0))}
                    </Text>
                </View>
            </View>
        </TouchableRipple>
    );

    return (
        <FabScreenWrapper
            fabLabel="New Collection"
            fabIcon="layers-plus"
            onFabPress={() => router.push('/screens/create-collection')}
            fabBackgroundColor="#AB8262"
            fabTextColor="#ffffff"
        >
            <View style={styles.container}>

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 50 }} color="#0A0B32" />
                ) : (
                    <FlatList
                        data={collections}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No collections found.</Text>
                        }
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                )}
            </View>
        </FabScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1 },
    heading: { fontSize: 28, fontFamily: 'LeagueSpartan-Bold', marginBottom: 20, color: '#0A0B32' },
    orderItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    itemContent: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderText: { fontFamily: 'LeagueSpartan-Bold', fontSize: 18, color: '#0A0B32' },
    subText: { fontFamily: 'LeagueSpartan', fontSize: 14, color: '#666' },
    orderStatus: { fontFamily: 'LeagueSpartan-Bold', fontSize: 14, textTransform: 'uppercase' },
    priceText: { fontFamily: 'LeagueSpartan', fontSize: 14, color: '#AB8262' },
    emptyText: { textAlign: 'center', marginTop: 50, fontFamily: 'LeagueSpartan', color: '#7A7A7A', fontSize: 18 }
});