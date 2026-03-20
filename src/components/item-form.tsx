import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
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

const { width } = Dimensions.get('window');

interface ItemFormProps {
    initialData?: {
        name: string;
        price: string;
        image_url: string | null;
        status: string;
    };
    onSubmit: (formData: FormData) => Promise<void>;
    loading: boolean;
    title: string;
}

export default function ItemForm({ initialData, onSubmit, loading, title }: ItemFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [price, setPrice] = useState(initialData?.price?.toString() || "");
    const [status, setStatus] = useState(initialData?.status || "Available");
    const [image, setImage] = useState<any>(null);
    const [existingImage, setExistingImage] = useState<string | null>(initialData?.image_url || null);
    
    const [visible, setVisible] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

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
            setErrorMsg("Please fill in all fields and add a photo.");
            setVisible(true);
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price.replace(/[^0-9.]/g, ''));
        formData.append("status", status);

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
            await onSubmit(formData);
        } catch (error: any) {
            const msg = error.response?.data?.message || "Operation failed";
            setErrorMsg(msg);
            setVisible(true);
        }
    };

    const InputLabel = ({ title }: { title: string }) => (
        <Text style={styles.label}>
            {title} <Text style={{ color: '#E70B0B' }}>*</Text>
        </Text>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                
                {/* Image Picker Section */}
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={loading}>
                    {image ? (
                        <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    ) : existingImage ? (
                        <Image source={{ uri: existingImage }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Text style={styles.placeholderText}>Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Item Name Input */}
                <View style={styles.inputGroup}>
                    <InputLabel title="Item Name" />
                    <TextInput 
                        value={name} 
                        mode="flat" 
                        onChangeText={setName} 
                        style={styles.input} 
                        underlineColor="#BCBCBC" 
                        activeUnderlineColor="#0A2167" 
                        disabled={loading} 
                        textColor='black' 
                    />
                </View>

                {/* Price Input */}
                <View style={styles.inputGroup}>
                    <InputLabel title="Price" />
                    <TextInput 
                        value={price} 
                        mode="flat" 
                        keyboardType="numeric" 
                        onChangeText={setPrice} 
                        style={styles.input} 
                        underlineColor="#BCBCBC" 
                        activeUnderlineColor="#0A2167" 
                        disabled={loading} 
                        textColor='black' 
                        placeholder="₱ 0"
                    />
                </View>

                <Button 
                    mode="contained" 
                    onPress={handleSubmit} 
                    style={styles.saveButton} 
                    labelStyle={styles.buttonLabel} 
                    contentStyle={styles.buttonContent} 
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : "Save"}
                </Button>

            </ScrollView>

            <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={3000} style={styles.snackbar}>
                <Text style={styles.snackbarText}>{errorMsg}</Text>
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
        aspectRatio: .8, // Square like the image
        alignSelf: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#818181',
        borderStyle: 'dashed',
        overflow: 'hidden',
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: 24,
        color: '#939393',
        textAlign: 'center',
        fontWeight: 300,
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
        paddingHorizontal: 0,
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: '#0A2167',
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
    snackbar: {
        backgroundColor: '#B80000',
    },
    snackbarText: {
        color: '#fff',
    },
    // HeaderBackground added per your formatting request
    headerBackground: {
        width: width,
        height: width * 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -10,
        marginBottom: -130,
    },
});