import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import ItemForm from '../../components/item-form';
import api from '../../services/api';

interface Item {
    id: string | number;
    name: string;
    price: string | number;
    status: string;
    image_url?: string | null;
}

export default function ItemEditScreen() {
    const { item: itemString, collectionId } = useLocalSearchParams<{ item: string; collectionId: string }>();

    if (!itemString) {
        console.warn('No item data found in params');
        return <></>;
    }

    const item: Item = JSON.parse(itemString);
    const [loading, setLoading] = useState(false);

    const handleEdit = async (formData: FormData) => {
        setLoading(true);
        try {
            // Required for PUT with multipart/form-data
            formData.append('_method', 'PUT');

            // Ensure collection_id is included
            if (collectionId) formData.append('collection_id', collectionId);

            // Ensure price is numeric string
            const priceField = formData.get('price');
            if (typeof priceField === 'string') {
                formData.set('price', priceField.replace(/[^0-9.]/g, ''));
            }

            console.log('--- DEBUG: FormData Entries ---');
            for (const pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            const res = await api.post(`/items/${item.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            console.log('Item updated successfully:', res.data);

            // Navigate back to items screen
            if (collectionId) {
                router.replace({ pathname: '/screens/items', params: { collectionId } });
            } else {
                router.back();
            }
        } catch (err: any) {
            if (err.response?.status === 422) {
                console.error('Validation errors:', err.response.data.errors);
            } else {
                console.error('Error updating item:', err);
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <ItemForm
            title="Edit Item"
            initialData={{
                name: item.name,
                price: item.price,
                image_url: item.image_url,
                status: item.status,
            }}
            onSubmit={handleEdit}
            loading={loading}
        />
    );
}
