import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import ItemForm from '../../components/item-form';
import api from '../../services/api';

export default function ItemAddScreen() {
    const { collectionId } = useLocalSearchParams<{ collectionId: string }>();
    const [loading, setLoading] = useState(false);

    const handleAdd = async (formData: FormData) => {
        setLoading(true);
        formData.append("collection_id", collectionId!);
        await api.post("/items", formData, { headers: { "Content-Type": "multipart/form-data" } });
        setLoading(false);
        router.back();
    };

    return <ItemForm title="New Item" onSubmit={handleAdd} loading={loading} />;
}