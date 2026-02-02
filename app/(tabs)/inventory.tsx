import FabScreenWrapper from '@/components/ui/FabScreenWrapper';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function InventoryScreen() {

    const handleAddInventory = () => {
        console.log('New Collection Button Pressed');
        router.push('/create-collection');
    };

    return (
        <FabScreenWrapper
            fabLabel="New Collection"
            fabIcon="layers-plus"
            onFabPress={handleAddInventory}
            fabBackgroundColor="#1C4D8D" // This will override the dark blue
            fabTextColor="#ffffff"
        >
            {/* Content of your Inventory Screen */}
            <View style={styles.container}>
                <Text style={styles.heading}>Collection</Text>

                {/* Placeholder for a list of inventory items */}
                {[...Array(15)].map((_, i) => (
                    <View key={i} style={styles.orderItem}>
                        <Text style={styles.orderText}>Collection #{i + 1}</Text>
                        <Text style={styles.orderStatus}>In Stock</Text>
                    </View>
                ))}
            </View>
        </FabScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    heading: {
        fontSize: 28,
        fontFamily: 'LeagueSpartan-Bold',
        marginBottom: 20,
        color: '#0A0B32',
    },
    orderItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        // Slight shadow for a "Paper" feel
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    orderText: {
        fontFamily: 'LeagueSpartan',
        fontSize: 18,
    },
    orderStatus: {
        fontFamily: 'LeagueSpartan',
        color: 'orange',
        fontWeight: '600',
    },
});