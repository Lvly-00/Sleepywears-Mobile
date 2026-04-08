import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';

interface ActionDialogProps {
  visible: boolean;
  item: any;
  onDismiss: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// The specific pink from your image
const DELETE = '#FF4646';

export const ActionDialog = ({ visible, item, onDismiss, onEdit, onDelete }: ActionDialogProps) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!visible) setIsConfirmingDelete(false);
  }, [visible]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        {!isConfirmingDelete ? (
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={styles.mainTitle}>What would you like to do?</Text>
              <Text style={styles.subTitle}>
                Would you like to edit or delete the <Text style={styles.boldText}>{item?.name || 'this item'}</Text>?
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.outlineButton, { borderColor: '#0A256C' }]}
                onPress={() => { onEdit(); onDismiss(); }}
              >
                <Text style={[styles.outlineButtonText, { color: '#0A256C' }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.solidButton}
                onPress={() => setIsConfirmingDelete(true)}
              >
                <Text style={styles.solidButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={styles.mainTitle}>Confirm to delete?</Text>
              <Text style={styles.subTitle}>
                Are you sure you want to delete this {item?.name || '1 item(s)'} from cart?
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => setIsConfirmingDelete(false)}
              >
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.solidButton}
                onPress={() => { onDelete(); onDismiss(); }}
              >
                <Text style={styles.solidButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#FFF',
    borderRadius: 12, // Matching the slight rounding in the image
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
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: -10,
  },
  subTitle: {
    fontSize: 16,
    color: '#4F4F4F',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  boldText: {
    fontWeight: '700',
    color: '#4F4F4F',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  // Matches the "Cancel" button style in your image
  outlineButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: DELETE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  // Matches the "Delete" button style in your image
  solidButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: DELETE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  outlineButtonText: {
    fontSize: 18,
    color: DELETE,
    fontWeight: '600',
  },
  solidButtonText: {
    fontSize: 18,
    color: DELETE,
    fontWeight: '600',
  },
});