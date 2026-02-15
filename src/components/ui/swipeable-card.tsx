import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { IconButton, TouchableRipple } from 'react-native-paper';

type SwipeableCardProps = {
  item: any;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function SwipeableCard({ item, onPress, onEdit, onDelete }: SwipeableCardProps) {
  const handleDelete = () => {
    if (!onDelete) return;

    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const renderRightActions = () => (
    <View style={styles.actionsContainer}>
      {onEdit && (
        <IconButton
          icon="pencil"
          size={24}
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={onEdit}
        />
      )}
      {onDelete && (
        <IconButton
          icon="delete"
          size={24}
          style={[styles.actionButton, { backgroundColor: '#F44336' }]}
          onPress={handleDelete}
        />
      )}
    </View>
  );

  return (
    <GestureHandlerRootView>
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableRipple
          onPress={onPress}
          rippleColor="rgba(10, 11, 50, .1)"
          style={styles.card}
        >
          <View style={styles.content}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.name || 'Unnamed'}</Text>
              <Text style={styles.sub}>
                Stock: {Array.isArray(item.items) ? item.items.filter((i: any) => i.status === 'Available').length : 0} | 
                Qty: {item.qty || 0}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.status, { color: item.status === 'Active' ? '#276D58' : '#7A7A7A' }]}>
                {item.status}
              </Text>
              <Text style={styles.price}>
                ₱{new Intl.NumberFormat('en-PH').format(Math.floor(item.capital || 0))}
              </Text>
            </View>
          </View>
        </TouchableRipple>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  content: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: 'LeagueSpartan-Bold', fontSize: 18, color: '#0A0B32' },
  sub: { fontFamily: 'LeagueSpartan', fontSize: 14, color: '#666' },
  status: { fontFamily: 'LeagueSpartan-Bold', fontSize: 14, textTransform: 'uppercase' },
  price: { fontFamily: 'LeagueSpartan', fontSize: 14, color: '#AB8262' },
  actionsContainer: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { borderRadius: 0, marginVertical: 0 },
});
