import api from "@/src/services/api";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Dialog, Portal, Text } from "react-native-paper";

interface Order {
  id: number;
  total: number;
  first_name?: string;
  last_name?: string;
  customer_name?: string;
  [key: string]: any;
}

interface AddPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdated: (updatedOrder: any) => void;
}

// Reference Design Constants
const PRIMARY_BLUE = '#0A256C';
const PAYMENT_GREEN = '#64A77D';
const CANCEL_GRAY = '#b9b9b9';
const TEXT_MAIN = '#1A1A1A';
const TEXT_SUB = '#4F4F4F';
const SUCCESS_GREEN = '#65A781';

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
      <Dialog
        visible={visible}
        onDismiss={!submitting ? onClose : undefined}
        style={styles.dialog}
      >
        <View style={styles.container}>

          {/* 1. HEADER SECTION */}
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>Payment Method</Text>
            <Text style={styles.subTitle}>
              Select a payment method for{"\n"}
              <Text style={styles.boldText}>
                {order?.first_name
                  ? `${order.first_name} ${order.last_name}`
                  : (order?.customer_name || "Guest")}
              </Text>
            </Text>

            <Text style={styles.amountText}>
              ₱{Number(order?.total || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {/* 2. GRID SELECTION */}
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
              </TouchableOpacity>
            ))}
          </View>

          {/* 3. BUTTON ROW ACTIONS */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.outlineButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.solidButton,
                { borderColor: method ? PAYMENT_GREEN : '#E5E5E5' }
              ]}
              onPress={handleSave}
              disabled={!method || submitting}
            >
              {submitting ? (
                <ActivityIndicator color={PAYMENT_GREEN} size="small" />
              ) : (
                <Text style={[
                  styles.solidButtonText,
                  !method && { color: '#CCC' }
                ]}>
                  Confirm Payment
                </Text>
              )}
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
    marginBottom: 25,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_MAIN,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: -10,
  },
  subTitle: {
    fontSize: 16,
    color: TEXT_SUB,
    textAlign: 'center',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '700',
    color: TEXT_MAIN,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D4324', // Keeping your brand brown for the amount
    marginTop: 15,
  },
  // Selection Grid
  methodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: '100%',
    marginBottom: 30,
  },
  methodBox: {
    width: "48%",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  methodBoxSelected: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },
  methodText: {
    fontSize: 16,
    color: TEXT_SUB,
    fontWeight: "500",
  },
  methodTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  // Footer Button Row
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  outlineButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: CANCEL_GRAY,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  outlineButtonText: {
    fontSize: 18,
    color: CANCEL_GRAY,
    fontWeight: '600',
  },
  solidButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: PAYMENT_GREEN,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  solidButtonText: {
    fontSize: 18,
    color: PAYMENT_GREEN,
    fontWeight: '600',
  },
});

export default AddPaymentModal;