import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface DeleteConfirmProps {
  visible: boolean;
  onClose: () => void;
  customerName: string;
  onConfirm: () => void;
}

export const DeleteConfirmModal = ({ visible, onClose, customerName, onConfirm }: DeleteConfirmProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
            <View style={styles.container}>
              <Text style={styles.title}>Delete Confirmation</Text>
              <Text style={styles.subtitle}>
                Are you sure you want to delete <Text style={{ fontWeight: 'bold' }}>{customerName}</Text>?
              </Text>

              <View style={styles.row}>
                <TouchableOpacity style={styles.button} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.button} onPress={onConfirm}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
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

  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  button: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },

  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },

  cancelText: {
    color: '#1A237E',
    fontSize: 18,
    fontWeight: '600',
  },

  deleteText: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: '600',
  },
});