import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface ActionModalProps {
    visible: boolean;
    onClose: () => void;
    customerName: string;
    onAddPayment: () => void;
    onDeletePress: () => void;
}

export const OrderActionModal = ({ visible, onClose, customerName, onAddPayment, onDeletePress }: ActionModalProps) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            {/* 1. Background listener to close */}
            <TouchableOpacity 
                style={styles.overlay} 
                activeOpacity={1} 
                onPress={onClose}
            >
                {/* 2. Inner listener to prevent closing when clicking the white box */}
                <TouchableWithoutFeedback>
                    <View style={styles.container}>
                        <Text style={styles.title}>What would you like to do?</Text>
                        <Text style={styles.subtitle}>
                            Would you like to add payment or delete <Text style={{ fontWeight: 'bold' }}>{customerName}</Text>?
                        </Text>

                        <TouchableOpacity style={[styles.button, styles.borderTop]} onPress={onAddPayment}>
                            <Text style={styles.addPaymentText}>Add Payment</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.button, styles.borderTop]} onPress={onDeletePress}>
                            <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        alignItems: 'center',
        paddingTop: 20,
    },

    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 15,
    },

    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        color: '#333',
        paddingHorizontal: 20,
        marginBottom: 20,
    },

    button: {
        width: '100%',
        paddingVertical: 15,
        alignItems: 'center',
    },

    borderTop: {
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },

    addPaymentText: {
        color: '#64A77D',
        fontSize: 18,
        fontWeight: '600',
    },

    deleteText: {
        color: '#FE1900',
        fontSize: 18,
        fontWeight: '600',
    },
});