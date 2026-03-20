import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Divider, IconButton, Surface } from 'react-native-paper';
import ViewShot, { captureRef } from 'react-native-view-shot';

// Use a PNG version of your logo if SVG gives issues with ViewShot capture
import BrownLogo from '../../../assets/images/BrownLogo.svg';

interface NormalizedInvoice {
    display_name: string;
    address: string;
    contact_number: string;
    social_handle: string;
    items: any[];
    total: number;
    payment?: any;
}

export default function InvoiceScreen() {
    const { orderData } = useLocalSearchParams();
    const [invoice, setInvoice] = useState<NormalizedInvoice | null>(null);
    const [loading, setLoading] = useState(true);
    const viewShotRef = useRef<any>(null);

    useEffect(() => {
        if (orderData) {
            try {
                const data = JSON.parse(orderData as string);
                const items = Array.isArray(data.items) ? data.items : 
                             Array.isArray(data.orders) ? data.orders.flatMap((o: any) => o.items) : [];

                const display_name = data.customer_name || 
                                   [data.first_name, data.last_name].filter(Boolean).join(" ") || 
                                   "Customer";

                setInvoice({
                    display_name,
                    items,
                    address: data.address || "Not provided",
                    contact_number: data.contact_number || "Not provided",
                    social_handle: data.social_handle || "Not provided",
                    payment: data.payment || {},
                    total: Number(data.total) || 0,
                });
            } catch (err) {
                console.error("Failed to parse order data", err);
            } finally {
                setLoading(false);
            }
        }
    }, [orderData]);

    const handleShare = async () => {
        if (!invoice) return;
        const message = `Order for ${invoice.display_name}\nTotal: ₱${invoice.total.toLocaleString()}`;
        await Share.share({ message });
    };

    const handleDownload = async () => {
        try {
            // 1. Request Permissions
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "We need access to your gallery to save the invoice.");
                return;
            }

            // 2. Capture the View
            const uri = await captureRef(viewShotRef, {
                format: 'png',
                quality: 1,
            });

            // 3. Save to Gallery
            await MediaLibrary.saveToLibraryAsync(uri);
            Alert.alert("Success", "Invoice saved to your gallery!");
        } catch (error) {
            console.error("Download error:", error);
            Alert.alert("Error", "Failed to download invoice.");
        }
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#AB8262" /></View>;
    if (!invoice) return <View style={styles.centered}><Text>Order not found.</Text></View>;

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <IconButton icon="close" iconColor="#AB8262" onPress={() => router.replace('/(tabs)/orders')} />
                <Text style={styles.headerTitle}>Invoice</Text>
                <View style={styles.headerActions}>
                    <IconButton icon="download" iconColor="#AB8262" onPress={handleDownload} />
                    <IconButton icon="share-variant" iconColor="#AB8262" onPress={handleShare} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* ViewShot wraps the part you want to download */}
                <ViewShot 
                    ref={viewShotRef} 
                    options={{ format: "png", quality: 1.0 }}
                    style={{ backgroundColor: '#F1F0ED' }} // Ensure background is captured
                >
                    <Surface style={styles.invoiceCard} elevation={0}>
                        {/* Logo Section */}
                        <View style={styles.logoContainer}>
                            <Image source={BrownLogo} style={styles.logo} resizeMode="contain" />
                        </View>

                        <Divider style={styles.divider} />

                        {/* Billed To Section */}
                        <Text style={styles.sectionHeading}>Billed To:</Text>
                        <View style={styles.infoGrid}>
                            <InfoRow label="Customer Name" value={invoice.display_name} />
                            <InfoRow label="Address" value={invoice.address} />
                            <InfoRow label="Contact No" value={invoice.contact_number} />
                            <InfoRow label="Social Media" value={invoice.social_handle} />
                        </View>

                        <Divider style={styles.divider} />

                        {/* Clothes Section */}
                        <Text style={styles.sectionHeading}>Clothes:</Text>
                        {invoice.items.map((item, idx) => (
                            <View key={idx} style={styles.itemRow}>
                                <Text style={styles.itemCode}>{item.item?.code || item.code || "-"}</Text>
                                <Text style={styles.itemName}>{item.item_name || item.name}</Text>
                                <Text style={styles.itemPrice}>₱{Math.round(Number(item.price)).toLocaleString()}</Text>
                            </View>
                        ))}

                        {/* Total Row */}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TOTAL :</Text>
                            <Text style={styles.totalAmount}>₱{invoice.total.toLocaleString()}</Text>
                        </View>

                        <Divider style={styles.divider} />

                        {/* Payment Details */}
                        <Text style={styles.sectionHeading}>Payment Details:</Text>
                        <View style={styles.infoGrid}>
                            {invoice.payment?.payment_status?.toLowerCase() === "paid" ? (
                                <>
                                    <InfoRow label="Method" value={invoice.payment.payment_method} />
                                    <InfoRow label="Status" value="PAID" />
                                </>
                            ) : (
                                <>
                                    <InfoRow label="Gcash" value="09457409766 (Alyanna Angeles)" />
                                    <InfoRow label="Shopee" value="ph.shp.ee/V6guXb" />
                                </>
                            )}
                        </View>
                    </Surface>
                </ViewShot>
            </ScrollView>
        </View>
    );
}

const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F0ED' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingTop: 50, 
        paddingHorizontal: 10, 
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#AB8262' },
    headerActions: { flexDirection: 'row' },
    scrollContent: { padding: 15, paddingBottom: 50 },
    invoiceCard: { 
        backgroundColor: '#FFF', 
        borderRadius: 20, 
        padding: 20,
        // Added border for the capture to look cleaner
        borderWidth: 1,
        borderColor: '#EEE'
    },
    logoContainer: { alignItems: 'center', marginBottom: 10 },
    logo: { width: 200, height: 60 },
    divider: { marginVertical: 15, backgroundColor: '#C1A287' },
    sectionHeading: { fontSize: 18, color: '#AB8262', fontWeight: '600', marginBottom: 10 },
    infoGrid: { paddingLeft: 5 },
    infoRow: { flexDirection: 'row', marginBottom: 5 },
    infoLabel: { width: 110, fontWeight: '600', color: '#555', fontSize: 13 },
    infoValue: { flex: 1, color: '#333', fontSize: 13 },
    itemRow: { 
        backgroundColor: '#FAF8F3', 
        flexDirection: 'row', 
        borderRadius: 10, 
        padding: 12, 
        marginBottom: 8, 
        alignItems: 'center' 
    },
    itemCode: { flex: 1, fontSize: 12, color: '#666' },
    itemName: { flex: 2, fontSize: 14, fontWeight: '500' },
    itemPrice: { flex: 1, textAlign: 'right', fontWeight: 'bold' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingHorizontal: 10 },
    totalLabel: { fontSize: 22, color: '#9B521C', fontWeight: '700' },
    totalAmount: { fontSize: 22, fontWeight: '700' },
});