import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = Math.floor((width - 40) / 3);

interface ItemSkeletonProps {
    repeat?: number;
}

const ItemSkeleton = ({ repeat = 12 }: ItemSkeletonProps) => {
    const pulseAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.8,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.4,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [pulseAnim]);

    const SkeletonCard = () => (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <Animated.View style={[styles.imagePlaceholder, { opacity: pulseAnim }]} />
            </View>

            <View style={styles.footer}>
                <Animated.View style={[styles.line, { width: '80%', height: 10, opacity: pulseAnim }]} />
                <Animated.View style={[styles.line, { width: '60%', height: 12, marginTop: 6, opacity: pulseAnim }]} />
            </View>
        </View>
    );

    return (
        <View style={styles.grid}>
            {Array.from({ length: repeat }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        rowGap: 0,
        columnGap: 10,
    },
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
    imagePlaceholder: {
        flex: 1,
        backgroundColor: '#E1E9EE',
    },
    footer: {
        backgroundColor: '#D9D9D9',
        paddingHorizontal: 8,
        paddingVertical: 10,
        height: 45,
        justifyContent: 'center',
    },
    line: {
        backgroundColor: '#C0C0C0',
        borderRadius: 2,
    },
});

export default ItemSkeleton;