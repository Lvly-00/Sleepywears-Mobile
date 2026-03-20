import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import ItemForm from '../../components/item-form';

export default function ItemAddScreen() {
    const { collectionId } = useLocalSearchParams<{ collectionId: string }>();

    return (
        <>
            <Stack.Screen options={{ title: 'Add Item' }} />
            <ItemForm 
                mode="create" 
                collectionId={collectionId!} 
            />
        </>
    );
}