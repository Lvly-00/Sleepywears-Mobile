import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store'; // Added Import
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, ImageBackground, TextInput as RNTextInput, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';
import SuccessModal from '../../components/success-modal';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const ERROR_COLOR = '#9E2626';

export default function VerifyOtpScreen() {
    // Extract both email and type (purpose)
    const { email, type } = useLocalSearchParams(); 
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [isFocused, setIsFocused] = useState(false);
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => setCursorVisible((v) => !v), 500);
        return () => clearInterval(interval);
    }, []);

    const [timer, setTimer] = useState(60);
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleResend = async () => {
        if (timer > 0 || resendLoading) return;
        setResendLoading(true);
        setError('');
        try {
            // Use the correct endpoint for resending based on type
            const endpoint = type === 'biometric' ? '/biometrics/request-otp' : '/passwords/forgot';
            await api.post(endpoint, { email });
            setTimer(60);
            Alert.alert("Success", "A new code has been sent.");
        } catch (err: any) {
            setError("Failed to resend code.");
        } finally {
            setResendLoading(false);
        }
    };

    const inputRef = useRef<RNTextInput>(null);

    const handleVerifyOtp = async () => {
        if (otp.length < 6) {
            setError('Please enter the full 6-digit code.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const endpoint = type === 'biometric'
                ? '/biometrics/verify-otp'
                : '/passwords/verify-otp';

            await api.post(endpoint, { email, otp });

            setShowSuccessModal(true);

            setTimeout(async () => {
                setShowSuccessModal(false);

                if (type === 'biometric') {
                    // Logic for Biometric Success
                    await SecureStore.setItemAsync('biometric_registered', 'true');
                    await SecureStore.setItemAsync('biometrics_enabled', 'true');
                    Alert.alert("Success", "Biometrics authorized! You can now login with FaceID.");
                    router.replace('/');
                } else {
                    // Logic for Password Reset Success
                    router.push({ pathname: '/screens/reset-password', params: { email, otp } });
                }
            }, 2000);

        } catch (err: any) {
            // Specific handling for "The code is incorrect"
            const msg = err.response?.data?.message || "Invalid or expired code.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const renderInputs = () => {
        const inputs = [];
        for (let i = 0; i < 6; i++) {
            const digit = otp[i] || '';
            const isCurrentBoxActive = otp.length === i;
            const showCursor = isCurrentBoxActive && isFocused && cursorVisible;
            inputs.push(
                <View key={i} pointerEvents="none" style={[styles.otpBox, isCurrentBoxActive && isFocused && styles.otpBoxFocused, error ? { borderColor: ERROR_COLOR } : null]}>
                    {showCursor ? <View style={styles.cursor} /> : <Text style={styles.otpText}>{digit}</Text>}
                </View>
            );
        }
        return inputs;
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <SuccessModal visible={showSuccessModal} message="Code verified successfully!" />
            
            <ImageBackground source={require('../../../assets/images/blue-banner.png')} style={styles.headerBackground} resizeMode="cover">
                <Image source={require('../../../assets/images/logo-white.png')} style={styles.logoImage} />
            </ImageBackground>

            <View style={styles.content}>
                <Text style={styles.loginTitle}>VERIFY </Text>
                <Text style={styles.loginTitle}>CODE</Text>
                <Text style={styles.subtitle}>Enter the 6-digit code sent to your email to continue.</Text>

                <View style={styles.form}>
                    <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()} style={styles.otpContainer}>
                        {renderInputs()}
                        <RNTextInput
                            ref={inputRef}
                            value={otp}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChangeText={(text) => {
                                setOtp(text.replace(/[^0-9]/g, ''));
                                if (error) setError('');
                            }}
                            keyboardType="number-pad"
                            maxLength={6}
                            style={styles.hiddenInput}
                            caretHidden={true}
                        />
                    </TouchableOpacity>

                    <HelperText type="error" visible={!!error} style={styles.helper}>{error}</HelperText>

                    <TouchableOpacity onPress={() => router.back()} style={styles.backToLoginContainer}>
                        <Text style={styles.backToLoginText}>Back to Login</Text>
                    </TouchableOpacity>

                    <Button mode="contained" onPress={handleVerifyOtp} loading={loading} style={styles.loginButton} contentStyle={styles.loginButtonContent} labelStyle={styles.buttonLabel}>
                        Verify Code
                    </Button>

                    <TouchableOpacity onPress={handleResend} disabled={timer > 0 || resendLoading} style={{ marginTop: 25, alignItems: 'center' }}>
                        <Text style={{ color: '#818181', fontSize: 14 }}>
                            Didn't receive code? {timer > 0 ? <Text style={{ fontWeight: '700' }}>Wait {timer}s</Text> : <Text style={{ color: '#1D72D4', fontWeight: '700' }}>Resend</Text>}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// ... styles remain the same

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    headerBackground: {
        width: width,
        height: width * 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -10,
        marginBottom: -130,
    },

    logoImage: {
        width: '75%',
        height: 100,
        marginTop: -110,
    },

    content: {
        flex: 1,
        paddingHorizontal: 40,
        marginTop: -20,
    },

    loginTitle: {
        fontSize: 40,
        fontWeight: '700',
        color: '#05083E',
    },

    subtitle: {
        fontSize: 14,
        color: '#05083E',
        marginTop: 5,
        marginBottom: 25,
        lineHeight: 20,
    },

    form: {
        width: '100%',
    },

    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        position: 'relative',
    },

    otpBox: {
        width: width * 0.11,
        height: 55,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#0D0F66',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },

    otpBoxFocused: {
        borderColor: '#0D0F66',
        borderWidth: 2,
    },

    otpText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#05083E',
    },

    cursor: {
        width: 2,
        height: 24,
        backgroundColor: '#0D0F66',
    },

    hiddenInput: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0,
        fontSize: 1,
    },

    helper: {
        paddingHorizontal: 0,
        marginTop: 5,
        marginBottom: 10,
        lineHeight: 14,
        fontWeight: '600',
        color: ERROR_COLOR,
    },

    loginButton: {
        backgroundColor: '#0D0F66',
        borderRadius: 12,
        elevation: 0,
        marginTop: 10,
    },

    loginButtonContent: {
        height: 56,
    },

    buttonLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'none',
    },

    backToLoginContainer: {
        alignItems: 'flex-end',
        marginTop: 10,
        marginBottom: 15,
    },

    backToLoginText: {
        color: '#1D72D4',
        fontSize: 14,
        fontWeight: '500',
    },
});