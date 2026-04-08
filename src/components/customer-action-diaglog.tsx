import { Customer } from '@/src/types/customer';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';

interface ActionDialogProps {
  visible: boolean;
  customer: Customer | null;
  onDismiss: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

// Reference Design Colors
const DELETE_RED = '#FF4646';
const PRIMARY_BLUE = '#0A256C';
const CANCEL_GRAY = '#b9b9b9';
const TEXT_MAIN = '#1A1A1A';
const TEXT_SUB = '#4F4F4F';

export const CustomerActionDialog = ({ visible, customer, onDismiss, onEdit, onDelete }: ActionDialogProps) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => setIsConfirmingDelete(false), 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!customer) return null;

  const customerFullName = `${customer.first_name} ${customer.last_name}`;

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <View style={styles.container}>

          {!isConfirmingDelete ? (
            /* --- SELECTION STATE --- */
            <>
              <View style={styles.headerContainer}>
                <Text style={styles.mainTitle}>What would you like to do?</Text>
                <Text style={styles.subTitle}>
                  Would you like to edit or delete <Text style={styles.boldText}>{customerFullName}</Text>?
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.outlineButton, { borderColor: PRIMARY_BLUE }]}
                  onPress={() => { onEdit(customer); onDismiss(); }}
                >
                  <Text style={[styles.outlineButtonText, { color: PRIMARY_BLUE }]}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.outlineButton, { borderColor: DELETE_RED }]}
                  onPress={() => setIsConfirmingDelete(true)}
                >
                  <Text style={[styles.outlineButtonText, { color: DELETE_RED }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* --- CONFIRMATION STATE --- */
            <>
              <View style={styles.headerContainer}>
                <Text style={styles.mainTitle}>Delete Confirmation</Text>
                <Text style={styles.subTitle}>
                  Are you sure you want to delete <Text style={styles.boldText}>{customerFullName}</Text>?
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.outlineButton, { borderColor: CANCEL_GRAY }]}
                  onPress={() => setIsConfirmingDelete(false)}
                >
                  <Text style={[styles.outlineButtonText, { color: CANCEL_GRAY }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.outlineButton, { borderColor: DELETE_RED }]}
                  onPress={() => { onDelete(customer); onDismiss(); }}
                >
                  <Text style={[styles.outlineButtonText, { color: DELETE_RED }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
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
    borderColor: '#b9b9b9',
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
    borderColor: DELETE_RED,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // marginRight: 8,
    // backgroundColor: DELETE,
  },
  outlineButtonText: {
    fontSize: 18,
    color: '#b9b9b9',
    fontWeight: '600',
  },
  solidButtonText: {
    fontSize: 18,
    color: DELETE_RED,
    fontWeight: '600',
  },
});