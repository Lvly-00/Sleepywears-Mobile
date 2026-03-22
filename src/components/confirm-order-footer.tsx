import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmOrderFooterProps {
    total: number;
    isSubmitting: boolean;
    onCancel: () => void;
    onGenerate: () => void;
}

export const ConfirmOrderFooter = ({ total, isSubmitting, onCancel, onGenerate }: ConfirmOrderFooterProps) => {
    return (
        <View style={styles.footer}>
            {/* Left Side: Subtotal Info */}
            <View style={styles.subtotalContainer}>
                <Text style={styles.subtotalLabel}>Total: </Text>
                <Text style={styles.subtotalValue}>₱ {total.toLocaleString()}</Text>
            </View>

            {/* Right Side: Action Buttons matching the image */}
            <View style={styles.actionContainer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                    <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.generateBtn, isSubmitting && styles.disabled]} 
                    onPress={onGenerate}
                    disabled={isSubmitting}
                >
                    <Text style={styles.btnText}>
                        {isSubmitting ? '...' : 'Generate'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        paddingVertical: 25,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#F2E8E1', // Subtle warm divider
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    subtotalContainer: {
        flexDirection: 'column',
    },
    subtotalLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    subtotalValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0D0F66', // Deep blue for the total
    },
    actionContainer: {
        flexDirection: 'row',
        gap: 12, // Space between buttons
    },
    cancelBtn: {
        backgroundColor: '#9E2626', // Dark Red from image
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 90,
        alignItems: 'center',
    },
    generateBtn: {
        backgroundColor: '#8B5E3C', // Brown from image
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 90,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    disabled: {
        opacity: 0.6,
    },
});