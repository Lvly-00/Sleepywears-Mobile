import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import FabScreenWrapper from '../../components/ui/FabScreenWrapper';
import SwipeableCard from '../../components/ui/SwipeableCard';
import api from '../../services/api';

export default function InventoryScreen() {
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const sortCollections = (list: any[]) => {
        const order: any = { Active: 0, 'Sold Out': 1 };
        return [...list].sort((a, b) => order[a.status] - order[b.status]);
    };

    const fetchCollections = async () => {
        try {
            const res = await api.get('/collections');
            console.log('API Response:', res.data);
            const data = Array.isArray(res.data?.data) ? res.data.data : [];
            setCollections(sortCollections(data));
        } catch (err) {
            console.error('Fetch error:', err);
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

    const handleEditPress = (item: any) => {
        router.push({
            pathname: '/screens/edit-collection',
            params: { collectionId: item.id },
        });
    };

    const handleDeletePress = async (id: number) => {
        try {
            await api.delete(`/collections/${id}`);
            setCollections((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleCardPress = (item: any) => {
        router.push({
            pathname: '/screens/items',
            params: { collectionId: item.id },
        });
    };

    const renderItem = ({ item }: { item: any }) => (
        <SwipeableCard
            item={item}
            onPress={() => handleCardPress(item)}
            onEdit={() => handleEditPress(item)}
            onDelete={() => handleDeletePress(item.id)}
        />
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
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListEmptyComponent={<Text style={styles.emptyText}>No collections found.</Text>}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                )}
            </View>
        </FabScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1 },
    emptyText: { textAlign: 'center', marginTop: 50, fontFamily: 'LeagueSpartan', color: '#7A7A7A', fontSize: 18 },
});
