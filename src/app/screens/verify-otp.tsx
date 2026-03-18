import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, ImageBackground, Keyboard, TextInput as RNTextInput, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const ERROR_COLOR = '#9E2626';
const SUCCESS_COLOR = '#52966d';

export default function VerifyOtpScreen() {
    const { email } = useLocalSearchParams();
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const inputRef = useRef<RNTextInput>(null);

    // Auto-focus keyboard on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleVerifyOtp = async () => {
        if (otp.length < 6) {
            setError('Please enter the full 6-digit code.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/passwords/verify-otp', { email, otp });
            router.push({
                pathname: '/screens/reset-password',
                params: { email, otp }
            });
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
            const isFocused = otp.length === i;
            
            inputs.push(
                <View 
                    key={i} 
                    // pointerEvents="none" ensures the tap goes through to the parent TouchableOpacity
                    pointerEvents="none" 
                    style={[
                        styles.otpBox, 
                        isFocused && styles.otpBoxFocused,
                        error ? { borderColor: ERROR_COLOR } : null
                    ]}
                >
                    <Text style={styles.otpText}>{digit}</Text>
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
                    Please enter the 6-digit code sent to {"\n"}
                    <Text style={{fontWeight: '700', color: '#0D0F66'}}>{email}</Text>
                </Text>

                <View style={styles.form}>
                    
                    {/* Wrap everything in a TouchableOpacity that forces focus */}
                    <TouchableOpacity 
                        activeOpacity={1} 
                        onPress={() => inputRef.current?.focus()} 
                        style={styles.otpContainer}
                    >
                        {renderInputs()}

                        {/* 
                           HIDDEN INPUT FIX: 
                           We place it inside the container and make it absolute 
                           so it sits "behind" the boxes but covers the same area.
                        */}
                        <RNTextInput
                            ref={inputRef}
                            value={otp}
                            onChangeText={(text) => {
                                // Only allow numbers
                                const cleaned = text.replace(/[^0-9]/g, '');
                                setOtp(cleaned);
                                if (error) setError('');
                                
                                // Auto-submit when 6 digits are reached
                                if (cleaned.length === 6) {
                                    Keyboard.dismiss();
                                }
                            }}
                            keyboardType="number-pad"
                            maxLength={6}
                            // Keep it hidden but reachable
                            style={styles.hiddenInput}
                            autoFocus={true}
                            // Required for some Android versions to trigger focus via Ref
                            caretHidden={true}
                        />
                    </TouchableOpacity>

                    <HelperText
                        type="error"
                        visible={!!error}
                        style={[styles.helper, { color: ERROR_COLOR, opacity: 1 }]}
                    >
                        {error}
                    </HelperText>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backToLoginContainer}
                    >
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
                        Verify Code
                    </Button>

                    <TouchableOpacity style={{marginTop: 20, alignItems: 'center'}}>
                        <Text style={{color: '#818181'}}>Didn't receive code? <Text style={{color: '#1D72D4', fontWeight: '600'}}>Resend</Text></Text>
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
        color: '#818181',
        marginTop: 5,
        marginBottom: 25,
        lineHeight: 20
    },
    form: {
        width: '100%',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        position: 'relative', // Critical for absolute input positioning
    },
    otpBox: {
        width: width * 0.11,
        height: 55,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#0D0F66',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    otpBoxFocused: {
        borderColor: '#0D0F66',
        borderWidth: 2,
        backgroundColor: '#FFFFFF',
    },
    otpText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#05083E',
    },
    // The Input is now invisible but occupies the full width of the container
    hiddenInput: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0,
        fontSize: 1, // Minimize text impact
    },
    helper: {
        paddingHorizontal: 0,
        marginTop: 5,
        marginBottom: 10,
        lineHeight: 14,
        fontWeight: '600',
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