import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const UpdateButton = ({ onPress, loading }: { onPress: () => void; loading: boolean }) => (
    <View style={styles.container}>
        <TouchableOpacity
            style={styles.button}
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <Text style={styles.text}>Update</Text>
            )}
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        marginTop: 30,
    },
    button: {
        backgroundColor: '#0A1D56',
        width: '100%',
        height: 55,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#FFF',
        fontFamily: 'LeagueSpartan-Bold',
        fontSize: 18,
        letterSpacing: 0.5,
    },
});