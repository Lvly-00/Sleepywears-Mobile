import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
import ItemFormSkeleton from './item-form-skeleton-loader';
import SuccessModal from './success-modal';

const { width } = Dimensions.get('window');
const ERROR_COLOR = '#9E2626';

interface ItemFormProps {
    mode: 'create' | 'edit';
    initialData?: any;
    collectionId: string;
}

export default function ItemForm({ mode, initialData, collectionId }: ItemFormProps) {
    const [isPageLoading, setIsPageLoading] = useState(mode === 'edit' && !initialData);

    const fixImageUrl = (url?: string | null): string | null => {
        if (!url) return null;

        if (url.includes('res.cloudinary.com')) return url;

        if (url.includes('items/')) {
            const cloudinaryId = url.substring(url.indexOf('items/'));
            return `https://res.cloudinary.com/dz0q8u0ia/image/upload/f_auto,q_auto/${cloudinaryId}`;
        }

        if (url.startsWith('http://') || url.startsWith('https://')) return url;

        return url;
    };



    const [name, setName] = useState(initialData?.name || "");
    const [price, setPrice] = useState(initialData?.price != null ? formatCurrency(String(initialData.price)) : ''
    );

    const [status, setStatus] = useState(initialData?.status || "Available");

    const [image, setImage] = useState<any>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);
    const [imageChanged, setImageChanged] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<any>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [modalState, setModalState] = useState({ visible: false, loading: false, message: "" });
    const [errors, setErrors] = useState({ name: "", price: "", image: "" });


    function formatCurrency(val: string) {
        const digits = val.replace(/\D/g, '');
        if (!digits) return '';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
        }).format(parseInt(digits));
    }

    useEffect(() => {
        if (initialData) {
            setIsPageLoading(false);

            const imgPath = initialData.image || initialData.image_url;

            if (imgPath) {
                const fixed = fixImageUrl(imgPath);
                console.log("[DEBUG] Final URL used for display:", fixed);
                setExistingImage(fixed);
            }
            setImageChanged(false);
        }
    }, [initialData]);


    const uploadImageImmediately = async (asset: any) => {
        try {
            setUploadingImage(true);

            const formData = new FormData();

            const fileName = asset.uri.split('/').pop() || 'upload.jpg';
            const match = /\.(\w+)$/.exec(fileName);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append("image", {
                uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
                name: fileName,
                type,
            } as any);

            const res = await api.post("/items/temp-upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setUploadedImage(res.data);

            console.log("Image uploaded instantly:", res.data);
        } catch (err) {
            console.log("Upload failed", err);
        } finally {
            setUploadingImage(false);
        }
    };

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1080, 1350],
            quality: 0.7,
        });

        if (result.canceled) return;

        const asset = result.assets[0];

        setImage(asset);
        setExistingImage(null);

        await uploadImageImmediately(asset);
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

        if (!image && !existingImage && !uploadedImage) {
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

        try {
            const formData = new FormData();

            formData.append("name", name);
            formData.append("price", price.replace(/[^0-9.]/g, ''));
            formData.append("status", status);
            formData.append("collection_id", collectionId);


            if (uploadedImage) {
                formData.append("image_id", uploadedImage.public_id);
                formData.append("image_url", uploadedImage.secure_url);
            }

            let response;

            if (mode === 'create') {
                response = await api.post("/items", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            } else {
                formData.append("_method", "PUT");
                response = await api.post(`/items/${initialData.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }

            setModalState({
                visible: true,
                loading: false,
                message: mode === 'create'
                    ? "Item added successfully!"
                    : "Item updated successfully!"
            });

            setImage(null);
            setExistingImage(null);
            setUploadedImage(null);

            setTimeout(() => {
                setModalState({ visible: false, loading: false, message: "" });
                router.back();
            }, 1500);

        } catch (error: any) {
            setModalState({ visible: false, loading: false, message: "" });

            console.error("Submit Error:", error.response?.data || error.message);

            const serverMsg = error.response?.data?.message || "Something went wrong";
            Alert.alert("Error", serverMsg);
        }
    };

    if (isPageLoading) {
        return <ItemFormSkeleton />;
    }


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
                            borderStyle: 'dashed',
                        }
                    ]}
                    onPress={pickImage}
                    disabled={modalState.loading || uploadingImage}
                >
                    {/* ================= IMAGE PREVIEW ================= */}
                    {image ? (
                        <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    ) : existingImage ? (
                        <Image
                            source={{ uri: existingImage }}
                            style={styles.previewImage}
                            onError={(e) =>
                                console.log("[DEBUG] Image Load Error:", e.nativeEvent.error)
                            }
                        />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Text
                                style={[
                                    styles.placeholderText,
                                    !!errors.image && { color: ERROR_COLOR }
                                ]}
                            >
                                Add Photo
                            </Text>
                        </View>
                    )}

                    {/* ================= UPLOAD OVERLAY ================= */}
                    {uploadingImage && (
                        <View style={styles.uploadOverlay}>
                            <ActivityIndicator size="large" color="#FFFFFF" />
                            <Text style={{ color: '#fff', marginTop: 8, fontWeight: '600' }}>
                                Uploading image...
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
                            setPrice(formatCurrency(val));
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
    uploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
});