import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';

interface DeleteConfirmProps {
  visible: boolean;
  onClose: () => void;
  customerName: string;
  onConfirm: () => void;
}

// Design Constants from your reference
const DELETE_RED = '#FF4646';
const TEXT_MAIN = '#1A1A1A';
const TEXT_SUB = '#4F4F4F';
const BORDER_GRAY = '#b9b9b9';

export const DeleteConfirmModal = ({ visible, onClose, customerName, onConfirm }: DeleteConfirmProps) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
        <View style={styles.container}>
          
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>Delete Confirmation</Text>
            <Text style={styles.subTitle}>
              Are you sure you want to delete <Text style={styles.boldText}>{customerName}</Text>?
            </Text>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.buttonRow}>
            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={onClose}
            >
              <Text style={styles.outlineButtonText}>Cancel</Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                onConfirm();
                onClose();
              }}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>

        </View>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#FFF',
    borderRadius: 12, // Modern rounded look
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
    fontSize: 24, // High-contrast title
    fontWeight: 'bold',
    color: TEXT_MAIN,
    textAlign: 'center',
    marginBottom: 15,
    marginTop: -10,
  },
  subTitle: {
    fontSize: 16, // Clean body text
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
  },
  // Gray Outline Button (Cancel)
  outlineButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  outlineButtonText: {
    fontSize: 18,
    color: BORDER_GRAY,
    fontWeight: '600',
  },
  // Red Outline Button (Delete)
  deleteButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: DELETE_RED,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 18,
    color: DELETE_RED,
    fontWeight: '600',
  },
});