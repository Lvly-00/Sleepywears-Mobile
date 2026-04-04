import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from 'react-native-paper';

const fixImageUrl = (url?: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith('items/') || !url.includes('.')) {
        return `https://res.cloudinary.com/dz0q8u0ia/image/upload/f_auto,q_auto/${url}`;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://res.cloudinary.com/dz0q8u0ia/image/upload/f_auto,q_auto/${url.replace(/^public\//, '')}`;
};



const OrderItem = React.memo(({ item, onLongPress, onPress }: any) => {
    const isPaid = item.payment_status === "Paid" || item.payment?.payment_status === "Paid";

     const lastOrderItem = item.items && item.items.length > 0
        ? item.items[item.items.length - 1]
        : null;


    const displayImageUrl = fixImageUrl(item.last_item_image);


    return (
        <TouchableOpacity
            style={styles.card}
            onLongPress={() => onLongPress(item)}
            onPress={() => onPress(item)}
        >
             <Image
                source={displayImageUrl ? { uri: displayImageUrl } : { uri: 'https://via.placeholder.com/100' }}
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
        borderRadius: 4,
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
        fontWeight: '700',
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