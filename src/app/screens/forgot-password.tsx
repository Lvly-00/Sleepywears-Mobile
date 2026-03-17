import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, Image, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

const { width } = Dimensions.get('window');
const ERROR_COLOR = '#9E2626';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);

    // Email validation logic
    const validateEmail = (text: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(text);
    };

    const handleResetPassword = () => {
        setEmailError('');

        if (!validateEmail(email)) {
            setEmailError('Invalid email address. Please enter a valid email in the format: username@example.com.');
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            console.log('Reset link sent to:', email);
            router.push('/screens/reset-password');
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* 1. Header Section (Same as Login) */}
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
                <Text style={styles.loginTitle}>FORGOT </Text>
                <Text style={styles.loginTitle}>PASSWORD</Text>


                <View style={styles.form}>

                    {/* Email Input */}
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (emailError) setEmailError('');
                        }}
                        mode="flat"
                        activeUnderlineColor="#0D0F66"
                        underlineColor="#BDBDBD"
                        error={!!emailError}
                        style={styles.input}
                        textColor="#0D0F66"
                        autoCapitalize="none"
                        theme={{
                            colors: {
                                onSurfaceVariant: '#818181',
                                error: ERROR_COLOR
                            }
                        }}
                    />
                    <HelperText
                        type="error"
                        visible={!!emailError}
                        style={[styles.helper, { color: ERROR_COLOR }]}
                    >
                        {emailError}
                    </HelperText>

                    {/* Back to Login */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backToLoginContainer}
                    >
                        <Text style={styles.backToLoginText}>Back to Login</Text>
                    </TouchableOpacity>

                    {/* Send Link Button */}
                    <Button
                        mode="contained"
                        onPress={handleResetPassword}
                        loading={loading}
                        disabled={loading}
                        style={styles.loginButton}
                        contentStyle={styles.loginButtonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Send Reset Link
                    </Button>


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
        marginBottom: 10,
    },
    instructionText: {
        fontSize: 14,
        color: '#818181',
        marginBottom: 25,
        lineHeight: 20,
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        fontSize: 16,
    },
    helper: {
        paddingHorizontal: 0,
        marginBottom: 15,
        lineHeight: 14,
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
        marginTop: 25,
        marginBottom: 15,
    },
    backToLoginText: {
        color: '#1D72D4',
        fontSize: 14,
        fontWeight: '500',
    },
});