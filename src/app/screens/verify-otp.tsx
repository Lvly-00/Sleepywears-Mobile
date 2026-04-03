import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, ImageBackground, Keyboard, TextInput as RNTextInput, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const ERROR_COLOR = '#9E2626';

export default function VerifyOtpScreen() {
    const { email } = useLocalSearchParams();
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    
    // --- CURSOR & FOCUS STATE ---
    const [isFocused, setIsFocused] = useState(false);
    const [cursorVisible, setCursorVisible] = useState(true);

    // Blinking effect logic
    useEffect(() => {
        const interval = setInterval(() => {
            setCursorVisible((prev) => !prev);
        }, 500); // Blink every 500ms
        return () => clearInterval(interval);
    }, []);

    // --- COUNTDOWN LOGIC ---
    const [timer, setTimer] = useState(60);
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleResend = async () => {
        if (timer > 0 || resendLoading) return;
        setResendLoading(true);
        setError('');
        try {
            await api.post('/passwords/forgot', { email }); 
            setTimer(60);
        } catch (err: any) {
            setError("Failed to resend code.");
        } finally {
            setResendLoading(false);
        }
    };

    const inputRef = useRef<RNTextInput>(null);

    // Auto-focus on mount
    useEffect(() => {
        const timerFocus = setTimeout(() => {
            inputRef.current?.focus();
        }, 500);
        return () => clearTimeout(timerFocus);
    }, []);

    const handleVerifyOtp = async () => {
        if (otp.length < 6) {
            setError('Please enter the full 6-digit code.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/passwords/verify-otp', { email, otp });
            router.push({ pathname: '/screens/reset-password', params: { email, otp } });
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid or expired code.");
        } finally {
            setLoading(false);
        }
    };

    const renderInputs = () => {
        const inputs = [];
        for (let i = 0; i < 6; i++) {
            const digit = otp[i] || '';
            const isCurrentBoxActive = otp.length === i;
            // Only show cursor if this is the active box AND the text input is focused
            const showCursor = isCurrentBoxActive && isFocused && cursorVisible;

            inputs.push(
                <View
                    key={i}
                    pointerEvents="none"
                    style={[
                        styles.otpBox,
                        isCurrentBoxActive && isFocused && styles.otpBoxFocused,
                        error ? { borderColor: ERROR_COLOR } : null
                    ]}
                >
                    {showCursor ? (
                        <View style={styles.cursor} />
                    ) : (
                        <Text style={styles.otpText}>{digit}</Text>
                    )}
                </View>
            );
        }
        return inputs;
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <ImageBackground
                source={require('../../../assets/images/blue-banner.png')}
                style={styles.headerBackground}
                resizeMode="cover"
            >
                <Image
                    source={require('../../../assets/images/logo-white.png')}
                    style={styles.logoImage}
                    resizeMode="cover"
                />
            </ImageBackground>

            <View style={styles.content}>
                <Text style={styles.loginTitle}>VERIFY </Text>
                <Text style={styles.loginTitle}>CODE</Text>

                <Text style={styles.subtitle}>
                    A 6-digit code was sent to your email. {"\n"}Please enter the authentication code.
                </Text>

                <View style={styles.form}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => inputRef.current?.focus()}
                        style={styles.otpContainer}
                    >
                        {renderInputs()}
                        <RNTextInput
                            ref={inputRef}
                            value={otp}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChangeText={(text) => {
                                const cleaned = text.replace(/[^0-9]/g, '');
                                setOtp(cleaned);
                                if (error) setError('');
                                if (cleaned.length === 6) Keyboard.dismiss();
                            }}
                            keyboardType="number-pad"
                            maxLength={6}
                            style={styles.hiddenInput}
                            caretHidden={true}
                        />
                    </TouchableOpacity>

                    <HelperText type="error" visible={!!error} style={styles.helper}>
                        {error}
                    </HelperText>

                    <TouchableOpacity onPress={() => router.back()} style={styles.backToLoginContainer}>
                        <Text style={styles.backToLoginText}>Back to Login</Text>
                    </TouchableOpacity>

                    <Button
                        mode="contained"
                        onPress={handleVerifyOtp}
                        loading={loading}
                        disabled={loading}
                        style={styles.loginButton}
                        contentStyle={styles.loginButtonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Verify OTP
                    </Button>

                    <TouchableOpacity 
                        onPress={handleResend} 
                        disabled={timer > 0 || resendLoading}
                        style={{ marginTop: 25, alignItems: 'center' }}
                    >
                        <Text style={{ color: '#818181', fontSize: 14 }}>
                            Didn't receive code? {timer > 0 ? (
                                <Text style={{ color: '#818181', fontWeight: '700' }}>
                                    Wait {timer}s
                                </Text>
                            ) : (
                                <Text style={{ color: '#1D72D4', fontWeight: '700' }}>
                                    {resendLoading ? "Sending..." : "Resend"}
                                </Text>
                            )}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

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