import FabScreenWrapper from '@/components/ui/FabScreenWrapper';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper'; // 1. Import TouchableRipple

export default function InventoryScreen() {

    const handleAddInventory = () => {
        router.push('/create-collection');
    };

    // 2. Navigation function for clicking an item
    const handleItemPress = (id: number) => {
        console.log(`Navigating to Collection ${id}`);
        // Redirecting and passing the ID as a parameter
        router.push({
            pathname: '/items',
            params: { collectionId: id }
        });
    };

    return (
        <FabScreenWrapper
            fabLabel="New Collection"
            fabIcon="layers-plus"
            onFabPress={handleAddInventory}
            fabBackgroundColor="#1C4D8D"
            fabTextColor="#ffffff"
        >
            <View style={styles.container}>
                <Text style={styles.heading}>Collection</Text>

                {[...Array(15)].map((_, i) => (
                    // 3. Wrap the item in TouchableRipple
                    <TouchableRipple
                        key={i}
                        onPress={() => handleItemPress(i + 1)}
                        rippleColor="rgba(10, 11, 50, .1)" // Custom ripple color
                        style={styles.orderItem}
                    >
                        {/* 4. Keep your content inside a View (no padding on TouchableRipple itself) */}
                        <View style={styles.itemContent}>
                            <Text style={styles.orderText}>Collection #{i + 1}</Text>
                            <Text style={styles.orderStatus}>In Stock</Text>
                        </View>
                    </TouchableRipple>
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
        borderRadius: 12,
        marginBottom: 12,
        // Elevation and shadow must stay on the container
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden', // Required to keep the ripple inside the rounded corners
    },
    itemContent: {
        padding: 16, // Move padding here so the ripple covers the whole area
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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