import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import CollectionForm from "../../components/collection-form";
import api from "../../services/api";

export default function EditCollectionScreen() {
    const { collectionId } = useLocalSearchParams<{ collectionId: string }>();

    const [collectionData, setCollectionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!collectionId) return;

        (async () => {
            try {
                const res = await api.get(`/collections/${collectionId}`);
                console.log('EditCollection API response:', res.data);
                setCollectionData(res.data);
            } catch (err) {
                console.error("Fetch collection failed:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [collectionId]);

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} color="#0A0B32" />;
    if (!collectionData) return null;

    return (
        <View style={styles.container}>
            <CollectionForm mode="edit" initialData={collectionData} />
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
