import { router } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { ActivityIndicator, Button, Snackbar, TextInput } from 'react-native-paper';
import api from "../../services/api";

export default function InventoryAddScreen() {
    const [name, setName] = React.useState("");
    const [capital, setCapital] = React.useState("");
    const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState({ name: "", capital: "", date: "" });
    const [visible, setVisible] = React.useState(false);

    // Formatter for Currency (Visual only)
    const formatCurrency = (val: string) => {
        const digits = val.replace(/\D/g, "");
        if (!digits) return "";
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 0,
        }).format(parseInt(digits));
    };

    const handleAddInventory = async () => {
        // 1. Validation (Matches your web logic)
        const newErrors = { name: "", capital: "", date: "" };
        let isValid = true;

        if (!name.trim()) {
            newErrors.name = "Collection number is required";
            isValid = false;
        }
        if (!date) {
            newErrors.date = "Release date is required";
            isValid = false;
        }

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                // Remove non-digits to match your web logic for "Collection Number"
                name: name.replace(/\D/g, ""),
                release_date: date,
                // Clean currency symbols and commas
                capital: capital.replace(/\D/g, "") || 0,
            };

            await api.post("/collections", payload);

            setVisible(true);

            setTimeout(() => {
                setVisible(false);

             
                router.replace('/(tabs)/inventory');
            }, 1500);

        } catch (error: any) {
            console.error("Submission Error:", error.response?.data || error.message);
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors || {};
                setErrors({
                    name: validationErrors.name ? validationErrors.name[0] : "",
                    capital: validationErrors.capital ? validationErrors.capital[0] : "",
                    date: validationErrors.release_date ? validationErrors.release_date[0] : "",
                });
            } else {
                alert("An error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView style={{ flex: 1 }}>
                <Text style={styles.heading}>New Collection</Text>

                <TextInput
                    label="Collection Number"
                    value={name}
                    mode="outlined"
                    keyboardType="numeric"
                    onChangeText={(val) => {
                        setName(val.replace(/\D/g, ""));
                        setErrors(prev => ({ ...prev, name: "" }));
                    }}
                    error={!!errors.name}
                    style={styles.input}
                    outlineColor="#AB8262"
                    activeOutlineColor="#0A0B32"
                    textColor="#000"

                />

                <TextInput
                    label="Capital"
                    value={capital}
                    placeholder="₱ 0"
                    mode="outlined"
                    keyboardType="numeric"
                    onChangeText={(val) => setCapital(formatCurrency(val))}
                    style={styles.input}
                    outlineColor="#AB8262"
                    activeOutlineColor="#0A0B32"
                    textColor="#000"

                />

                <TextInput
                    label="Release Date"
                    value={date}
                    mode="outlined"
                    placeholder="YYYY-MM-DD"
                    onChangeText={setDate}
                    style={styles.input}
                    outlineColor="#AB8262"
                    activeOutlineColor="#0A0B32"
                    textColor="#000"

                />

                <Button
                    mode="contained"
                    onPress={handleAddInventory}
                    disabled={loading}
                    style={styles.placeOrderButton}
                    labelStyle={styles.buttonLabel}
                    contentStyle={styles.buttonContent}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : "Add Collection"}
                </Button>
            </ScrollView>

            <Snackbar
                visible={visible}
                onDismiss={() => setVisible(false)}
                duration={2000}
                style={styles.snackbar}
            >
                <Text style={styles.snackbarText}>Collection "{name}" added successfully!</Text>
            </Snackbar>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F1F0ED' },
    heading: { fontSize: 28, fontFamily: 'LeagueSpartan-Bold', marginBottom: 20, color: '#0A0B32' },
    input: { marginBottom: 15, backgroundColor: '#fff', fontFamily: 'LeagueSpartan' },
    placeOrderButton: { marginTop: 20, backgroundColor: '#AB8262', borderRadius: 12, elevation: 4 },
    buttonContent: { height: 50 },
    buttonLabel: { fontFamily: 'LeagueSpartan-Bold', fontSize: 18, color: '#FFFFFF' },
    snackbar: { backgroundColor: '#2e7d32', bottom: 30 },
    snackbarText: { fontFamily: 'LeagueSpartan', color: '#fff' }
});