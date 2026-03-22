import api from "@/src/services/api";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider, Modal, Portal, Text } from "react-native-paper";

interface Order {
  id: number;
  total: number;
  customer_name?: string;
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setMethod("");
      setSubmitting(false);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!method || !order) return;
    setSubmitting(true);
    try {
      const payload = {
        payment_method: method,
        total: order.total,
        payment_status: "Paid",
      };
      await api.post(`/orders/${order.id}/payments`, payload);
      const updatedOrderRes = await api.get(`/orders/${order.id}`);
      onOrderUpdated(updatedOrderRes.data);
      onClose();
    } catch (err) {
      console.error(err);
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
        <View style={styles.content}>
          {/* 1. HEADER SECTION */}
          <View style={styles.header}>
            <Text style={styles.title}>Payment Method</Text>
            <Text style={styles.subText}>
              Select a payment method for {"\n"}
              <Text style={styles.boldText}>
                {order?.customer_name || `Order #${order?.id}`}
              </Text>
            </Text>
            <Text style={styles.amountText}>
              ₱{Number(order?.total || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {/* 2. SYMMETRICAL 2x2 SELECTION SECTION */}
          <View style={styles.methodGrid}>
            {paymentMethods.map((m) => (
              <TouchableOpacity
                key={m}
                activeOpacity={0.7}
                style={[
                  styles.methodBox,
                  method === m && styles.methodBoxSelected
                ]}
                onPress={() => setMethod(m)}
                disabled={submitting}
              >
                <Text style={[
                  styles.methodText,
                  method === m && styles.methodTextSelected
                ]}>
                  {m}
                </Text>
                {method === m && <View style={styles.checkMark} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* 3. FOOTER ACTIONS */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleSave}
              disabled={!method || submitting}
            >
              <Divider style={styles.topDivider} />
              {submitting ? (
                <ActivityIndicator color="#65A781" />
              ) : (
                <Text style={[styles.confirmText, !method && styles.disabledText]}>
                  Confirm Payment
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.actionButton} 
                onPress={onClose} 
                disabled={submitting}
            >
              <Divider style={styles.topDivider} />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    marginHorizontal: 40,
    borderRadius: 14,
    overflow: "hidden",
  },
  content: {
    paddingTop: 24,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
    lineHeight: 18,
  },
  boldText: {
    fontWeight: "800",
      color: "#000000",
  },
  amountText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#5D4324",
    marginTop: 12,
  },
  // 2x2 Grid Layout
  methodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  methodBox: {
    width: "48%", // Symmetrical 2x2
    height: 40,
    borderRadius: 8, // Less rounded, more modern iOS style
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: 'relative',
  },
  methodBoxSelected: {
    backgroundColor: "#232D80",
    borderColor: "#3946be",
  },
  methodText: {
    fontSize: 15,
    color: "#555",
    fontWeight: "500",
  },
  methodTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  checkMark: {
    position: 'absolute',
    top: 5,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  // Footer
  footer: {
    width: "100%",
  },
  actionButton: {
    width: "100%",
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  topDivider: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  confirmText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#65A781",
  },
  cancelText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF3B30",
  },
  disabledText: {
    color: "#D1E3D8",
  },
});

export default AddPaymentModal;