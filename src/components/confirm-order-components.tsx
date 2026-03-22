import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

/** 1. Section Header Component **/
export const SectionHeader = ({ title, actionText, onAction }: { title: string, actionText?: string, onAction?: () => void }) => (
    <View style={compStyles.sectionHeader}>
        <Text style={compStyles.title}>{title}</Text>
        {actionText && (
            <TouchableOpacity
                style={actionText.includes('View') ? null : compStyles.editBtn}
                onPress={onAction}
            >
                <Text style={actionText.includes('View') ? compStyles.viewAllText : compStyles.editBtnText}>
                    {actionText}
                </Text>
            </TouchableOpacity>
        )}
    </View>
);

/** 2. Order Item Card **/
// Changed from Surface to View to remove all library-default shadows
export const OrderCard = ({ code, name, price }: { code: string, name: string, price: string | number }) => (
    <View style={compStyles.orderCard} >
        <Text style={compStyles.itemCode}>{code}</Text>
        <Text style={compStyles.itemName}>{name}</Text>
        <Text style={compStyles.itemPrice}>₱ {Number(price).toLocaleString()}</Text>
    </View>
);

/** 3. Underlined Input with Label **/
interface UnderlinedInputProps extends TextInputProps {
    label: string;
    required?: boolean;
    error?: string;
}
export const UnderlinedInput = ({ label, required, error, ...props }: UnderlinedInputProps) => (
    <View style={compStyles.inputContainer}>
        <Text style={compStyles.fieldLabel}>
            {label} {required && <Text style={{ color: 'red' }}>*</Text>}
        </Text>
        <TextInput
            {...props}
            placeholderTextColor="#CCC"
            style={[compStyles.underlinedInput, error ? compStyles.inputError : null]}
        />
    </View>
);

const compStyles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    editBtn: {
        backgroundColor: '#8B5E3C',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 6,
    },
    editBtnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 13,
    },
    viewAllText: {
        color: '#181BA2',
        fontSize: 13,
        fontWeight: '500',
    },
    orderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#D8D8DB', // This provides the flat outline seen in your reference
    },
    itemCode: {
        fontSize: 16,
        fontWeight: 'bold',
        width: 60,
    },
    itemName: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: '500',
    },
    inputContainer: {
        marginBottom: 15,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0D0F66',
        marginBottom: 5,
    },
    underlinedInput: {
        borderBottomWidth: 1,
        borderBottomColor: '#AAA',
        paddingVertical: 8,
        fontSize: 14,
        color: '#000',
    },
    inputError: {
        borderBottomColor: '#9E2626',
    },
});