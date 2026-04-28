import api from '@/src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { HelperText } from 'react-native-paper'; // Ensure react-native-paper is installed
import SuccessModal from '../../components/success-modal';

const ERROR_COLOR = '#9E2626';

const EditCustomerScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    const customerData = params.customer ? JSON.parse(params.customer as string) : null;

    // Form States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [contact, setContact] = useState('');
    const [social, setSocial] = useState('');
    const [addresses, setAddresses] = useState<string[]>([]);

    // UI States
    const [errors, setErrors] = useState<any>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (customerData) {
            setFirstName(customerData.first_name || '');
            setLastName(customerData.last_name || '');
            setContact(customerData.contact_number || '');
            setSocial(customerData.social_handle || '');

            const initialAddresses = customerData.addresses && customerData.addresses.length > 0
                ? customerData.addresses
                : [customerData.address || ''];
            setAddresses(initialAddresses);
        }
    }, [params.customer]);

    const validate = () => {
        let newErrors: any = {};
        const urlPattern = /^https?:\/\/.+/;

        if (!firstName.trim()) newErrors.firstName = "First name is required";
        if (!lastName.trim()) newErrors.lastName = "Last name is required";

        if (!contact.trim()) {
            newErrors.contact = "Contact number is required";
        } else if (contact.length !== 11) {
            newErrors.contact = "Contact number must be exactly 11 digits";
        }

        if (!social.trim()) {
            newErrors.social = "Social media link is required";
        } else if (!urlPattern.test(social)) {
            newErrors.social = "Must be a valid URL (http/https)";
        }

        // Validate addresses
        const addressErrors = addresses.map(addr => !addr.trim() ? "Address cannot be empty" : null);
        if (addressErrors.some(err => err !== null)) {
            newErrors.addresses = addressErrors;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddAddress = () => {
        if (addresses.length >= 2) {
            Alert.alert("Limit reached", "You can only add up to 2 addresses.");
            return;
        }
        setAddresses([...addresses, '']);
    };

    const handleUpdateAddress = (text: string, index: number) => {
        const newAddrs = [...addresses];
        newAddrs[index] = text;
        setAddresses(newAddrs);
        // Clear address error when typing
        if (errors.addresses) {
            const newAddrErrors = [...errors.addresses];
            newAddrErrors[index] = null;
            setErrors({ ...errors, addresses: newAddrErrors });
        }
    };

    const handleUpdate = async () => {
        if (!validate()) return;

        setIsUpdating(true);
        setModalVisible(true);

        try {
            const res = await api.put(`/customers/${customerData.id}`, {
                first_name: firstName,
                last_name: lastName,
                contact_number: contact,
                social_handle: social,
                addresses: addresses.filter(a => a.trim() !== '')
            });

            if (res.status === 200) {
                setIsUpdating(false);
                setTimeout(() => {
                    setModalVisible(false);
                    router.back();
                }, 2000);
            }
        } catch (error: any) {
            setModalVisible(false);
            setIsUpdating(false);
            const backendErrors = error.response?.data?.errors;
            if (backendErrors) {
                // Map backend errors if any
                setErrors(backendErrors);
            } else {
                Alert.alert("Error", "Failed to update customer.");
            }
        }
    };

    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

    return (
        <KeyboardAvoidingView
            style={styles.mainContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Avatar Initials Only */}
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{initials || '??'}</Text>
                        </View>
                    </View>

                    {/* First Name */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>First Name <Text style={styles.red}>*</Text></Text>
                        <TextInput
                            style={[styles.input, errors.firstName && styles.inputError]}
                            value={firstName}
                            onChangeText={(t) => { setFirstName(t); setErrors({ ...errors, firstName: null }) }}
                            placeholder="First Name"
                        />
                        <HelperText type="error" visible={!!errors.firstName} style={styles.helper}>
                            {errors.firstName}
                        </HelperText>
                    </View>

                    {/* Last Name */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Last Name <Text style={styles.red}>*</Text></Text>
                        <TextInput
                            style={[styles.input, errors.lastName && styles.inputError]}
                            value={lastName}
                            onChangeText={(t) => { setLastName(t); setErrors({ ...errors, lastName: null }) }}
                            placeholder="Last Name"
                        />
                        <HelperText type="error" visible={!!errors.lastName} style={styles.helper}>
                            {errors.lastName}
                        </HelperText>
                    </View>

                    {/* Contact Number */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Contact Number <Text style={styles.red}>*</Text></Text>
                        <TextInput
                            style={[styles.input, errors.contact && styles.inputError]}
                            value={contact}
                            onChangeText={(t) => {
                                const filtered = t.replace(/[^0-9]/g, '');
                                if (filtered.length <= 11) {
                                    setContact(filtered);
                                    setErrors({ ...errors, contact: null });
                                }
                            }}
                            keyboardType="phone-pad"
                            placeholder="09XXXXXXXXX"
                        />
                        <HelperText type="error" visible={!!errors.contact} style={styles.helper}>
                            {errors.contact}
                        </HelperText>
                    </View>

                    {/* Social Media */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Social Media Link <Text style={styles.red}>*</Text></Text>
                        <TextInput
                            style={[styles.input, errors.social && styles.inputError]}
                            value={social}
                            onChangeText={(t) => { setSocial(t); setErrors({ ...errors, social: null }) }}
                            autoCapitalize="none"
                            placeholder="https://..."
                        />
                        <HelperText type="error" visible={!!errors.social} style={styles.helper}>
                            {errors.social}
                        </HelperText>
                    </View>

                    {/* DYNAMIC ADDRESS FIELDS */}
                    {addresses.map((addr, index) => (
                        <View key={index} style={styles.fieldContainer}>
                            <Text style={styles.label}>Address {index > 0 ? index + 1 : ''} <Text style={styles.red}>*</Text></Text>
                            <TextInput
                                style={[styles.input, styles.addressInput, errors.addresses?.[index] && styles.inputError]}
                                value={addr}
                                multiline
                                onChangeText={(text) => handleUpdateAddress(text, index)}
                                placeholder="Street, City, etc..."
                            />
                            <HelperText type="error" visible={!!errors.addresses?.[index]} style={styles.helper}>
                                {errors.addresses?.[index]}
                            </HelperText>
                        </View>
                    ))}

                    {addresses.length < 2 && (
                        <TouchableOpacity style={styles.addAddressBtn} onPress={handleAddAddress}>
                            <Ionicons name="add-circle" size={32} color="#050A30" />
                            <Text style={styles.addAddressText}>add address</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.btnUpdate} onPress={handleUpdate} disabled={isUpdating}>
                        <Text style={styles.btnText}>{isUpdating ? "Updating..." : "Update"}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>

            <SuccessModal
                visible={modalVisible}
                message="Customer details are updated successfully!"
                isLoading={isUpdating}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: 'white' },
    scrollContent: { padding: 25, flexGrow: 1 },
    avatarWrapper: {
        alignSelf: 'center',
        marginVertical: 30,
        width: 150,
        height: 150,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#050A30',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 60,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    fieldContainer: { marginBottom: 5 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#050A30', marginBottom: 2 },
    red: { color: 'red' },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        fontSize: 14,
        color: '#555',
        paddingVertical: 8,
    },
    inputError: {
        borderBottomColor: ERROR_COLOR,
    },
    helper: {
        paddingHorizontal: 0,
        color: ERROR_COLOR,
    },
    addressInput: { minHeight: 40 },
    addAddressBtn: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
    addAddressText: { color: '#999', marginLeft: 10, fontSize: 14 },
    btnUpdate: {
        backgroundColor: '#050A30',
        borderRadius: 8,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    btnText: { color: 'white', fontSize: 22, fontWeight: '500' },
});

export default EditCustomerScreen;