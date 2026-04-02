import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, Image, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const ERROR_COLOR = '#9E2626';
const SUCCESS_COLOR = '#52966d';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async () => {
        if (!email) {
            setMessage({ text: 'Please enter your email address.', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            // Backend now sends a 6-digit OTP instead of a link
            const response = await api.post('/passwords/forgot', { email });

            setMessage({ text: "Code sent! Checking your email...", type: "success" });

            // Navigate to OTP Verification Screen after 1.5 seconds
            setTimeout(() => {
                router.push({
                    pathname: '/screens/verify-otp',
                    params: { email: email }
                });
            }, 1500);

        } catch (error: any) {
            let msg = error.response?.data?.message || "Failed to send code. Please try again.";
            setMessage({ text: msg, type: "error" });
        } finally {
            setLoading(false);
        }
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
                <Text style={styles.loginTitle}>FORGOT </Text>
                <Text style={styles.loginTitle}>PASSWORD</Text>

                <View style={styles.form}>
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (message.text) setMessage({ text: "", type: "" });
                        }}
                        mode="flat"
                        activeUnderlineColor="#0D0F66"
                        underlineColor="#0D0F66"
                        error={message.type === "error"}
                        style={styles.input}
                        textColor="#818181"
                        autoCapitalize="none"
                        theme={{
                            colors: {
                                onSurfaceVariant: '#0D0F66',
                                error: ERROR_COLOR
                            }
                        }}
                    />

                    <HelperText
                        // We use "info" here so the component doesn't force the theme's red color
                        type="info"
                        visible={!!message.text}
                        style={[
                            styles.helper,
                            {
                                color: message.type === "error" ? ERROR_COLOR : SUCCESS_COLOR,
                                // Ensure the text is fully opaque
                                opacity: 1
                            }
                        ]}
                    >
                        {message.text}
                    </HelperText>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backToLoginContainer}
                    >
                        <Text style={styles.backToLoginText}>Back to Login</Text>
                    </TouchableOpacity>

                    <Button
                        mode="contained"
                        onPress={handleForgotPassword}
                        loading={loading}
                        disabled={loading}
                        style={styles.loginButton}
                        contentStyle={styles.loginButtonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Send OTP Code
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
        marginTop: 25,
        marginBottom: 15,
    },
    backToLoginText: {
        color: '#1D72D4',
        fontSize: 14,
        fontWeight: '500',
    },
});