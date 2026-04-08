import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';

interface BiometricRegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PRIMARY_BLUE = '#64A77D';
const BORDER_GRAY = '#b9b9b9';
const TEXT_MAIN = '#1A1A1A';
const TEXT_SUB = '#4F4F4F';

export const BiometricRegisterModal = ({ visible, onClose, onConfirm }: BiometricRegisterModalProps) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
        <View style={styles.container}>
          
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>Registration Required</Text>
            <Text style={styles.subTitle}>
              You haven't set up biometrics for this device yet. Would you like to register now?
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={onClose}
            >
              <Text style={styles.outlineButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.outlineButton, { borderColor: PRIMARY_BLUE }]}
              onPress={() => {
                onConfirm();
                onClose();
              }}
            >
              <Text style={[styles.outlineButtonText, { color: PRIMARY_BLUE }]}>Register</Text>
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
    borderRadius: 12,
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
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  outlineButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  outlineButtonText: {
    fontSize: 18,
    color: BORDER_GRAY,
    fontWeight: '600',
  },
});