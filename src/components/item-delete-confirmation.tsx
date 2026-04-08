import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

// Colors from the design above
const DELETE_RED = '#FF4646';
const TEXT_MAIN = '#1A1A1A';
const TEXT_SUB = '#4F4F4F';
const BORDER_GRAY = '#b9b9b9';

export const DeleteConfirmationModal = ({
  visible,
  onCancel,
  onConfirm,
  title = "Confirm to delete?",
  message = "Are you sure you want to delete this item?",
  loading = false
}: DeleteConfirmationModalProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>

          <View style={[styles.container, loading && { opacity: 0.5 }]}>
            {/* Text Content */}
            <View style={styles.headerContainer}>
              <Text style={styles.mainTitle}>{title}</Text>
              <Text style={styles.subTitle}>{message}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={onCancel}
                disabled={loading}
              >
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={onConfirm}
                disabled={loading}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Loading State Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={DELETE_RED} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dimmed background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 0,
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
    fontSize: 24, // From design 1
    fontWeight: 'bold',
    color: TEXT_MAIN,
    textAlign: 'center',
    marginBottom: 15,
    marginTop: -10,
  },
  subTitle: {
    fontSize: 16, // From design 1
    color: TEXT_SUB,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  // Gray outline button for Cancel
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
  // Red outline button for Delete
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});