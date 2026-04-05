import { Customer } from '@/src/types/customer';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Dialog, Divider, Portal, Text } from 'react-native-paper';

interface ActionDialogProps {
  visible: boolean;
  customer: Customer | null;
  onDismiss: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerActionDialog = ({ visible, customer, onDismiss, onEdit, onDelete }: ActionDialogProps) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setTimeout(() => setIsConfirmingDelete(false), 200);
    }
  }, [visible]);

  if (!customer) return null;

  const customerFullName = `${customer.first_name} ${customer.last_name}`;

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        {!isConfirmingDelete ? (
          <View>
            <View style={styles.headerContainer}>
              <Text style={styles.mainTitle}>What would you like to do?</Text>
              <Text style={styles.subTitle}>
                Would you like to edit or delete <Text style={styles.boldText}>{customerFullName}</Text>?
              </Text>
            </View>

            <Divider style={styles.divider} />

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => { onEdit(customer); onDismiss(); }}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setIsConfirmingDelete(true)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.headerContainer}>
              <Text style={styles.mainTitle}>Delete Confirmation</Text>
              <Text style={styles.subTitle}>
                Are you sure you want to delete <Text style={styles.boldText}>{customerFullName}</Text>?
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.row}>
              <TouchableOpacity 
                style={styles.halfButton} 
                onPress={() => setIsConfirmingDelete(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <View style={styles.verticalDivider} />

              <TouchableOpacity 
                style={styles.halfButton} 
                onPress={() => { onDelete(customer); onDismiss(); }}
              >
                <Text style={styles.confirmDeleteText}>Delete</Text>
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
    borderRadius: 30, // Matches the high radius in the image
    overflow: 'hidden',
  },
  headerContainer: {
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 20,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 17,
    color: '#000',
    textAlign: 'center',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: '#E0E0E0',
    height: 1,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    fontSize: 22,
    color: '#007AFF', // Standard iOS Blue
    fontWeight: '500',
  },
  deleteText: {
    fontSize: 22,
    color: '#FF3B30', // Standard iOS Red
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  halfButton: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  cancelText: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '600',
  },
  confirmDeleteText: {
    fontSize: 18,
    color: '#FF3B30',
    fontWeight: '700',
  },
});