import api from '@/src/services/api'; // Use your api service
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Divider } from 'react-native-paper';
import { OrderCard, SectionHeader, UnderlinedInput } from '../../components/confirm-order-components';

export default function ConfirmOrderScreen() {
    const params = useLocalSearchParams();
    
    // State to track if we are updating an existing customer
    const [customerId, setCustomerId] = useState<number | null>(null);

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        address: "",
        contact_number: "",
        social_handle: ""
    });

    const [orderItems] = useState<any[]>(params.items ? JSON.parse(params.items as string) : []);
    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const total = orderItems.reduce((sum, item) => sum + parseFloat(item.price.toString()), 0);

    // Auto-fill form when a customer is selected from the "View All" screen
    useEffect(() => {
        if (params.selectedCustomer) {
            try {
                const customer = JSON.parse(params.selectedCustomer as string);
                setCustomerId(customer.id); // Store the ID for the PUT request
                setForm({
                    first_name: customer.first_name || "",
                    last_name: customer.last_name || "",
                    address: customer.address || "",
                    contact_number: customer.contact_number || "",
                    social_handle: customer.social_handle || ""
                });
            } catch (e) {
                console.error("Failed to parse customer data", e);
            }
        }
    }, [params.selectedCustomer]);

    const handlePlaceOrder = async () => {
        if (isSubmitting) return;

        // 1. Validation Logic (Ported from Web)
        const newErrors: any = {};
        if (orderItems.length === 0) {
            Alert.alert("Error", "Please add at least one item.");
            return;
        }

        const fields = ["first_name", "last_name", "address", "contact_number", "social_handle"];
        fields.forEach((field) => {
            if (!form[field as keyof typeof form]) {
                newErrors[field] = "This field is required";
            }
        });

        // URL Validation for social handle
        const urlPattern = /^https?:\/\/.+/;
        if (form.social_handle && !urlPattern.test(form.social_handle)) {
            newErrors.social_handle = "Must be a valid URL (http/https)";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            // 2. Customer Logic: Create or Update (Ported from Web)
            let currentCustomerId = customerId;
            const customerPayload = { ...form };

            if (currentCustomerId) {
                // Update existing customer
                await api.put(`/customers/${currentCustomerId}`, customerPayload);
            } else {
                // Create new customer
                const customerRes = await api.post("/customers", customerPayload);
                currentCustomerId = customerRes.data.id;
            }

            // 3. Order Logic (Ported from Web)
            const orderPayload = {
                customer: { id: currentCustomerId, ...customerPayload },
                items: orderItems.map((item) => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: item.price,
                    quantity: 1,
                })),
            };

            const response = await api.post("/orders", orderPayload);

            if (response.status === 200 || response.status === 201) {
                // Navigate to Invoice and pass the created order data
                router.replace({
                    pathname: '/screens/invoice',
                    params: { orderData: JSON.stringify(response.data) }
                });
            }
        } catch (err: any) {
            console.error("Order failed:", err.response?.data || err.message);
            const errMsg = err.response?.data?.message || "Failed to place order.";
            Alert.alert("Error", errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.screen}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <SectionHeader title="Order Summary" actionText="Edit" onAction={() => router.back()} />

                {orderItems.map((item) => (
                    <OrderCard key={item.id} code={item.code || '1202'} name={item.name} price={item.price} />
                ))}

                <View style={styles.summaryTotalContainer}>
                    <Text style={styles.summaryTotalLabel}>Total: </Text>
                    <Text style={styles.summaryTotalValue}>₱ {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                </View>

                <Divider style={styles.mainDivider} />

                <SectionHeader
                    title="Customer Information"
                    actionText="View all customers >"
                    onAction={() => {
                        router.push({
                            pathname: "/screens/view-all-customers",
                            params: { items: params.items }
                        });
                    }}
                />

                <UnderlinedInput 
                    label="First Name" 
                    required 
                    placeholder="Juan" 
                    value={form.first_name} 
                    error={errors.first_name} 
                    onChangeText={t => setForm({ ...form, first_name: t })} 
                    editable={!isSubmitting}
                />
                <UnderlinedInput 
                    label="Last Name" 
                    required 
                    placeholder="Dela Cruz" 
                    value={form.last_name} 
                    error={errors.last_name} 
                    onChangeText={t => setForm({ ...form, last_name: t })} 
                    editable={!isSubmitting}
                />
                <UnderlinedInput 
                    label="Contact Number" 
                    required 
                    placeholder="09123456789" 
                    keyboardType="phone-pad" 
                    value={form.contact_number} 
                    error={errors.contact_number}
                    onChangeText={t => {
                        const filtered = t.replace(/[^0-9]/g, '');
                        if (filtered.length <= 11) setForm({ ...form, contact_number: filtered });
                    }} 
                    editable={!isSubmitting}
                />
                <UnderlinedInput 
                    label="Address" 
                    required 
                    placeholder="street, barangay, city..." 
                    value={form.address} 
                    error={errors.address}
                    onChangeText={t => setForm({ ...form, address: t })} 
                    editable={!isSubmitting}
                />
                <UnderlinedInput 
                    label="Social Media Link" 
                    required 
                    placeholder="https://www.instagram.com/..." 
                    value={form.social_handle} 
                    error={errors.social_handle}
                    onChangeText={t => setForm({ ...form, social_handle: t })} 
                    editable={!isSubmitting}
                />
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.buttonGroup}>
                    <TouchableOpacity 
                        style={[styles.cancelBtn, isSubmitting && styles.disabled]} 
                        onPress={() => router.back()}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.btnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.generateBtn, isSubmitting && styles.disabled]}
                        onPress={handlePlaceOrder}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.btnText}>{isSubmitting ? 'Processing...' : 'Generate'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },

  summaryTotalContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    marginTop: 15,
    marginBottom: 10,
  },

  summaryTotalLabel: {
    fontSize: 18,
    color: '#0D0F66',
  },

  summaryTotalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0D0F66',
    marginLeft: 10,
  },

  mainDivider: {
    marginVertical: 25,
    height: 1,
    backgroundColor: '#F0F0F0',
  },

  footer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },

  buttonGroup: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: '#9E2626',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  generateBtn: {
    flex: 1,
    backgroundColor: '#8B5E3C',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  disabled: {
    opacity: 0.5,
  },
});