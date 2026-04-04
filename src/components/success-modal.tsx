import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Modal, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';


const { width } = Dimensions.get('window');

interface SuccessModalProps {
    visible: boolean;
    message: string;
}

const SuccessModal = ({ visible, message }: SuccessModalProps) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.container}>
                        <FontAwesome  name="check-square" size={24} color="#4CAF50" />
                        <Text style={styles.modalText}>
                            {message}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dims the background
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        paddingVertical: 25,
        paddingHorizontal: 40,
        borderRadius: 8,
        width: width * 0.85,
        alignItems: 'center',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // Shadow for Android
        elevation: 5,
    },
    modalText: {
        fontSize: 18,
        color: '#000000',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 24,
        paddingLeft: 10,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default SuccessModal;