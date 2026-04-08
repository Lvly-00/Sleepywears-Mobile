import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';

interface CancelOrderModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Colors from your reference design
const DELETE_RED = '#FF4646';
const BORDER_GRAY = '#b9b9b9';
const TEXT_MAIN = '#1A1A1A';
const TEXT_SUB = '#4F4F4F';

export const CancelOrderModal = ({ visible, onClose, onConfirm }: CancelOrderModalProps) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
        <View style={styles.container}>
          
          {/* Header Content */}
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>Cancel Confirmation</Text>
            <Text style={styles.subTitle}>
              Are you sure you want to cancel <Text style={styles.boldText}>this order</Text>?
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={onClose}
            >
              <Text style={styles.outlineButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.solidButton}
              onPress={() => {
                onConfirm();
                onClose();
              }}
            >
              <Text style={styles.solidButtonText}>Delete</Text>
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
    borderRadius: 12, // Modern rounded corners
    padding: 0,
    marginHorizontal: 20,
  },
  container: {
    paddingVertical: 20,
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
    marginTop: -10,
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
    color: TEXT_SUB,
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
  solidButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: DELETE_RED,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  solidButtonText: {
    fontSize: 18,
    color: DELETE_RED,
    fontWeight: '600',
  },
});