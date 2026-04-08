import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';

interface ActionModalProps {
    visible: boolean;
    onClose: () => void;
    orderId: string | number;
    onAddPayment: () => void;
    onDeletePress: () => void;
    isPaid?: boolean;
}

// Design Constants
const DELETE_RED = '#FF4646';
const PAYMENT_GREEN = '#64A77D';
const CANCEL_GRAY = '#b9b9b9';
const TEXT_MAIN = '#1A1A1A';
const TEXT_SUB = '#4F4F4F';

export const OrderActionModal = ({
    visible,
    onClose,
    orderId,
    onAddPayment,
    onDeletePress,
    isPaid
}: ActionModalProps) => {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
                <View style={styles.container}>

                    {/* Header Section */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.mainTitle}>What would you like to do?</Text>
                        <Text style={styles.subTitle}>
                            {isPaid
                                ? "Would you like to delete "
                                : "Would you like to add payment or delete "}
                            Order <Text style={styles.boldText}>#{orderId}</Text>?
                        </Text>
                    </View>

                    {/* Action Buttons Row */}
                    <View style={styles.buttonRow}>
                        {!isPaid ? (
                            <>
                                {/* Add Payment Button */}
                                <TouchableOpacity
                                    style={[styles.outlineButton, { borderColor: PAYMENT_GREEN }]}
                                    onPress={() => {
                                        onAddPayment();
                                        onClose();
                                    }}
                                >
                                    <Text style={[styles.outlineButtonText, { color: PAYMENT_GREEN }]}>
                                        Add Payment
                                    </Text>
                                </TouchableOpacity>

                                {/* Delete Button */}
                                <TouchableOpacity
                                    style={[styles.outlineButton, { borderColor: DELETE_RED }]}
                                    onPress={() => {
                                        onDeletePress();
                                        onClose();
                                    }}
                                >
                                    <Text style={[styles.outlineButtonText, { color: DELETE_RED }]}>
                                        Delete
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                {/* Cancel/Back Button */}
                                <TouchableOpacity
                                    style={[styles.outlineButton, { borderColor: CANCEL_GRAY }]}
                                    onPress={onClose}
                                >
                                    <Text style={[styles.outlineButtonText, { color: CANCEL_GRAY }]}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                {/* Delete Button */}
                                <TouchableOpacity
                                    style={[styles.outlineButton, { borderColor: DELETE_RED }]}
                                    onPress={() => {
                                        onDeletePress();
                                        onClose();
                                    }}
                                >
                                    <Text style={[styles.outlineButtonText, { color: DELETE_RED }]}>
                                        Delete
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    dialog: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 0,
        marginHorizontal: 20,
    },
    container: {
        paddingVertical: 25,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 35,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: TEXT_MAIN,
        textAlign: 'center',
        marginBottom: 15,
        marginTop: -20,
    },
    subTitle: {
        fontSize: 16,
        color: TEXT_SUB,
        textAlign: 'center',
        paddingHorizontal: 10,
        lineHeight: 22,
    },
    boldText: {
        fontWeight: '700',
        color: TEXT_MAIN,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 12,
    },
    outlineButton: {
        flex: 1,
        height: 52,
        borderWidth: 1,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlineButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});