import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button, Modal, Portal, Snackbar } from 'react-native-paper';

export default function ConfirmOrderScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false); // New Loading State
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarPlaced, setSnackbarPlaced] = useState(false);

    const showModal = () => setModalVisible(true);
    const hideModal = () => setModalVisible(false);

    const handleGenerate = () => {
        // 1. Show Loading Modal
        setLoading(true);

        // 2. Simulate an API/Processing delay (e.g., 2 seconds)
        setTimeout(() => {
            setLoading(false); // Hide Loading
            setSnackbarPlaced(true); // Show Success Snackbar

            // 3. Navigate after user sees the success message
            setTimeout(() => {
                router.replace('/invoice');
            }, 2000);
        }, 2000);
    };

    const handleConfirmCancel = () => {
        hideModal();
        setSnackbarVisible(true);
        setTimeout(() => {
            router.push('/orders');
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <Portal>
                {/* --- LOADING MODAL --- */}
                <Modal
                    visible={loading}
                    dismissable={false} // Prevent user from tapping away during loading
                    contentContainerStyle={styles.loadingModalContainer}
                >
                    <ActivityIndicator animating={true} color="#0A0B32" size="large" />
                    <Text style={styles.loadingText}>Generating Invoice...</Text>
                </Modal>

                {/* --- CANCELLATION MODAL --- */}
                <Modal
                    visible={modalVisible}
                    onDismiss={hideModal}
                    contentContainerStyle={styles.modalContainer}
                >
                    <Text style={styles.modalTitle}>Cancel Order?</Text>
                    <Text style={styles.modalText}>
                        Are you sure you want to cancel this order? This action cannot be undone.
                    </Text>
                    <View style={styles.modalButtons}>
                        <Button
                            mode="text"
                            onPress={hideModal}
                            labelStyle={[styles.modalBtnLabel, { color: '#666' }]}
                        >
                            No, Keep it
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleConfirmCancel}
                            buttonColor="#9E2626"
                            labelStyle={styles.modalBtnLabel}
                        >
                            Yes, Cancel
                        </Button>
                    </View>
                </Modal>
            </Portal>

            <View style={styles.content}>
                <Text style={styles.title}>Confirm Order</Text>
                <Text style={styles.subtitle}>Review and confirm your order details.</Text>
            </View>

            {/* Bottom Navigation Buttons */}
            <Button
                mode="contained"
                onPress={showModal}
                style={styles.cancelButton}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
            >
                Cancel
            </Button>

            <Button
                mode="contained"
                onPress={handleGenerate}
                style={styles.generateButton}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
            >
                Generate
            </Button>

            {/* SNACKBARS */}
            <Snackbar
                visible={snackbarPlaced}
                onDismiss={() => setSnackbarPlaced(false)}
                duration={2000}
                style={styles.snackbarSuccess}
            >
                <Text style={styles.snackbarText}>Order has been placed successfully!</Text>
            </Snackbar>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={2000}
                style={styles.snackbarCancel}
            >
                <Text style={styles.snackbarText}>Order has been cancelled.</Text>
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F0ED',
    },
    content: {
        padding: 20,
        marginTop: 40,
    },
    title: {
        fontSize: 32,
        fontFamily: 'LeagueSpartan-Bold',
        color: '#0A0B32',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'LeagueSpartan',
        color: '#666',
        marginTop: 5,
    },
    // Loading Modal Styles
    loadingModalContainer: {
        backgroundColor: 'white',
        padding: 30,
        marginHorizontal: 80, // Make it smaller/centered
        borderRadius: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontFamily: 'LeagueSpartan-Bold',
        fontSize: 18,
        color: '#0A0B32',
    },
    // Modal Styles
    modalContainer: {
        backgroundColor: 'white',
        padding: 25,
        margin: 20,
        borderRadius: 20,
    },
    modalTitle: {
        fontFamily: 'LeagueSpartan-Bold',
        fontSize: 24,
        color: '#0A0B32',
        marginBottom: 10,
    },
    modalText: {
        fontFamily: 'LeagueSpartan',
        fontSize: 16,
        color: '#444',
        marginBottom: 25,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    modalBtnLabel: {
        fontFamily: 'LeagueSpartan-Bold',
        color: '#ffffff',
    },
    // Button Styles
    generateButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#AB8262',
        borderRadius: 12,
        elevation: 4,
    },
    cancelButton: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        backgroundColor: '#9E2626',
        borderRadius: 12,
        elevation: 4,
    },
    buttonContent: {
        paddingHorizontal: 15,
        height: 50,
    },
    buttonLabel: {
        fontFamily: 'LeagueSpartan-Bold',
        fontSize: 18,
        color: '#FFFFFF',
    },
    // Snackbar Styles
    snackbarSuccess: {
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