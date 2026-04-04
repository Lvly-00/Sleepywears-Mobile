import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import api from '../services/api';
import SuccessModal from './success-modal';

const { width } = Dimensions.get('window');
const ERROR_COLOR = '#9E2626';

interface ItemFormProps {
    mode: 'create' | 'edit';
    initialData?: any;
    collectionId: string;
}

export default function ItemForm({ mode, initialData, collectionId }: ItemFormProps) {

    const fixImageUrl = (url?: string | null): string | null => {
        if (!url) return null;

        // If it's already a full Cloudinary URL, return it
        if (url.includes('res.cloudinary.com')) return url;

        // If the URL contains 'items/' (even if it's inside a local URL), 
        // we treat it as a Cloudinary ID.
        if (url.includes('items/')) {
            // Extract the part starting with 'items/' 
            const cloudinaryId = url.substring(url.indexOf('items/'));
            return `https://res.cloudinary.com/dz0q8u0ia/image/upload/f_auto,q_auto/${cloudinaryId}`;
        }

        // Fallback for standard http/https links
        if (url.startsWith('http://') || url.startsWith('https://')) return url;

        return url;
    };

    const [name, setName] = useState(initialData?.name || "");
    const [price, setPrice] = useState(initialData?.price?.toString() || "");
    const [status, setStatus] = useState(initialData?.status || "Available");

    const [image, setImage] = useState<any>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);

    const [modalState, setModalState] = useState({ visible: false, loading: false, message: "" });
    const [errors, setErrors] = useState({ name: "", price: "", image: "" });

    useEffect(() => {
        if (initialData) {
            const imgPath = initialData.image || initialData.image_url;

            if (imgPath) {
                const fixed = fixImageUrl(imgPath);
                console.log("[DEBUG] Final URL used for display:", fixed);
                setExistingImage(fixed);
            }
        }
    }, [initialData]);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission Required", "Allow access to photos to continue.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1080, 1350],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
            setExistingImage(null);
            setErrors(prev => ({ ...prev, image: "" }));
        }
    };

    const handleSubmit = async () => {
        const newErrors = { name: "", price: "", image: "" };
        let isValid = true;

        if (!name.trim()) {
            newErrors.name = "Item name is required.";
            isValid = false;
        }

        if (!price || isNaN(Number(price.replace(/[^0-9.]/g, '')))) {
            newErrors.price = "Valid price is required.";
            isValid = false;
        }

        if (!image && !existingImage) {
            newErrors.image = "An image is required.";
            isValid = false;
        }

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        setModalState({
            visible: true,
            loading: true,
            message: mode === 'create' ? "Adding Item..." : "Updating Item..."
        });

        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price.replace(/[^0-9.]/g, ''));
        formData.append("status", status);
        formData.append("collection_id", collectionId);

        if (image) {
            const fileName = image.uri.split('/').pop() || 'upload.jpg';
            const match = /\.(\w+)$/.exec(fileName);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append("image", {
                uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
                name: fileName,
                type: type,
            } as any);
        }

        try {
            if (mode === 'create') {
                await api.post("/items", formData, { headers: { "Content-Type": "multipart/form-data" } });
            } else {
                formData.append('_method', 'PUT');
                await api.post(`/items/${initialData.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            setModalState({
                visible: true,
                loading: false,
                message: mode === 'create' ? 'Item added successfully!' : 'Item updated successfully!'
            });
            setTimeout(() => {
                setModalState({ visible: false, loading: false, message: "" });
                router.back();
            }, 1500);
        } catch (error: any) {
            // 3. Error Case: Close modal so user can see what's wrong
            setModalState({ visible: false, loading: false, message: "" });

            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors || {};
                setErrors({
                    name: validationErrors.name ? validationErrors.name[0] : '',
                    price: validationErrors.price ? validationErrors.price[0] : '',
                    image: validationErrors.image ? validationErrors.image[0] : '',
                });
            } else {
                Alert.alert("Error", "Something went wrong. Please try again.");
            }
        }
    };

    const InputLabel = ({ title }: { title: string }) => (
        <Text style={styles.label}>{title} <Text style={{ color: '#E70B0B' }}>*</Text></Text>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                <TouchableOpacity
                    style={[
                        styles.imagePicker,
                        {
                            borderColor: errors.image
                                ? ERROR_COLOR
                                : (image || existingImage ? '#BCBCBC' : '#818181'),
                            borderStyle: errors.image ? 'dashed' : 'dashed'
                        }
                    ]} onPress={pickImage}
                    disabled={modalState.loading}
                >
                    {image ? (
                        <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    ) : existingImage ? (
                        <Image
                            source={{ uri: existingImage }}
                            style={styles.previewImage}
                            onError={(e) => console.log("[DEBUG] Image Load Error:", e.nativeEvent.error)}
                        />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Text style={[styles.placeholderText, !!errors.image && { color: ERROR_COLOR }]}>
                                Add Photo
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
                <HelperText type="error" visible={!!errors.image} style={[styles.helper, { textAlign: 'center', marginBottom: 20 }]}>
                    {errors.image}
                </HelperText>

                <View style={styles.inputGroup}>
                    <InputLabel title="Item Name" />
                    <TextInput
                        value={name}
                        placeholder='Blouse'
                        mode="flat"
                        onChangeText={(val) => {
                            setName(val);
                            setErrors(prev => ({ ...prev, name: '' }));
                        }}
                        style={styles.input}
                        error={!!errors.name}
                        underlineColor="#BCBCBC"
                        activeUnderlineColor="#0A2167"
                        disabled={modalState.loading}
                        textColor='black'
                        theme={{
                            colors: {
                                onSurfaceVariant: '#818181',
                                error: ERROR_COLOR
                            }
                        }}
                    />
                    <HelperText type="error" visible={!!errors.name} style={styles.helper}>
                        {errors.name}
                    </HelperText>
                </View>

                <View style={styles.inputGroup}>
                    <InputLabel title="Price" />
                    <TextInput
                        value={price}
                        mode="flat"
                        keyboardType="numeric"
                        onChangeText={(val) => {
                            setPrice(val);
                            setErrors(prev => ({ ...prev, price: '' }));
                        }}
                        style={styles.input}
                        error={!!errors.price}
                        underlineColor="#BCBCBC"
                        activeUnderlineColor="#0A2167"
                        disabled={modalState.loading}
                        textColor='black'
                        placeholder="₱ 0"
                        theme={{
                            colors: {
                                onSurfaceVariant: '#818181',
                                error: ERROR_COLOR
                            }
                        }}
                    />
                    <HelperText type="error" visible={!!errors.price} style={styles.helper}>
                        {errors.price}
                    </HelperText>
                </View>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.saveButton}
                    labelStyle={styles.buttonLabel}
                    contentStyle={styles.buttonContent}
                    disabled={modalState.loading}>
                    {mode === 'create' ? "Save" : "Update"}
                </Button>

            </ScrollView>

            <SuccessModal
                visible={modalState.visible}
                isLoading={modalState.loading}
                message={modalState.message}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    scrollContent: {
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 40,
    },

    imagePicker: {
        width: '70%',
        aspectRatio: 0.8,
        alignSelf: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#818181',
        borderStyle: 'dashed',
        overflow: 'hidden',
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    imagePickerActive: {
        borderStyle: 'dashed',
        borderColor: '#BCBCBC',
    },

    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    placeholderContainer: {
        alignItems: 'center',
    },

    placeholderText: {
        fontSize: 20,
        color: '#939393',
        fontWeight: '300',
        marginTop: 10,
    },

    inputGroup: {
        marginBottom: 10,
    },

    label: {
        fontSize: 16,
        color: '#3E4491',
        fontWeight: '500',
        marginBottom: -5,
    },

    input: {
        backgroundColor: 'transparent',
        height: 50,
        paddingHorizontal: 0,
    },

    saveButton: {
        marginTop: 10,
        backgroundColor: '#0A256C',
        borderRadius: 8,
        elevation: 0,
    },

    buttonContent: {
        height: 55,
    },

    buttonLabel: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'none',
    },
    helper: {
        paddingHorizontal: 0,
        lineHeight: 14,
        color: '#9E2626',
    },
});