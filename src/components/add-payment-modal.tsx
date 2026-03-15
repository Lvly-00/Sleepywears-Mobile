import api from "@/src/services/api"; // Adjust based on your file structure
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import {
    Button,
    HelperText,
    IconButton,
    Modal,
    Portal,
    Text,
    TextInput
} from "react-native-paper";

interface Order {
  id: number;
  total: number;
  [key: string]: any;
}

interface AddPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdated: (updatedOrder: any) => void;
}

const AddPaymentModal = ({ visible, onClose, order, onOrderUpdated }: AddPaymentModalProps) => {
  const [method, setMethod] = useState<string>("");
  const [additionalFee, setAdditionalFee] = useState<string>("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setMethod("");
      setAdditionalFee("0");
      setError(null);
      setSubmitting(false);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!method) {
      setError("Please select a payment method");
      return;
    }
    if (!order) return;

    setSubmitting(true);
    try {
      const feeNum = parseFloat(additionalFee) || 0;
      const totalAmount = Number(order.total) + feeNum;

      const payload = {
        payment_method: method,
        total: totalAmount,
        payment_status: "Paid",
        additional_fee: feeNum,
      };

      await api.post(`/orders/${order.id}/payments`, payload);
      
      // Fetch updated order info
      const updatedOrderRes = await api.get(`/orders/${order.id}`);
      onOrderUpdated(updatedOrderRes.data);
      onClose();
    } catch (err) {
      console.error("Error saving payment:", err);
      setError("Failed to process payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = ["Cash", "GCash", "Paypal", "Bank"];

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={!submitting ? onClose : undefined}
        contentContainerStyle={styles.modalContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.header}>
            <IconButton 
                icon="close" 
                onPress={onClose} 
                disabled={submitting} 
                iconColor="#AB8262"
            />
            <Text style={styles.title}>Add Payment</Text>
            <View style={{ width: 48 }} /> 
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>
              ₱{Math.floor(order?.total || 0).toLocaleString("en-PH")}
            </Text>

            <Text style={styles.label}>Select Mode of Payment</Text>
            <View style={styles.methodGrid}>
              {paymentMethods.map((m) => (
                <Button
                  key={m}
                  mode={method === m ? "contained" : "outlined"}
                  onPress={() => setMethod(m)}
                  style={styles.methodButton}
                  buttonColor={method === m ? "#AB8262" : undefined}
                  textColor={method === m ? "#FFF" : "#AB8262"}
                  disabled={submitting}
                >
                  {m}
                </Button>
              ))}
            </View>
            {error && <HelperText type="error">{error}</HelperText>}

            <TextInput
              label="Additional Fee (Optional)"
              value={additionalFee}
              onChangeText={setAdditionalFee}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              outlineColor="#DDD"
              activeOutlineColor="#AB8262"
              disabled={submitting}
            />

            <Button
              mode="contained"
              onPress={handleSave}
              loading={submitting}
              disabled={submitting}
              style={styles.submitBtn}
              contentStyle={styles.submitBtnContent}
            >
              Confirm Payment
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  body: {
    padding: 20,
  },
  totalLabel: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    marginBottom: 5,
  },
  totalAmount: {
    textAlign: "center",
    fontSize: 42,
    fontWeight: "700",
    color: "#5D4324",
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  methodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  methodButton: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 10,
  },
  input: {
    marginTop: 10,
    backgroundColor: "#FFF",
  },
  submitBtn: {
    marginTop: 30,
    backgroundColor: "#AB8262",
    borderRadius: 12,
  },
  submitBtnContent: {
    paddingVertical: 8,
  },
});

export default AddPaymentModal;