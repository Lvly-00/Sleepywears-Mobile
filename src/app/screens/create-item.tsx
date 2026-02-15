import { router } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Button, Snackbar, TextInput } from 'react-native-paper';

export default function ItemAddScreen() {
    // 1. Separate states for each input
    const [name, setName] = React.useState("");
    const [capital, setCapital] = React.useState("");
    const [date, setDate] = React.useState("");

    // Notification state
    const [visible, setVisible] = React.useState(false);

    const handleAddItem = () => {
        // Show the notification
        setVisible(true);

        // 2. Wait for 1.5 seconds so user can see the message, then go back
        setTimeout(() => {
            setVisible(false);
            router.back(); // Goes back to the previous screen (the Inventory list)
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={{ flex: 1 }}>
                <Text style={styles.heading}>New Item</Text>

                <TextInput
                    label="Item Name"
                    value={name}
                    mode="outlined"
                    onChangeText={setName}
                    style={styles.input}
                    outlineColor="#AB8262"
                    activeOutlineColor="#0A0B32"
                />

                <TextInput
                    label="Price"
                    value={capital}
                    mode="outlined"
                    keyboardType="numeric"
                    onChangeText={setCapital}
                    style={styles.input}
                    outlineColor="#AB8262"
                    activeOutlineColor="#0A0B32"
                />

                {/* <TextInput
                    label="Release Date"
                    value={date}
                    mode="outlined"
                    placeholder="YYYY-MM-DD"
                    onChangeText={setDate}
                    style={styles.input}
                    outlineColor="#AB8262"
                    activeOutlineColor="#0A0B32"
                /> */}

                <Button
                    mode="contained"
                    onPress={handleAddItem}
                    style={styles.placeOrderButton}
                    labelStyle={styles.buttonLabel}
                    contentStyle={styles.buttonContent}
                >
                    Add Item
                </Button>

                <Snackbar
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    duration={2000}
                    style={styles.snackbar}
                >
                    <Text style={styles.snackbarText}>  Item "{name}" added successfully!</Text>


                </Snackbar>
            </View>

            {/* 3. NOTIFICATION COMPONENT */}

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F1F0ED', // Match your app theme
    },
    heading: {
        fontSize: 28,
        fontFamily: 'LeagueSpartan-Bold',
        marginBottom: 20,
        color: '#0A0B32',
    },
    input: {
        marginBottom: 15,
        backgroundColor: '#fff',
        fontFamily: 'LeagueSpartan',
    },
    placeOrderButton: {
        position: 'absolute',
        bottom: 30,
        right: 0, // Adjusted for full view
        backgroundColor: '#AB8262',
        borderRadius: 12,
        elevation: 4,
    },
    buttonContent: {
        paddingHorizontal: 20,
        height: 50,
    },
    buttonLabel: {
        fontFamily: 'LeagueSpartan-Bold',
        fontSize: 18,
        color: '#FFFFFF',
    },
    snackbar: {
        backgroundColor: '#2e7d32', // Dark Green
        bottom: 100,
    },
    snackbarCancel: {
        backgroundColor: '#333',
        bottom: 100,
    },
    snackbarText: {
        fontFamily: 'LeagueSpartan',
        color: '#fff',
    }
});