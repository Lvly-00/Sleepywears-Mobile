import { AddressDropdown } from '@/src/components/address-dropdown';
import { CancelOrderModal } from '@/src/components/cancel-order-modal';
import SuccessModal from '@/src/components/success-modal';
import api from '@/src/services/api'; // Use your api service
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Divider, HelperText } from 'react-native-paper';
import { OrderCard, SectionHeader, UnderlinedInput } from '../../components/confirm-order-components';

const { width } = Dimensions.get('window');

const ERROR_COLOR = '#9E2626';


export default function ConfirmOrderScreen() {
    const params = useLocalSearchParams();

    // State to track if we are updating an existing customer
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [availableAddresses, setAvailableAddresses] = useState<string[]>([]);

    const [isAddressMenuVisible, setIsAddressMenuVisible] = useState(false);


    const initialFormState = {
        first_name: "",
        last_name: "",
        address: "",
        contact_number: "",
        social_handle: ""
    };

    const [form, setForm] = useState(initialFormState);
    const [modalState, setModalState] = useState({ visible: false, loading: false, message: "" });
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

    const [orderItems] = useState<any[]>(params.items ? JSON.parse(params.items as string) : []);
    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const total = orderItems.reduce((sum, item) => sum + parseFloat(item.price.toString()), 0);

    // Function to clear selection and allow adding a new customer
    const handleClearCustomer = () => {
        setCustomerId(null);
        setForm(initialFormState);
        setErrors({});
        // Optional: clear router params so it doesn't re-trigger on re-render
        router.setParams({ selectedCustomer: undefined });
    };

    // Auto-fill form when a customer is selected from the "View All" screen
    useEffect(() => {
        if (params.selectedCustomer) {
            try {
                const customer = JSON.parse(params.selectedCustomer as string);
                setCustomerId(customer.id); // Store the ID for the PUT request
                const addresses = customer.addresses || [];
                setAvailableAddresses(addresses);
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

    const handleConfirmCancel = () => {
        setIsCancelModalVisible(false);
        router.replace('/orders');
    };


    const handlePlaceOrder = async () => {
        if (isSubmitting) return;

        // 1. Validation Logic
        const newErrors: any = {};

        if (orderItems.length === 0) {
            Alert.alert("Error", "Please add at least one item.");
            return;
        }

        // Required field check
        const requiredFields = ["first_name", "last_name", "address", "contact_number"];
        requiredFields.forEach((field) => {
            if (!form[field as keyof typeof form]) {
                newErrors[field] = "This field is required";
            }
        });

        // Specific format checks
        if (form.contact_number && form.contact_number.length !== 11) {
            newErrors.contact_number = "Contact number must be exactly 11 digits.";
        }

        const urlPattern = /^https?:\/\/.+/;
        if (form.social_handle && !urlPattern.test(form.social_handle)) {
            newErrors.social_handle = "Must be a valid URL (http/https)";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Clear previous errors and show loading state
        setErrors({});
        setModalState({ visible: true, loading: true, message: "Processing Order..." });

        try {
            let currentCustomerId = customerId;

            // 2. Handle Customer Sync (Create or Update)
            const customerPayload = {
                ...form,
                // Ensure we send an array of addresses to match the backend expectation
                addresses: availableAddresses.length > 0 ? availableAddresses : [form.address]
            };

            if (currentCustomerId) {
                await api.put(`/customers/${currentCustomerId}`, customerPayload);
            } else {
                const customerRes = await api.post("/customers", customerPayload);
                currentCustomerId = customerRes.data.id;
            }

            // 3. Construct and Send Order Payload
            const orderPayload = {
                customer: {
                    id: currentCustomerId,
                    first_name: form.first_name,
                    last_name: form.last_name,
                    contact_number: form.contact_number,
                    social_handle: form.social_handle,
                },
                items: orderItems.map((item) => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: item.price,
                    quantity: 1,
                })),
                address: form.address, // The specific shipping address for this order
            };

            const response = await api.post("/orders", orderPayload);

            if (response.status === 200 || response.status === 201) {
                setModalState({ visible: true, loading: false, message: "Order Placed Successfully!" });

                // Small delay to allow user to see success message before navigation
                setTimeout(() => {
                    setModalState({ visible: false, loading: false, message: "" });
                    router.replace({
                        pathname: '/screens/invoice',
                        params: { orderData: JSON.stringify(response.data) }
                    });
                }, 1500);
            }
        } catch (err: any) {
            setModalState({ visible: false, loading: false, message: "" });

            const validationErrors = err.response?.data?.errors;
            if (validationErrors) {
                // Map backend Laravel errors to the frontend error state
                const mappedErrors: any = {};
                Object.keys(validationErrors).forEach(key => {
                    mappedErrors[key] = validationErrors[key][0];
                });
                setErrors(mappedErrors);
            } else {
                const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
                Alert.alert("System Error", errorMessage);
            }
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

                {customerId && (
                    <TouchableOpacity
                        style={styles.clearCustomerContainer}
                        onPress={handleClearCustomer}
                    >
                        <Text style={styles.clearCustomerText}>
                            You are editing a selected customer.
                            <Text style={styles.clearCustomerAction}> Clear selection.</Text>
                        </Text>
                    </TouchableOpacity>
                )}
                <View style={styles.inputGroup}>

                    <UnderlinedInput
                        label="First Name"
                        required
                        placeholder="Juan"
                        value={form.first_name}
                        error={errors.first_name}
                        onChangeText={t => setForm({ ...form, first_name: t })}
                        editable={!isSubmitting}
                    />
                    <HelperText
                        type="error"
                        visible={!!errors.first_name}
                        style={styles.helper}>{errors.first_name}
                    </HelperText>
                </View>

                <View style={styles.inputGroup}>
                    <UnderlinedInput
                        label="Last Name"
                        required
                        placeholder="Dela Cruz"
                        value={form.last_name}
                        error={errors.last_name}
                        onChangeText={t => setForm({ ...form, last_name: t })}
                        editable={!isSubmitting}
                    />
                    <HelperText
                        type="error"
                        visible={!!errors.last_name}
                        style={styles.helper}>{errors.last_name}
                    </HelperText>
                </View>

                <View style={styles.inputGroup}>
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
                    <HelperText
                        type="error"
                        visible={!!errors.contact_number}
                        style={styles.helper}>{errors.contact_number}
                    </HelperText>
                </View>

                {/* ADDRESS LOGIC: Dropdown if multiple, Input if single */}
                <View style={styles.inputGroup}>
                    {/* <Text style={styles.customLabel}>
                                Address <Text style={{ color: 'red' }}>*</Text>
                            </Text> */}

                    {availableAddresses.length > 1 ? (
                        <AddressDropdown
                            label="Address"
                            required
                            addresses={availableAddresses}
                            selectedAddress={form.address}
                            error={errors.address}
                            onSelect={(addr) => setForm({ ...form, address: addr })}
                        />
                    ) : (
                        <UnderlinedInput
                            label="Address"
                            required
                            placeholder="street, barangay, city..."
                            value={form.address}
                            error={errors.address}
                            onChangeText={(t) => setForm({ ...form, address: t })}
                            editable={!isSubmitting}
                        />
                    )}

                    {/* Using the standard HelperText for error consistency */}
                    <HelperText type="error" visible={!!errors.address} style={styles.helper}>
                        {errors.address}
                    </HelperText>
                </View>

                <View style={styles.inputGroup}>
                    <UnderlinedInput
                        label="Social Media Link"
                        required
                        placeholder="https://www.instagram.com/..."
                        value={form.social_handle}
                        error={errors.social_handle}
                        onChangeText={t => setForm({ ...form, social_handle: t })}
                        editable={!isSubmitting}
                    />
                    <HelperText
                        type="error"
                        visible={!!errors.social_handle}
                        style={styles.helper}>{errors.social_handle}
                    </HelperText>
                </View>

                <View style={styles.footer}>
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={[styles.cancelBtn, isSubmitting && styles.disabled]}
                            onPress={() => setIsCancelModalVisible(true)}
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
            </ScrollView>

            <CancelOrderModal
                visible={isCancelModalVisible}
                onClose={() => setIsCancelModalVisible(false)}
                onConfirm={handleConfirmCancel}
            />
            <SuccessModal
                visible={modalState.visible}
                isLoading={modalState.loading}
                message={modalState.message}
            />
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
        paddingBottom: 5,
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

    helper: {
        color: ERROR_COLOR,
        paddingHorizontal: 0,
        marginTop: -10
    },
    inputGroup: {
        marginBottom: 10,
    },
    clearCustomerContainer: {
        backgroundColor: '#F0F7FF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#D0E3F7',
        borderStyle: 'dashed',
    },

    clearCustomerText: {
        fontSize: 13,
        color: '#444',
        textAlign: 'center',
    },

    clearCustomerAction: {
        color: '#9E2626',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    customLabel: {
        fontSize: 12,
        color: '#0D0F66',
        fontWeight: '600'
    },
    dropdownTrigger: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dropdownText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
        paddingRight: 10
    },
    dropdownArrow: {
        fontSize: 10,
        color: '#666'
    },
});