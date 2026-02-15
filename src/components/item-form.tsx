import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Button, Snackbar, TextInput } from 'react-native-paper';

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
    const [image, setImage] = useState<any>(null); // For new picks
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

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <Text style={styles.heading}>{title}</Text>

                <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={loading}>
                    {image ? (
                        <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    ) : existingImage ? (
                        <Image source={{ uri: existingImage }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.placeholderContainer}><Text style={styles.placeholderText}>+ Add Photo</Text></View>
                    )}
                </TouchableOpacity>

                <TextInput label="Item Name" value={name} mode="outlined" onChangeText={setName} style={styles.input} outlineColor="#AB8262" activeOutlineColor="#0A0B32" disabled={loading} textColor='black' />

                <TextInput label="Price (₱)" value={price} mode="outlined" keyboardType="numeric" onChangeText={setPrice} style={styles.input} outlineColor="#AB8262" activeOutlineColor="#0A0B32" disabled={loading} left={<TextInput.Affix text="₱ " />} textColor='black' />

                
                <View style={{ height: 100 }} />
            </ScrollView>

            <Button mode="contained" onPress={handleSubmit} style={styles.saveButton} labelStyle={styles.buttonLabel} contentStyle={styles.buttonContent} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : "Save Item"}
            </Button>

            <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={3000} style={styles.snackbar}>
                <Text style={styles.snackbarText}>{errorMsg}</Text>
            </Snackbar>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F1F0ED' },
    heading: { fontSize: 28, fontFamily: 'LeagueSpartan-Bold', marginBottom: 20, color: '#0A0B32' },
    imagePicker: { width: '60%', aspectRatio: 1080 / 1350, alignSelf: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#AB8262', borderStyle: 'dashed', overflow: 'hidden', marginBottom: 25, justifyContent: 'center', alignItems: 'center' },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    placeholderContainer: { alignItems: 'center' },
    placeholderText: { fontFamily: 'LeagueSpartan', color: '#AB8262', fontSize: 16 },
    input: { marginBottom: 15, backgroundColor: '#fff' },
    statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
    statusLabel: { fontFamily: 'LeagueSpartan', fontSize: 18 },
    saveButton: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#AB8262', borderRadius: 12 },
    buttonContent: { height: 55 },
    buttonLabel: { fontFamily: 'LeagueSpartan-Bold', fontSize: 18, color: '#FFFFFF' },
    snackbar: { bottom: 100, backgroundColor: '#B80000' },
    snackbarText: { color: '#fff' }
});