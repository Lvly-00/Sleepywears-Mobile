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
import { Button, Snackbar, Text, TextInput } from 'react-native-paper';
import api from '../services/api';

const { width } = Dimensions.get('window');

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

        // NEW LOGIC: If the URL contains 'items/' (even if it's inside a local URL), 
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

    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [msg, setMsg] = useState("");

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
        }
    };

    const handleSubmit = async () => {
        if (!name || !price || (!image && !existingImage)) {
            setMsg("Please fill in all fields and add a photo.");
            setVisible(true);
            return;
        }

        setLoading(true);
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
            router.back();
        } catch (error: any) {
            setMsg("Operation failed.");
            setVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const InputLabel = ({ title }: { title: string }) => (
        <Text style={styles.label}>{title} <Text style={{ color: '#E70B0B' }}>*</Text></Text>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                <TouchableOpacity 
                    style={[styles.imagePicker, (image || existingImage) && styles.imagePickerActive]} 
                    onPress={pickImage} 
                    disabled={loading}
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
                            <Text style={styles.placeholderText}>Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.inputGroup}>
                    <InputLabel title="Item Name" />
                    <TextInput value={name} mode="flat" onChangeText={setName} style={styles.input} underlineColor="#BCBCBC" activeUnderlineColor="#0A2167" disabled={loading} textColor='black' />
                </View>

                <View style={styles.inputGroup}>
                    <InputLabel title="Price" />
                    <TextInput value={price} mode="flat" keyboardType="numeric" onChangeText={setPrice} style={styles.input} underlineColor="#BCBCBC" activeUnderlineColor="#0A2167" disabled={loading} textColor='black' placeholder="₱ 0" />
                </View>

                <Button mode="contained" onPress={handleSubmit} style={styles.saveButton} labelStyle={styles.buttonLabel} contentStyle={styles.buttonContent} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : (mode === 'create' ? "Save" : "Update")}
                </Button>

            </ScrollView>

            <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={2000} style={[styles.snackbar, mode === 'edit' && { backgroundColor: '#2e7d32' }]}>
                <Text style={styles.snackbarText}>{msg}</Text>
            </Snackbar>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    scrollContent: {
        paddingHorizontal: 25,
        paddingTop: 30,
        paddingBottom: 50,
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
        marginBottom: 40,
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
        marginBottom: 25,
    },

    label: {
        fontSize: 16,
        color: '#3E4491',
        fontWeight: '500',
        marginBottom: -5,
    },

    input: {
        backgroundColor: 'transparent',
        height: 45,
    },

    saveButton: {
        marginTop: 20,
        backgroundColor: '#0A2167',
        borderRadius: 8,
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

    snackbar: {
        backgroundColor: '#B80000',
    },

    snackbarText: {
        color: '#fff',
        textAlign: 'center',
    },
});