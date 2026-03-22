import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OrderFooterProps {
    subtotal: number;
    count: number;
    onPress: () => void;
}

export const OrderFooter = ({ subtotal, count, onPress }: OrderFooterProps) => {
    return (
        <View style={styles.footer}>
            <View style={styles.subtotalContainer}>
                <Text style={styles.subtotalLabel}>Subtotal: </Text>
                <Text style={styles.subtotalValue}>₱ {subtotal.toLocaleString()}</Text>
            </View>

            <TouchableOpacity
                style={[styles.button, count === 0 && styles.disabled]}
                onPress={onPress}
                disabled={count === 0}
            >
                <Text style={styles.buttonText}>Place Order ({count})</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    subtotalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    subtotalLabel: {
        fontSize: 18,
        color: '#333',
    },

    subtotalValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
    },

    button: {
        backgroundColor: '#8E5D36',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },

    disabled: {
        backgroundColor: '#A68B75',
    },

    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});