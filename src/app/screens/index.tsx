import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native';
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

    const [failedAttempts, setFailedAttempts] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        let internal: NodeJS.Timeout;
        if (timer > 0) {
            internal = setInterval(() => {
                setTimer((prev) => prev - 1);
            }
                , 1000);
        } else if (timer === 0 && isLocked) {
            setIsLocked(false);
            setFailedAttempts(0);
        }
        return () => clearInterval(internal);
    }, [timer, isLocked]);

    const validateEmail = (text: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(text);
    };

    const validatePassword = (text: string) => {
        return text.length >= 1;
    };

    const handleLogin = async () => {
        console.log('--- Login Process Started ---');
        console.log('Current Input:', { email, password: password ? '********' : 'empty' });

        Keyboard.dismiss();

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
            const response = await loginUser(email, password);
            const { token } = response;

            if (!token) {
                setPasswordError('Your password is incorrect.');
                return;
            }

            setFailedAttempts(0);

            // Save and Navigate
            await SecureStore.setItemAsync('access_token', token);
            await SecureStore.setItemAsync('email', email);

            router.replace('/(tabs)/dashboard');

        } catch (error: any) {
            const newFailedAttempts = failedAttempts + 1;
            setFailedAttempts(newFailedAttempts);

            if (newFailedAttempts >= 5) {
                setIsLocked(true);
                setTimer(60); // Lock for 1 minute
                setFailedAttempts(0);
                setPasswordError('Too many failed attempts. Please try again in 1 minute.');
                return;
            } else if (error.response?.status === 401 || error.response?.status === 422) {
                setPasswordError('Your password is incorrect.');
            } else {
                setPasswordError('Unable to connect to server. Please try again.');
            }
            console.error('Login Error:', error);
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
                <Text style={styles.loginTitle}>LOGIN</Text>

                <View style={styles.form}>
                    {/* Email Input */}
                    <TextInput
                        label="Email"
                        value={email}
                        editable={!loading && !isLocked}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (emailError) setEmailError('');
                        }}
                        keyboardType='email-address'
                        autoComplete='email'
                        textContentType='emailAddress'
                        mode="flat"
                        activeUnderlineColor="#0D0F66"
                        underlineColor="#0D0F66"
                        error={!!emailError}
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
                        type="error"
                        visible={!!emailError}
                        style={[styles.helper, { color: ERROR_COLOR }]}  >
                        {emailError}
                    </HelperText>

                    {/* Password Input */}
                    <TextInput
                        label="Password"
                        value={password}
                        editable={!loading && !isLocked}
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

                    {/* Suggest Forgot Password after 3 attempts */}
                    {failedAttempts >= 3 ? (
                        // Show this after 3 failures
                        <View style={styles.suggestContainer}>
                            <Text style={styles.suggestText}>
                                Having trouble? Try using{' '}
                                <Text
                                    style={styles.forgotLink}
                                    onPress={() => router.push('/screens/forgot-password')}
                                >
                                    Forgot Password?
                                </Text>
                            </Text>
                        </View>
                    ) : (
                        // Show this normally
                        <TouchableOpacity
                            onPress={() => router.push('/screens/forgot-password')}
                            style={styles.forgotContainer}
                        >
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    )}


                    <TouchableOpacity
                        onPress={() => !isLocked && router.push('/screens/forgot-password')}
                        disabled={isLocked}
                        style={[styles.biometricsContainer, isLocked && { opacity: 0.5 }]}
                    >
                        <MaterialCommunityIcons name="face-recognition" size={20} color="#0D0F66" />
                        <Text style={styles.biometrics}>Login with Biometrics</Text>
                    </TouchableOpacity>

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading || isLocked}
                        style={styles.loginButton}
                        contentStyle={styles.loginButtonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        {isLocked ? `Locked (${timer}s)` : 'Login'}
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
        color: '#9E2626',
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
    biometricsContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 10,
    },
    biometrics: {
        color: '#3F4168',
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

    suggestContainer: {
        backgroundColor: '#f8d7da',
        padding: 10,
        borderRadius: 8,
        marginTop: 5,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#f5c6cb'
    },
    suggestText: {
        color: '#721C24',
        fontSize: 14,
        textAlign: 'center',
    },
    forgotLink: {
        color: '#1D72D4',
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});