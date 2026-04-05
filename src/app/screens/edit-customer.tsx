import api from '@/src/services/api'; // Ensure correct path to your api service
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Hooks for navigation/params
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import SuccessModal from '../../components/success-modal';

const EditCustomerScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // 1. Parse the customer data passed from the Logs Screen
    const customerData = params.customer ? JSON.parse(params.customer as string) : null;

    // Form States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [contact, setContact] = useState('');
    const [social, setSocial] = useState('');
    
    // 2. Initialize addresses as an array
    const [addresses, setAddresses] = useState<string[]>([]);
    
    // Image States
    const [profileImage, setProfileImage] = useState<any>(null); // New local pick
    const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null); // Current DB photo

    // Modal/Loading States
    const [modalVisible, setModalVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // 3. Populate state when the component mounts or data changes
    useEffect(() => {
        if (customerData) {
            setFirstName(customerData.first_name || '');
            setLastName(customerData.last_name || '');
            setContact(customerData.contact_number || '');
            setSocial(customerData.social_handle || '');
            
            // Load all addresses from the backend array
            // Fallback to the single address field if array is empty (for compatibility)
            const initialAddresses = customerData.addresses && customerData.addresses.length > 0 
                ? customerData.addresses 
                : [customerData.address || ''];
            setAddresses(initialAddresses);
            
            if (customerData.profile_picture) {
                setExistingPhotoUrl(customerData.profile_picture);
            }
        }
    }, [params.customer]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0]);
            setExistingPhotoUrl(null); // Clear preview of old photo
        }
    };

    const handleAddAddress = () => {
        setAddresses([...addresses, '']);
    };

    const handleUpdateAddress = (text: string, index: number) => {
        const newAddrs = [...addresses];
        newAddrs[index] = text;
        setAddresses(newAddrs);
    };

    const handleUpdate = async () => {
        if (!firstName.trim()) {
            Alert.alert("Error", "First Name is required.");
            return;
        }

        setIsUpdating(true);
        setModalVisible(true);

        const formData = new FormData();
        // Laravel Method Spoofing: Required to send files via PUT
        formData.append('_method', 'PUT'); 
        
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('contact_number', contact);
        formData.append('social_handle', social);
        
        // Append all addresses as an array for the backend
        addresses.forEach((addr, i) => {
            if (addr.trim()) formData.append(`addresses[${i}]`, addr);
        });
        
        if (profileImage) {
            formData.append('profile_image', {
                uri: profileImage.uri,
                name: 'customer_photo.jpg',
                type: 'image/jpeg',
            } as any);
        }

        try {
            const res = await api.post(`/customers/${customerData.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.status === 200) {
                setIsUpdating(false); // Switch Modal from spinner to checkmark
                setTimeout(() => {
                    setModalVisible(false);
                    router.back(); // Return to logs screen
                }, 2000);
            }
        } catch (error: any) {
            console.error("Update error:", error.response?.data || error.message);
            setModalVisible(false);
            setIsUpdating(false);
            Alert.alert("Error", "Failed to update customer. Please try again.");
        }
    };

    return (
        <View style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                
                {/* Profile Picture Section */}
                <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
                    {profileImage || existingPhotoUrl ? (
                        <Image 
                            source={{ uri: profileImage?.uri || existingPhotoUrl }} 
                            style={styles.avatarImage} 
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {firstName[0]}{lastName[0]}
                            </Text>
                        </View>
                    )}
                    <View style={styles.editIconContainer}>
                        <MaterialIcons name="photo-camera" size={16} color="white" />
                    </View>
                </TouchableOpacity>

                {/* Form Fields */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>First Name <Text style={styles.red}>*</Text></Text>
                    <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First Name" />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Last Name <Text style={styles.red}>*</Text></Text>
                    <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last Name" />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Contact Number <Text style={styles.red}>*</Text></Text>
                    <TextInput style={styles.input} value={contact} onChangeText={setContact} keyboardType="phone-pad" />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Social Media Link <Text style={styles.red}>*</Text></Text>
                    <TextInput style={styles.input} value={social} onChangeText={setSocial} autoCapitalize="none" />
                </View>

                {/* DYNAMIC ADDRESS FIELDS */}
                {addresses.map((addr, index) => (
                    <View key={index} style={styles.fieldContainer}>
                        <Text style={styles.label}>Address {index > 0 ? index + 1 : ''} <Text style={styles.red}>*</Text></Text>
                        <TextInput 
                            style={[styles.input, styles.addressInput]} 
                            value={addr} 
                            multiline 
                            onChangeText={(text) => handleUpdateAddress(text, index)} 
                            placeholder="Enter address..."
                        />
                    </View>
                ))}

                {/* Add Address Trigger */}
                <TouchableOpacity style={styles.addAddressBtn} onPress={handleAddAddress}>
                    <Ionicons name="add-circle" size={32} color="#050A30" />
                    <Text style={styles.addAddressText}>add address</Text>
                </TouchableOpacity>

                {/* Update Button */}
                <TouchableOpacity style={styles.btnUpdate} onPress={handleUpdate} disabled={isUpdating}>
                    <Text style={styles.btnText}>Update</Text>
                </TouchableOpacity>

            </ScrollView>

            <SuccessModal 
                visible={modalVisible} 
                message="Customer details are updated successfully." 
                isLoading={isUpdating} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: 'white' },
    scrollContent: { padding: 25 },
    avatarWrapper: { alignSelf: 'center', marginVertical: 30, width: 150, height: 150 },
    avatarPlaceholder: { width: '100%', height: '100%', backgroundColor: '#050A30', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    avatarImage: { width: '100%', height: '100%', borderRadius: 8 },
    avatarText: { color: 'white', fontSize: 60, fontWeight: 'bold', letterSpacing: 4 },
    editIconContainer: { position: 'absolute', bottom: -10, right: -10, backgroundColor: '#050A30', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: 'white' },
    fieldContainer: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#050A30', marginBottom: 5 },
    red: { color: 'red' },
    input: { borderBottomWidth: 1, borderBottomColor: '#ccc', fontSize: 14, color: '#555', paddingVertical: 5 },
    addressInput: { minHeight: 40 },
    addAddressBtn: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
    addAddressText: { color: '#999', marginLeft: 10, fontSize: 14 },
    btnUpdate: { backgroundColor: '#050A30', borderRadius: 8, height: 55, justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 40 },
    btnText: { color: 'white', fontSize: 22, fontWeight: '500' },
});

export default EditCustomerScreen;