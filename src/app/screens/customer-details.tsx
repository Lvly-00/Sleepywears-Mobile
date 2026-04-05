import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CustomerDetailScreen() {
    const { customer } = useLocalSearchParams();
    const router = useRouter();

    const parsedCustomer = React.useMemo(() => {
        try {
            return customer ? JSON.parse(customer as string) : null;
        } catch (e) {
            console.error("Failed to parse customer data", e);
            return null;
        }
    }, [customer]);

    if (!parsedCustomer) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>No customer data found.</Text>
            </View>
        );
    }

    const formatId = (id: any) => {
        return id ? id.toString().padStart(4, '0') : '0000';
    };

    const initials = (
        (parsedCustomer.first_name?.[0] || '') +
        (parsedCustomer.last_name?.[0] || '')
    ).toUpperCase();

    const handleOrderPress = (orderId: any) => {
        router.push({
            pathname: '/(tabs)/orders',
            params: { highlightId: orderId.toString() }
        });
    };

    const InfoBox = ({ label, value, isLink = false }: any) => (
        <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, isLink && styles.link]}>
                {value || 'N/A'}
            </Text>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <Text style={styles.name}>
                    {parsedCustomer.first_name} {parsedCustomer.last_name}
                </Text>
            </View>

            <View style={styles.content}>
                {/* Contact and Social Info */}
                <InfoBox label="contact number" value={parsedCustomer.contact_number} />
                
                {parsedCustomer.social_handle && (
                    <InfoBox label="social media link" value={parsedCustomer.social_handle} isLink />
                )}

                {/* DYNAMIC MULTIPLE ADDRESSES SECTION */}
                {parsedCustomer.addresses && parsedCustomer.addresses.length > 0 ? (
                    parsedCustomer.addresses.map((addr: string, index: number) => (
                        <InfoBox 
                            key={`address-${index}`} 
                            label="address" 
                            value={addr} 
                        />
                    ))
                ) : (
                    // Fallback to the single 'address' field if 'addresses' array is empty
                    <InfoBox label="address" value={parsedCustomer.address} />
                )}

                {/* Orders Section */}
                <View style={styles.ordersCard}>
                    <Text style={styles.ordersTitle}>Orders:</Text>

                    {parsedCustomer.orders && parsedCustomer.orders.length > 0 ? (
                        parsedCustomer.orders.map((order: any) => {
                            const isPaid = order.invoice?.status === 'Paid';

                            return (
                                <TouchableOpacity
                                    key={order.id.toString()}
                                    style={styles.orderItem}
                                    onPress={() => handleOrderPress(order.id)}
                                    activeOpacity={0.6}
                                >
                                    <View>
                                        <Text style={styles.orderId}>
                                            Order #{formatId(order.order_number || order.id)}
                                        </Text>
                                    </View>

                                    <View style={[
                                        styles.badge,
                                        { backgroundColor: isPaid ? '#64A77D' : '#A5A5A5' }
                                    ]}>
                                        <Text style={styles.badgeText}>
                                            {isPaid ? 'PAID' : 'UNPAID'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
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
        width: 140, // Match image size
        height: 140,
        backgroundColor: '#0D0F35',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 80, // Larger font for initials
        fontWeight: 'bold',
    },
    name: {
        fontSize: 28, // Matches the large bold name in your image
        fontWeight: '600',
        color: '#0D0F35',
        marginTop: 15,
    },
    content: {
        paddingHorizontal: 20,
    },
    infoBox: {
        backgroundColor: '#F4F4F4',
        borderRadius: 12, // Slightly more rounded as per image
        padding: 15,
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 13,
        color: '#333',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        color: '#0A0B32',
        lineHeight: 20,
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
        fontSize: 18,
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
        width: 70,
        paddingVertical: 4,
        borderRadius: 8, // More rectangular as per image
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