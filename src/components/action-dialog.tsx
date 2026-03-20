import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Dialog, Divider, Portal, Text } from 'react-native-paper';

interface ActionDialogProps {
  visible: boolean;
  item: any;
  onDismiss: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ActionDialog = ({ visible, item, onDismiss, onEdit, onDelete }: ActionDialogProps) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!visible) setIsConfirmingDelete(false);
  }, [visible]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        {/* 
           Notice below: We use <> without any props. 
           The styling is handled by the internal <View>.
        */}
        {!isConfirmingDelete ? (
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.mainTitle}>What would you like to do?</Text>
              <Text style={styles.subTitle}>
                Would you like to edit or delete the{' '}
                <Text style={styles.boldText}>{item?.name}</Text>?
              </Text>
            </View>

            <Divider style={styles.divider} />

            <TouchableOpacity style={styles.actionButton} onPress={() => { onEdit(); onDismiss(); }}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity style={styles.actionButton} onPress={() => setIsConfirmingDelete(true)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.mainTitle}>Delete Confirmation</Text>
              <Text style={styles.subTitle}>
                Are you sure you want to delete the{' '}
                <Text style={styles.boldText}>{item?.name}</Text>?
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.row}>
              <TouchableOpacity style={styles.halfButton} onPress={() => setIsConfirmingDelete(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <View style={styles.verticalDivider} />

              <TouchableOpacity style={styles.halfButton} onPress={() => { onDelete(); onDismiss(); }}>
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    overflow: 'hidden',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  headerContainer: {
    paddingHorizontal: 30,
    paddingTop: 25,
    paddingBottom: 25,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 15,
  },
 subTitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    lineHeight: 22, 
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  divider: {
    backgroundColor: '#E0E0E0',
    height: 1,
    width: '100%',
  },
  actionButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Row for Confirmation Buttons
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
    height: '100%',
  },
  editText: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  deleteText: {
    fontSize: 20,
    color: '#FF0000',
    fontWeight: 'bold',
  },
  cancelText: {
    fontSize: 20,
    color: '#2A3C82',
    fontWeight: 'bold',
  },
  confirmDeleteText: {
    fontSize: 20,
    color: '#FF0000',
    fontWeight: 'bold',
  },
});