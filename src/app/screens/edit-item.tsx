import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import ItemForm from '../../components/item-form';

export default function ItemEditScreen() {
    const { item: itemString, collectionId } = useLocalSearchParams<{ item: string; collectionId: string }>();

    if (!itemString) return null;

    const item = JSON.parse(itemString);

    return (
        <>
            <Stack.Screen options={{ title: 'Edit Item' }} />
            <ItemForm 
                mode="edit" 
                initialData={item} 
                collectionId={collectionId!} 
            />
        </>
    );
}