import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from 'react-native-paper';

const OrderItem = React.memo(({ item, onLongPress, onPress }: any) => {
    const isPaid = item.payment?.payment_status === "Paid";
    return (
        <TouchableOpacity
            style={styles.card}
            onLongPress={() => onLongPress(item)}
            onPress={() => onPress(item)}
        >
            <Image
                source={{ uri: item.payment_image_url || 'https://via.placeholder.com/100' }}
                style={styles.productImage}
            />
            <View style={styles.detailsContainer}>
                <Text style={styles.customerName}>{item.first_name} {item.last_name}</Text>
                <Text style={styles.subDetail}>Qty: {item.items_count || 1}</Text>
                <Text style={styles.subDetail}>Order ID: {item.formatted_id}</Text>
            </View>
            <View style={styles.rightSection}>
                <Text style={styles.priceText}>₱{Math.round(item.total).toLocaleString()}</Text>
                <Badge style={[styles.statusBadge, { backgroundColor: isPaid ? "#68A67D" : "#8E8E8E" }]}>
                    {isPaid ? "PAID" : "UNPAID"}
                </Badge>
            </View>
        </TouchableOpacity>
    );
});
const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: '#FFF',
    },

    productImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },

    detailsContainer: {
        flex: 1,
        marginLeft: 15,
    },

    customerName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },

    subDetail: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },

    rightSection: {
        alignItems: 'flex-end',
    },

    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },

    statusBadge: {
        borderRadius: 5,
        width: 65,
        color: 'white',
        fontWeight: 'bold',
        textAlignVertical: 'center',
    },
});

export default OrderItem;