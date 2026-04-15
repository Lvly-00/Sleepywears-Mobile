import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 3;

const fixImageUrl = (url?: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith('items/') || !url.includes('.')) {
        return `https://res.cloudinary.com/dz0q8u0ia/image/upload/f_auto,q_auto/${url}`;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://res.cloudinary.com/dz0q8u0ia/image/upload/f_auto,q_auto/${url.replace(/^public\//, '')}`;
};

interface ItemCardProps {
    item: any;
    isSelected: boolean;
    isSelectionMode: boolean;
    onPress: () => void;
    onLongPress: () => void;
}

export const ItemCard = ({ item, isSelected, isSelectionMode, onPress, onLongPress }: ItemCardProps) => {
    const isSold = item.status !== 'Available';
    const imageUrl = fixImageUrl(item.image || item.image_url);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.card}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUrl || 'https://via.placeholder.com/300' }}
                    style={[
                        styles.image,
                        isSold && !isSelected && { opacity: 0.6 },
                        isSelected && { opacity: 0.8 } // Slight dim when selected
                    ]}
                />

                {/* Selection Tint Overlay */}
                {isSelected && <View style={styles.selectedTint} />}

                {isSold && !isSelectionMode && (
                    <View style={styles.soldOverlay}>
                        <Text style={styles.soldText}>SOLD</Text>
                    </View>
                )}
            </View>

            {/* Footer with conditional background color */}
            <View style={styles.footer}>
                <Text style={styles.itemCodeName} numberOfLines={1}>
                    {item.item_code || item.code} | {item.name}
                </Text>
                <Text style={styles.priceText} numberOfLines={1}>
                    ₱{Number(item.price).toLocaleString()}
                </Text>


                {/* The Floating Selection Indicator */}
                {isSelectionMode && (
                    <View style={styles.selectionOverlay}>
                        <MaterialCommunityIcons
                            name={isSelected ? "check-circle" : "circle-outline"}
                            size={24}
                            color={isSelected ? "#9D6F3C" : "#9D6F3C"}
                        />
                        {isSelected && <View style={styles.whiteBgFix} />}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: COLUMN_WIDTH,
        backgroundColor: '#fff',
        marginBottom: 15,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f0f0f0',
    },
    image: { width: '100%', height: '100%', resizeMode: 'cover' },
    selectedTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0000001a', 
    },
    footer: {
        backgroundColor: '#D9D9D9',
        paddingHorizontal: 8,
        paddingVertical: 10,
        height: 45, 
        justifyContent: 'center'
    },

    itemCodeName: {
        fontSize: 16,
        color: '#625C5C',
        fontFamily: 'LeagueSpartan-Bold',
    },
    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#625C5C',
        fontFamily: 'LeagueSpartan-Bold',
    },
    selectionOverlay: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    whiteBgFix: {
        position: 'absolute',
        width: 12,
        height: 12,
        backgroundColor: '#fff',
        zIndex: -1,
        borderRadius: 6,
    },
    soldOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#ffffff33',
        justifyContent: 'center',
        alignItems: 'center',
    },
    soldText: {
        color: '#C12423',
        fontWeight: '900',
        fontSize: 16,
        borderWidth: 2,
        borderColor: '#C12423',
        backgroundColor: "#ffffffa1",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 5,
        transform: [{ rotate: '-10deg' }]
    },
});