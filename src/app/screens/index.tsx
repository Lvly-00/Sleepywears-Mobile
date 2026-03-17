import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { loginUser } from '../../services/authService';

const { width } = Dimensions.get('window');

const ERROR_COLOR = '#9E2626';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateEmail = (text: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(text);
    };

    const validatePassword = (text: string) => {
        return text.length >= 1; // Just check if they typed something
    };

    const handleLogin = async () => {
        console.log('--- Login Process Started ---');
        console.log('Current Input:', { email, password: password ? '********' : 'empty' });

        // Reset errors
        setEmailError('');
        setPasswordError('');

        let isValid = true;
        if (!validateEmail(email)) {
            console.log('Validation Failed: Email format is invalid');
            setEmailError('Invalid email address. Please enter a valid email in the format: username@example.com.');
            isValid = false;
        }

        if (!validatePassword(password)) {
            console.log('Validation Failed: Password does not meet requirements');
            setPasswordError('Your password is incorrect.');
            isValid = false;
        }

        if (!isValid) {
            console.log('Login aborted due to validation errors.');
            return;
        }

        try {
            setLoading(true);
            console.log('Calling loginUser service...');

            const response = await loginUser(email, password);

            // Log the full response to see what the server actually returns
            console.log('Server Response:', response);

            // Check if user and token exist in the response
            const { user, token } = response;

            if (!token) {
                console.error('Error: Login succeeded but no token was received from the server.');
                Alert.alert('Login Error', 'Server did not return an access token.');
                return;
            }

            console.log('Saving to SecureStore...');
            await SecureStore.setItemAsync('access_token', token);
            await SecureStore.setItemAsync('email', email);

            console.log('Navigation: Attempting to redirect to dashboard...');
            router.replace('/(tabs)/dashboard');

        } catch (error: any) {
            // DETAILED ERROR LOGGING
            console.error('--- Login API Error ---');
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
                console.error('Headers:', error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received. Is your server running?');
                console.error('Request info:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error Message:', error.message);
            }

            Alert.alert(
                'Login Failed',
                error?.response?.data?.message || error.message || 'Invalid credentials'
            );
        } finally {
            setLoading(false);
            console.log('--- Login Process Finished ---');
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
                <Text style={styles.loginTitle}>LOGIN</Text>

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
                        style={[styles.helper, { color: ERROR_COLOR }]}  >
                        {emailError}
                    </HelperText>

                    {/* Password Input */}
                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (passwordError) setPasswordError('');
                        }}
                        mode="flat"
                        secureTextEntry={hidePassword}
                        activeUnderlineColor="#0D0F66"
                        underlineColor="#BDBDBD"
                        error={!!passwordError}
                        style={styles.input}
                        textColor="#0D0F66"
                        theme={{
                            colors: {
                                onSurfaceVariant: '#818181',
                                error: ERROR_COLOR
                            }
                        }}
                        right={
                            <TextInput.Icon
                                icon={hidePassword ? 'eye-off' : 'eye'}
                                color={passwordError ? ERROR_COLOR : "#0D0F66"}
                                onPress={() => setHidePassword(!hidePassword)}
                            />
                        }
                    />
                    <HelperText
                        type="error"
                        visible={!!passwordError}
                        style={[styles.helper, { color: ERROR_COLOR }]}
                    >
                        {passwordError}
                    </HelperText>

                    <TouchableOpacity
                        onPress={() => router.push('/screens/forgot-password')}
                        style={styles.forgotContainer}
                    >
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                        style={styles.loginButton}
                        contentStyle={styles.loginButtonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Login
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
        marginBottom: 5,
        lineHeight: 14,
    },
    forgotContainer: {
        alignSelf: 'flex-end',
        marginTop: 5,
        marginBottom: 30,
    },
    forgotText: {
        color: '#1D72D4',
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#0D0F66',
        borderRadius: 12,
        elevation: 0,
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
});