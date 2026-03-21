import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActionModalProps {
  visible: boolean;
  customerName: string;
  onClose: () => void;
  onDelete: () => void;
}

export const ActionModal = ({ visible, customerName, onClose, onDelete }: ActionModalProps) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Content Area */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Delete Confirmation</Text>
          <Text style={styles.subtitle}>
            Are you sure you want to delete <Text style={{ fontWeight: 'bold' }}>{customerName}</Text>?
          </Text>
        </View>

        {/* Horizontal Divider */}
        <View style={styles.horizontalDivider} />

        {/* Button Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          {/* Vertical Divider */}
          <View style={styles.verticalDivider} />

          <TouchableOpacity style={styles.button} onPress={onDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Rounded corners like the image
    overflow: 'hidden',
  },
  textContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#000',
    textAlign: 'center',
    lineHeight: 22,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  buttonRow: {
    flexDirection: 'row',
    height: 55,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  cancelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A237E', 
  },
  deleteText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF0000', 
  },
});