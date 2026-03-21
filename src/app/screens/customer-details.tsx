import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CustomerDetailScreen() {
    const { customer } = useLocalSearchParams();
    const parsedCustomer = customer ? JSON.parse(customer as string) : null;

    if (!parsedCustomer) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>No customer data found.</Text>
            </View>
        );
    }

    // Helper to format numbers like 1 to 0001
    const formatId = (id: any) => {
        return id ? id.toString().padStart(4, '0') : '0000';
    };

    const initials = (
        (parsedCustomer.first_name?.[0] || '') +
        (parsedCustomer.last_name?.[0] || '')
    ).toUpperCase();

    const InfoBox = ({ label, value, isLink = false }: any) => (
        <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, isLink && styles.link]}>
                {value || 'N/A'}
            </Text>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <Text style={styles.name}>
                    {parsedCustomer.first_name} {parsedCustomer.last_name}
                </Text>
            </View>

            <View style={styles.content}>
                <InfoBox label="mobile number" value={parsedCustomer.contact_number} />
                <InfoBox label="social media link" value={parsedCustomer.social_handle} isLink />
                <InfoBox label="address" value={parsedCustomer.address} />

                <View style={styles.ordersCard}>
                    <Text style={styles.ordersTitle}>Orders:</Text>

                    {parsedCustomer.orders && parsedCustomer.orders.length > 0 ? (
                        parsedCustomer.orders.map((order: any) => {
                            const invoice = order.invoice;

                            // 1. Status Logic
                            const isPaid = invoice?.status === 'Paid';
                            const displayStatus = isPaid ? 'PAID' : 'UNPAID';

                            return (
                                <View key={order.id} style={styles.orderItem}>
                                    <View>
                                        {/* Updated to show only formatted Order # */}
                                        <Text style={styles.orderId}>Order #{formatId(order.order_number || order.id)}</Text>
                                    </View>

                                    <View style={[
                                        styles.badge,
                                        { backgroundColor: isPaid ? '#64A77D' : '#A5A5A5' }
                                    ]}>
                                        <Text style={styles.badgeText}>
                                            {displayStatus}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={styles.noOrdersText}>No orders found.</Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },

    avatar: {
        width: 120,
        height: 120,
        backgroundColor: '#0D0F35',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarText: {
        color: 'white',
        fontSize: 78,
        fontWeight: 'bold',
    },

    name: {
        fontSize: 24,
        fontWeight: '600',
        color: '#0D0F35',
        marginTop: 15,
    },

    content: {
        paddingHorizontal: 20,
    },

    infoBox: {
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },

    infoLabel: {
        fontSize: 12,
        color: '#000000',
        marginBottom: 4,
    },

    infoValue: {
        fontSize: 14,
        color: '#0A0B32',
    },

    link: {
        color: '#007AFF',
    },

    ordersCard: {
        backgroundColor: '#F4F4F4',
        borderRadius: 12,
        padding: 15,
        marginTop: 10,
        marginBottom: 40,
    },

    ordersTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0D0F35',
        marginBottom: 15,
    },

    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#D5D5D9',
    },

    orderId: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },

    badge: {
        width: 65,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },

    noOrdersText: {
        textAlign: 'center',
        color: '#999',
        paddingVertical: 20,
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666',
    },
});