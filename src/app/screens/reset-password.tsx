import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import api from '../../services/api'; // Ensure this path is correct

const { width } = Dimensions.get('window');
const ERROR_COLOR = '#9E2626';

export default function ResetPasswordScreen() {
    // 1. Get the email and otp passed from the Verify OTP screen
    const { email, otp } = useLocalSearchParams();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Visibility states
    const [hidePassword, setHidePassword] = useState(true);
    const [hideConfirmPassword, setHideConfirmPassword] = useState(true);

    // Error states
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Validation Regex (8 chars, 1 number, 1 special char)
    const validatePassword = (text: string) => {
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{8,}$/;
        return passwordRegex.test(text);
    };

    const handleResetPassword = async () => {
        setPasswordError('');
        setConfirmPasswordError('');

        let isValid = true;

        // 1. Validate Password Format
        if (!validatePassword(password)) {
            setPasswordError('Your password is incorrect. It must contain at least 8 characters, including one number and one special character.');
            isValid = false;
        }

        // 2. Check if Match
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match.');
            isValid = false;
        }

        if (!isValid) return;

        setLoading(true);
        
        try {
            // 2. Call the actual API
            await api.post('/passwords/reset', {
                email: email,
                otp: otp,
                password: password,
                password_confirmation: confirmPassword
            });

            setLoading(false);
            Alert.alert('Success', 'Your password has been reset successfully.', [
                { text: 'OK', onPress: () => router.replace('/screens') } // Redirects to Login
            ]);
        } catch (error: any) {
            setLoading(false);
            const serverMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
            setPasswordError(serverMessage);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header Section */}
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
                <Text style={styles.loginTitle}>RESET </Text>
                <Text style={styles.loginTitle}>PASSWORD</Text>

                <View style={styles.form}>
                    {/* New Password Input */}
                    <TextInput
                        label="New Password"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (passwordError) setPasswordError('');
                        }}
                        mode="flat"
                        secureTextEntry={hidePassword}
                        activeUnderlineColor="#0D0F66"
                        underlineColor="#0D0F66"
                        error={!!passwordError}
                        style={styles.input}
                        textColor="#818181"
                        theme={{
                            colors: {
                                onSurfaceVariant: '#0D0F66',
                                error: ERROR_COLOR
                            }
                        }}
                        right={
                            <TextInput.Icon
                                icon={hidePassword ? 'eye-off' : 'eye'}
                                forceTextInputFocus={false}
                                color={passwordError ? ERROR_COLOR : "#0D0F66"}
                                onPress={() => setHidePassword(!hidePassword)}
                            />
                        }
                    />
                    <HelperText type="error" visible={!!passwordError} style={styles.helper}>
                        {passwordError}
                    </HelperText>

                    {/* Confirm Password Input */}
                    <TextInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (confirmPasswordError) setConfirmPasswordError('');
                        }}
                        mode="flat"
                        secureTextEntry={hideConfirmPassword}
                        activeUnderlineColor="#0D0F66"
                        underlineColor="#0D0F66"
                        error={!!confirmPasswordError}
                        style={styles.input}
                        textColor="#818181"
                        theme={{
                            colors: {
                                onSurfaceVariant: '#0D0F66',
                                error: ERROR_COLOR
                            }
                        }}
                        right={
                            <TextInput.Icon
                                icon={hideConfirmPassword ? 'eye-off' : 'eye'}
                                forceTextInputFocus={false}
                                color={confirmPasswordError ? ERROR_COLOR : "#0D0F66"}
                                onPress={() => setHideConfirmPassword(!hideConfirmPassword)}
                            />
                        }
                    />
                    <HelperText type="error" visible={!!confirmPasswordError} style={styles.helper}>
                        {confirmPasswordError}
                    </HelperText>

                    <TouchableOpacity
                        onPress={() => router.replace('/screens')}
                        style={styles.backToLoginContainer}
                    >
                        <Text style={styles.backToLoginText}>Back to Login</Text>
                    </TouchableOpacity>

                    {/* Reset Button */}
                    <Button
                        mode="contained"
                        onPress={handleResetPassword}
                        loading={loading}
                        disabled={loading}
                        style={styles.loginButton}
                        contentStyle={styles.loginButtonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Reset Password
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
        marginBottom: 10,
        lineHeight: 14,
        color: '#9E2626',
    },
    loginButton: {
        backgroundColor: '#0D0F66',
        borderRadius: 12,
        elevation: 0,
        marginTop: 20,
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
    },
    backToLoginText: {
        color: '#1D72D4',
        fontSize: 14,
        fontWeight: '500',
    },
});