import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

export const DeleteConfirmationModal = ({
  visible,
  onCancel,
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete?",
  loading = false
}: DeleteConfirmationModalProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          
          {/* Main Content View */}
          <View style={loading ? { opacity: 0.5 } : {}}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                  style={[styles.button, styles.borderRight]} 
                  onPress={onCancel}
                  disabled={loading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                  style={styles.button} 
                  onPress={onConfirm}
                  disabled={loading}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Separate Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#1C4D8D" />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  alertContainer: { 
    width: '100%', 
    maxWidth: 340, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    overflow: 'hidden',
    position: 'relative', // Necessary for the absolute loading overlay
  },
  textContainer: { 
    paddingVertical: 25, 
    paddingHorizontal: 20, 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#000', 
    marginBottom: 12 
  },
  message: { 
    fontSize: 16, 
    color: '#000', 
    textAlign: 'center', 
    lineHeight: 22 
  },
  buttonRow: { 
    flexDirection: 'row', 
    borderTopWidth: StyleSheet.hairlineWidth, 
    borderTopColor: '#CCCCCC' 
  },
  button: { 
    flex: 1, 
    height: 55, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  borderRight: { 
    borderRightWidth: StyleSheet.hairlineWidth, 
    borderRightColor: '#CCCCCC' 
  },
  cancelText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#203E8E' 
  },
  deleteText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#FF1100' 
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  }
});