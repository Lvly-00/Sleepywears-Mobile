import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface StatusBadgeProps {
    status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const isActive = status.toLowerCase() === 'active';
    return (
        <View style={[styles.badge, { backgroundColor: isActive ? '#64A77D' : '#FF4646' }]}>
            <Text style={styles.badgeText}>{status.toUpperCase()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        minWidth: 60,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
});