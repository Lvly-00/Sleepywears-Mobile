// import React from 'react';
// import { StyleSheet, Text, View } from 'react-native';
// import { Button, Modal, Portal } from 'react-native-paper';

// interface ConfirmationModalProps {
//   visible: boolean;
//   onDismiss: () => void;
//   onConfirm: () => void;
//   title: string;
//   message: string;
//   confirmLabel?: string;
//   cancelLabel?: string;
//   confirmColor?: string;
// }

// const ConfirmationModal = ({
//   visible,
//   onDismiss,
//   onConfirm,
//   title,
//   message,
//   confirmLabel = "Confirm",
//   cancelLabel = "Cancel",
//   confirmColor = "#9E2626", // Default to Red
// }: ConfirmationModalProps) => {
//   return (
//     <Portal>
//       <Modal
//         visible={visible}
//         onDismiss={onDismiss}
//         contentContainerStyle={styles.modalContainer}
//       >
//         <Text style={styles.modalTitle}>{title}</Text>
//         <Text style={styles.modalText}>{message}</Text>
        
//         <View style={styles.modalButtons}>
//           <Button 
//             mode="text" 
//             onPress={onDismiss} 
//             labelStyle={[styles.btnLabel, { color: '#666' }]}
//           >
//             {cancelLabel}
//           </Button>
//           <Button 
//             mode="contained" 
//             onPress={onConfirm} 
//             buttonColor={confirmColor}
//             labelStyle={styles.btnLabel}
//           >
//             {confirmLabel}
//           </Button>
//         </View>
//       </Modal>
//     </Portal>
//   );
// };

// export default ConfirmationModal;

// const styles = StyleSheet.create({
//   modalContainer: {
//     backgroundColor: 'white',
//     padding: 25,
//     margin: 20,
//     borderRadius: 20,
//   },
//   modalTitle: {
//     fontFamily: 'LeagueSpartan-Bold',
//     fontSize: 24,
//     color: '#0A0B32',
//     marginBottom: 10,
//   },
//   modalText: {
//     fontFamily: 'LeagueSpartan',
//     fontSize: 16,
//     color: '#444',
//     marginBottom: 25,
//     lineHeight: 20,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     gap: 10,
//     color: '#ffffff',
//   },
//   btnLabel: {
//     fontFamily: 'LeagueSpartan-Bold',
//     fontSize: 14,
//   },
// });