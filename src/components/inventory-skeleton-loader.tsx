import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface CollectionSkeletonProps {
    repeat?: number;
}

const CollectionSkeleton = ({ repeat = 6 }: CollectionSkeletonProps) => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.7,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
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
            {/* Visual Placeholder (where the icon or image usually is) */}
            <Animated.View style={[styles.visual, { opacity: pulseAnim }]} />

            <View style={styles.textContainer}>
                {/* Title Placeholder */}
                <Animated.View style={[styles.titleLine, { opacity: pulseAnim }]} />
                {/* Subtitle Placeholder */}
                <Animated.View style={[styles.subtitleLine, { opacity: pulseAnim }]} />
            </View>

            {/* Arrow/Chevron Placeholder */}
            <Animated.View style={[styles.chevron, { opacity: pulseAnim }]} />
        </View>
    );

    return (
        <View style={styles.container}>
            {Array.from({ length: repeat }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 15,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    visual: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#E1E9EE',
    },
    textContainer: {
        flex: 1,
        marginLeft: 15,
        gap: 10
    },
    titleLine: {
        height: 16,
        width: '60%',
        backgroundColor: '#E1E9EE',
        borderRadius: 4,
    },
    subtitleLine: {
        height: 12,
        width: '30%',
        backgroundColor: '#E1E9EE',
        borderRadius: 4,
    },
    chevron: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#E1E9EE',
    }
});

export default CollectionSkeleton;