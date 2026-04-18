import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BRAND_DARK_BLUE = '#02034C'; 

interface AnimatedSplashHeaderProps {
    isReady: boolean;
    logoSource: ImageSourcePropType;
    children: React.ReactNode;
}

export default function AnimatedSplashHeader({ isReady, logoSource, children }: AnimatedSplashHeaderProps) {
    const fadeOpacity = useSharedValue(1);
    const [showOverlay, setShowOverlay] = useState(true);

    useEffect(() => {
        if (isReady) {
            // Wait 100ms to ensure the Login UI is painted behind the splash
            setTimeout(async () => {
                await SplashScreen.hideAsync();
                
                fadeOpacity.value = withTiming(0, {
                    duration: 800,
                    easing: Easing.out(Easing.quad),
                }, (finished) => {
                    if (finished) {
                        runOnJS(setShowOverlay)(false);
                    }
                });
            }, 100);
        }
    }, [isReady]);

    const splashOverlayStyle = useAnimatedStyle(() => ({
        opacity: fadeOpacity.value,
    }));

    return (
        <View style={styles.container}>
            {/* 1. THE LOGIN CONTENT (Already visible behind the splash) */}
            <View style={styles.loginLayout}>
                {/* PERSISTENT WAVY HEADER */}
                <View style={styles.header}>
                    <View style={styles.headerLogoContainer}>
                        <Image source={logoSource} style={styles.headerLogo} resizeMode="contain" />
                    </View>
                    <View style={styles.waveWrapper}>
                        <Svg height="120" width={width} viewBox="0 0 1440 320" style={styles.svgFlip}>
                            <Path
                                fill={BRAND_DARK_BLUE}
                                d="M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,176C672,139,768,85,864,85.3C960,85,1056,139,1152,154.7C1248,171,1344,149,1392,138.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                            />
                        </Svg>
                    </View>
                </View>

                {/* THE FORM CONTENT (Passed as children) */}
                <View style={styles.content}>
                    {children}
                </View>
            </View>

            {/* 2. THE FULL SCREEN OVERLAY (Fades Out) */}
            {showOverlay && (
                <Animated.View 
                    pointerEvents="none" 
                    style={[styles.splashOverlay, splashOverlayStyle]}
                >
                    <Image source={logoSource} style={styles.splashLogo} resizeMode="contain" />
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    loginLayout: { flex: 1 },
    header: {
        width: '100%',
        height: 240,
        backgroundColor: BRAND_DARK_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerLogoContainer: { marginTop: -20, transform: [{ scale: 0.75 }] },
    headerLogo: { width: width * 0.7, height: 100 },
    waveWrapper: { position: 'absolute', bottom: -85, width: width, left: 0 },
    svgFlip: { transform: [{ scaleY: -1 }] },
    content: { flex: 1, paddingHorizontal: 40, paddingTop: 60 },
    // FULL SCREEN SPLASH STYLE
    splashOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: BRAND_DARK_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    splashLogo: { width: width * 0.8, height: 200 },
});