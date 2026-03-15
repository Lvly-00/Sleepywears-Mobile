import api from '@/src/services/api';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Button, Divider, Surface } from 'react-native-paper';

interface OrderItem {
    id: number | string;
    code?: string;
    item_code?: string;
    name: string;
    price: string | number;
}

interface CustomerForm {
    first_name: string;
    last_name: string;
    address: string;
    contact_number: string;
    social_handle: string;
}

interface Customer extends CustomerForm {
    id: number;
}

export default function ConfirmOrderScreen() {
    const params = useLocalSearchParams();

    const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
        return params.items ? JSON.parse(params.items as string) : [];
    });

    const [form, setForm] = useState<CustomerForm>({
        first_name: "",
        last_name: "",
        address: "",
        contact_number: "",
        social_handle: "",
    });

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof CustomerForm, string>>>({});
    const [customerSearch, setCustomerSearch] = useState("");
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const total = orderItems.reduce((sum, item) => sum + parseFloat(item.price.toString()), 0);

    useEffect(() => {
        const fetchCustomers = async () => {
            if (customerSearch.length < 2) return;
            setLoadingCustomers(true);
            try {
                const res = await api.get("/customers", {
                    params: { search: customerSearch, per_page: 10 },
                });
                const data = res.data.data || res.data;
                setCustomers(Array.isArray(data) ? data : []);
                setShowSuggestions(true);
            } catch (err) {
                console.error("Error fetching customers:", err);
            } finally {
                setLoadingCustomers(false);
            }
        };
        const delayDebounceFn = setTimeout(() => fetchCustomers(), 500);
        return () => clearTimeout(delayDebounceFn);
    }, [customerSearch]);

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer.id);
        setForm({
            first_name: customer.first_name,
            last_name: customer.last_name,
            address: customer.address,
            contact_number: customer.contact_number,
            social_handle: customer.social_handle,
        });
        setCustomerSearch(`${customer.first_name} ${customer.last_name}`);
        setShowSuggestions(false);
    };

    const handlePlaceOrder = async () => {
        if (isSubmitting) return;

        const newErrors: Partial<Record<keyof CustomerForm, string>> = {};
        (Object.keys(form) as Array<keyof CustomerForm>).forEach(field => {
            if (!form[field]) newErrors[field] = "Required";
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            let customerId = selectedCustomer;
            if (selectedCustomer) {
                await api.put(`/customers/${selectedCustomer}`, form);
            } else {
                const res = await api.post("/customers", form);
                customerId = res.data.id;
            }

            const payload = {
                customer: { id: customerId, ...form },
                items: orderItems.map(item => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: item.price,
                    quantity: 1,
                })),
            };

            const response = await api.post("/orders", payload);

            if (response.status === 200 || response.status === 201) {
                // Navigate to Invoice and pass the order data
                router.replace({
                    pathname: '/screens/invoice',
                    params: { orderData: JSON.stringify(response.data) }
                });
            }
        } catch (err) {
            Alert.alert("Error", "Failed to place order.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Same UI structure as before, just ensuring types are correct */}
                <Surface style={styles.card} elevation={1}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.title}>Order Summary</Text>
                        <Button mode="text" textColor="#AB8262" onPress={() => router.back()}>Edit</Button>
                    </View>
                    <Divider />
                    {orderItems.map((item) => (
                        <View key={item.id} style={styles.orderRow}>
                            <Text style={styles.itemName}>{item.code || item.item_code || 'N/A'} - {item.name}</Text>
                            <Text style={styles.itemPrice}>₱{Number(item.price).toLocaleString()}</Text>
                        </View>
                    ))}
                    <Divider style={{ marginVertical: 10 }} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalAmount}>₱{total.toFixed(2)}</Text>
                    </View>
                </Surface>

                <Text style={styles.sectionTitle}>Customer Information</Text>
                
                <View style={{ zIndex: 10 }}>
                    <TextInput
                        style={styles.input}
                        placeholder="Search Existing Customer..."
                        value={customerSearch}
                        onChangeText={setCustomerSearch}
                    />
                    {showSuggestions && customers.length > 0 && (
                        <Surface style={styles.suggestions} elevation={4}>
                            {customers.map(c => (
                                <TouchableOpacity key={c.id} onPress={() => handleCustomerSelect(c)} style={styles.suggestionItem}>
                                    <Text>{c.first_name} {c.last_name}</Text>
                                </TouchableOpacity>
                            ))}
                        </Surface>
                    )}
                </View>

                {/* Individual fields */}
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.fieldLabel}>First Name</Text>
                        <TextInput style={[styles.input, errors.first_name && styles.inputError]} value={form.first_name} onChangeText={(val) => setForm({ ...form, first_name: val })} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.fieldLabel}>Last Name</Text>
                        <TextInput style={[styles.input, errors.last_name && styles.inputError]} value={form.last_name} onChangeText={(val) => setForm({ ...form, last_name: val })} />
                    </View>
                </View>
                
                <Text style={styles.fieldLabel}>Address</Text>
                <TextInput style={[styles.input, errors.address && styles.inputError]} value={form.address} onChangeText={(val) => setForm({ ...form, address: val })} />

                <Text style={styles.fieldLabel}>Contact Number</Text>
                <TextInput style={[styles.input, errors.contact_number && styles.inputError]} value={form.contact_number} keyboardType="phone-pad" onChangeText={(val) => setForm({ ...form, contact_number: val })} />

                <Text style={styles.fieldLabel}>Social Media Link</Text>
                <TextInput style={[styles.input, errors.social_handle && styles.inputError]} value={form.social_handle} autoCapitalize="none" onChangeText={(val) => setForm({ ...form, social_handle: val })} />

                <View style={styles.buttonContainer}>
                    <Button mode="outlined" onPress={() => router.replace('/screens/invoice')} style={styles.cancelBtn} textColor="#9E2626">Cancel</Button>
                    <Button mode="contained" onPress={handlePlaceOrder} style={styles.generateBtn} loading={isSubmitting}>Place Order</Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F0ED', padding: 20, paddingTop: 60 },
    card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 25 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#0D0F66' },
    orderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, backgroundColor: '#FAF8F3', marginVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
    itemName: { fontSize: 14, color: '#333', flex: 1 },
    itemPrice: { fontSize: 14, fontWeight: '600' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 20, fontWeight: '700' },
    totalAmount: { fontSize: 20, fontWeight: '700', color: '#AB8262' },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#0D0F66', marginBottom: 15 },
    fieldLabel: { fontSize: 14, color: '#666', marginBottom: 5, marginTop: 10 },
    input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16 },
    inputError: { borderColor: '#9E2626' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    suggestions: { backgroundColor: '#FFF', position: 'absolute', top: 55, left: 0, right: 0, zIndex: 100, borderRadius: 8 },
    suggestionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    buttonContainer: { flexDirection: 'row', marginTop: 30, gap: 10 },
    cancelBtn: { flex: 1, borderColor: '#9E2626' },
    generateBtn: { flex: 1, backgroundColor: '#AB8262' },
});