import SuccessModal from '@/src/components/success-modal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Surface } from 'react-native-paper';
import ViewShot, { captureRef } from 'react-native-view-shot';

interface NormalizedInvoice {
    display_name: string;
    address: string;
    contact_number: string;
    social_handle: string;
    items: any[];
    total: number;
    payment_method: string;
    payment_status: string;
    payment_date: string;
}

export default function InvoiceScreen() {
    const { orderData } = useLocalSearchParams();
    const router = useRouter();
    const navigation = useNavigation();

    const [invoice, setInvoice] = useState<NormalizedInvoice | null>(null);
    const [loading, setLoading] = useState(true);
    const viewShotRef = useRef<any>(null);
    const [modalState, setModalState] = useState({
        visible: false,
        loading: false,
        message: ""
    });


    const handleDownload = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Enable storage access to save.");
                return;
            }
            setModalState({ visible: true, loading: true, message: "Saving Invoice..." });

            const uri = await captureRef(viewShotRef, { format: 'png', quality: 1.0 });
            await MediaLibrary.saveToLibraryAsync(uri);

            // 4. Show success message
            setModalState({ visible: true, loading: false, message: "Invoice Saved to Gallery!" });
            setTimeout(() => {
                setModalState(prev => ({ ...prev, visible: false }));
            }, 2000);
        } catch (error) {
            setModalState({ visible: false, loading: false, message: "" });
        }
    };

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.replace('/(tabs)/orders')} style={{ marginLeft: 15 }}>
                    <MaterialCommunityIcons name="close" size={28} color="white" />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={handleDownload} style={{ marginRight: 15 }}>
                    <MaterialCommunityIcons name="download" size={28} color="white" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, invoice]);

    useEffect(() => {
        if (orderData) {
            try {
                const data = JSON.parse(orderData as string);

                // --- LOGS FOR DEBUGGING ---
                console.log("RAW INVOICE DATA:", data);
                console.log("NAME CHECK:", data.first_name, data.last_name);
                console.log("CONTACT CHECK:", data.contact_number);
                console.log("PAYMENT STATUS:", data.payment_status);

                const rawItems = Array.isArray(data.items) ? data.items : [];

                setInvoice({
                    display_name: data.customer_full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || "Customer Name",
                    items: rawItems,
                    address: data.address || "Street, Barangay, City...",
                    contact_number: data.contact_number || "09XXXXXXXXX",
                    social_handle: data.social_handle || "username",
                    total: Number(data.total) || 0,
                    payment_method: data.payment?.payment_method || "Cash",
                    payment_status: data.payment_status || "Unpaid",
                    payment_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                });
            } catch (err) {
                console.error("Failed to parse order data", err);
            } finally {
                setLoading(false);
            }
        }
    }, [orderData]);

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#AB8262" /></View>;
    if (!invoice) return <View style={styles.centered}><Text>Order data error.</Text></View>;

    const isPaid = invoice.payment_status?.toLowerCase() === 'paid';

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1.0 }} style={styles.captureContainer}>
                    <Surface style={styles.invoiceCard} elevation={0}>

                        <View style={styles.logoSection}>
                            <Image source={require('../../../assets/images/brown-logo.png')} style={styles.logo} resizeMode="contain" />
                        </View>

                        <View style={styles.horizontalDivider} />

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Billed to :</Text>
                            <InfoRow label="Customer Name" value={invoice.display_name} />
                            <InfoRow label="Address" value={invoice.address} />
                            <InfoRow label="Contact Number" value={invoice.contact_number} />
                            <InfoRow label="Social Media Account" value={invoice.social_handle} />
                        </View>

                        <View style={styles.horizontalDivider} />

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Clothes :</Text>
                            {invoice.items.map((item, idx) => (
                                <View key={idx} style={styles.itemStrip}>
                                    <Text style={styles.itemCode}>{item.item?.code || "1202"}</Text>
                                    <Text style={styles.itemName}>{item.item_name || item.item?.name}</Text>
                                    <Text style={styles.itemPrice}>₱{Math.round(Number(item.price))}</Text>
                                </View>
                            ))}
                            <View style={styles.totalContainer}>
                                <Text style={styles.totalLabel}>TOTAL :</Text>
                                <Text style={styles.totalValue}>₱{invoice.total.toLocaleString()}</Text>
                            </View>
                        </View>

                        <View style={styles.horizontalDivider} />

                        {/* CONDITIONAL PAYMENT SECTION */}
                        <View style={styles.section}>
                            {isPaid ? (
                                <>
                                    <Text style={styles.sectionTitle}>Payment :</Text>
                                    <InfoRow label="Mode of Payment" value={invoice.payment_method} />
                                    <InfoRow label="Payment Status" value="Paid" />
                                    <InfoRow label="Payment Date" value={invoice.payment_date} />
                                </>
                            ) : (
                                <>
                                    <Text style={styles.sectionTitle}>Payment & Shipping Details :</Text>
                                    <InfoRow label="Gcash Number" value="09457409766 - Alyanna Angeles" />
                                    <InfoRow label="Shopee Checkout" value="https://ph.shp.ee/V6guXb" />
                                </>
                            )}
                        </View>

                    </Surface>
                </ViewShot>
            </ScrollView>
            <SuccessModal
                visible={modalState.visible}
                isLoading={modalState.loading}
                message={modalState.message}
            />
        </View>
    );
}

const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label} :</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollContent: {
        padding: 20,
    },

    captureContainer: {
        backgroundColor: '#F9F9F9',
        borderRadius: 25,
    },

    invoiceCard: {
        backgroundColor: '#FFF',
        borderRadius: 25,
        padding: 25,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },

    logoSection: {
        alignItems: 'center',
        marginBottom: 5,
    },

    logo: {
        width: 180,
        height: 80,
    },

    horizontalDivider: {
        height: 1.5,
        backgroundColor: '#E8DCD0',
        marginVertical: 15,
    },

    section: {
        marginBottom: 10,
    },

    sectionTitle: {
        fontSize: 17,
        color: '#AB8262',
        fontWeight: '700',
        marginBottom: 12,
    },

    infoRow: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'flex-start',
    },

    infoLabel: {
        width: 160,
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
    },

    infoValue: {
        flex: 1,
        fontSize: 13,
        color: '#444',
        lineHeight: 18,
    },

    itemStrip: {
        flexDirection: 'row',
        backgroundColor: '#FCF9F5',
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 5,
        alignItems: 'center',
    },

    itemCode: {
        flex: 1,
        fontSize: 13,
        color: '#333',
    },

    itemName: {
        flex: 2,
        fontSize: 13,
        color: '#333',
        textAlign: 'center',
    },

    itemPrice: {
        flex: 1,
        fontSize: 13,
        color: '#333',
        textAlign: 'right',
    },

    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        paddingHorizontal: 15,
    },

    totalLabel: {
        fontSize: 20,
        color: '#AB8262',
        fontWeight: '800',
    },

    totalValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#000',
    },
});