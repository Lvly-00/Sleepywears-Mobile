import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { StatusBadge } from './status-badge';

interface CollectionCardProps {
  item: {
    id: number;
    name: string;
    status: string;
    available_count: number; // Updated from backend
    total_sales: number;     // Updated from backend
  };
  onPress: () => void;
  onLongPress: (item: any) => void;
}

export const CollectionCard = ({ item, onPress, onLongPress }: CollectionCardProps) => {
  const collectionNumber = item.name.match(/\d+/) || "";
  const isActive = item.status.toLowerCase() === 'active';
  const count = item.available_count || 0;


  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={onPress}
        onLongPress={() => onLongPress(item)}
        style={({ pressed }) => [
          styles.cardContainer,
          pressed && { backgroundColor: '#B6CAFF' }
        ]}
      >
        <View style={styles.numberSquare}>
          <Text style={styles.numberText}>{collectionNumber}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.collectionTitle}>{item.name}</Text>
            <StatusBadge status={item.status} />
          </View>

          <Text style={styles.subText}>
            {isActive
              ? `${count} ${count === 1 ? 'item left' : 'items left'}`
              : `You've earned ₱${item.total_sales?.toLocaleString() || 0} for this collection`
            }
          </Text>
        </View>
      </Pressable>
      <Divider style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFF'
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  numberSquare: {
    width: 60,
    height: 60,
    backgroundColor: '#00114D',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  numberText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold'
  },
  cardContent: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000'
  },
  subText: {
    fontSize: 14,
    color: '#444'
  },
  divider: {
    backgroundColor: '#D8D8DB',
    marginHorizontal: 20,
  },
});