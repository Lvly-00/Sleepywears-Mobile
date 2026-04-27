import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ImageBackground, Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import SuccessModal from '../components/success-modal';
import api from '../services/api';
import { loginUser } from '../services/authService';

const { width } = Dimensions.get('window');
const ERROR_COLOR = '#9E2626';
const PRIMARY_BLUE = '#0D0F66';
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export default function LoginScreen() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [failedAttempts, setFailedAttempts] = useState(0);
    const [biometricFailures, setBiometricFailures] = useState(0);

    const [timer, setTimer] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Add this state

    const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);
    const [rememberedName, setRememberedName] = useState<string | null>(null);
    const [isBiometricRegistered, setIsBiometricRegistered] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

    const [attemptsMap, setAttemptsMap] = useState<{ [key: string]: number }>({});
    const [lockedEmail, setLockedEmail] = useState<string | null>(null);


    useEffect(() => {
        let internal: number;

        if (timer > 0) {
            internal = setInterval(() => setTimer(prev => prev - 1), 1000);
        } else if (timer === 0 && isLocked) {
            setIsLocked(false);

            if (lockedEmail) {
                setAttemptsMap(prev => ({
                    ...prev,
                    [lockedEmail]: 0
                }));
            }

            setLockedEmail(null);
            setFailedAttempts(0);

            SecureStore.deleteItemAsync('lock_email');
            SecureStore.deleteItemAsync('lock_until');
        }

        return () => clearInterval(internal);
    }, [timer, isLocked]);

    const checkSession = async () => {
        const forceLogin = await SecureStore.getItemAsync('force_login');

        const lastActivity = await SecureStore.getItemAsync('last_activity');
        const storedEmail = await SecureStore.getItemAsync('user_email');
        const storedName = await SecureStore.getItemAsync('user_name');
        const registered = await SecureStore.getItemAsync('biometric_registered');
        const enabled = await SecureStore.getItemAsync('biometrics_enabled');
        const lockEmail = await SecureStore.getItemAsync('lock_email');
        const lockUntil = await SecureStore.getItemAsync('lock_until');


        if (forceLogin === 'true') {
            await SecureStore.deleteItemAsync('user_email');
            await SecureStore.deleteItemAsync('user_name');
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('last_activity');
            await SecureStore.deleteItemAsync('biometric_registered');
            await SecureStore.deleteItemAsync('biometrics_enabled');
            await SecureStore.deleteItemAsync('force_login');

            setRememberedEmail(null);
            setRememberedName(null);
            setEmail('');
            setIsBiometricRegistered(false);
            setIsBiometricEnabled(false);

            return;
        }


        if (lockEmail && lockUntil) {
            const remaining = Math.floor((parseInt(lockUntil) - Date.now()) / 1000);

            if (remaining > 0) {
                setIsLocked(true);
                setLockedEmail(lockEmail);
                setTimer(remaining);

                setPasswordError(`Too many attempts. Try again after 60 seconds`);
            } else {
                await SecureStore.deleteItemAsync('lock_email');
                await SecureStore.deleteItemAsync('lock_until');

                setIsLocked(false);
                setLockedEmail(null);
                setTimer(0);
            }
        }

        if (lastActivity && storedEmail) {
            const now = Date.now();
            const elapsed = now - parseInt(lastActivity);

            if (elapsed > NINETY_DAYS_MS) {
                await SecureStore.deleteItemAsync('user_email');
                await SecureStore.deleteItemAsync('access_token');
                await SecureStore.deleteItemAsync('last_activity');

                setRememberedEmail(null);
                setRememberedName(null);
                setEmail('');
            } else {
                setRememberedEmail(storedEmail);
                setRememberedName(storedName);
                setEmail(storedEmail);
                try {
                    const res = await api.get('/user/settings');
                    const freshName = res.data.name;

                    setRememberedName(freshName);
                    await SecureStore.setItemAsync('user_name', freshName);

                } catch (err) {
                    setRememberedName(storedName);
                }

            }
        } else {
            setRememberedEmail(null);
            setRememberedName(null);
        }

        setIsBiometricRegistered(registered === 'true');
        setIsBiometricEnabled(enabled === 'true');
    };

    const updateActivityTimestamp = async () => {
        await SecureStore.setItemAsync('last_activity', Date.now().toString());
    };


    const validateEmail = (text: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(text);
    };

    const validatePassword = (text: string) => {
        return text.length >= 1;
    };

    const handleLogin = async () => {
        Keyboard.dismiss();
        setEmailError('');
        setPasswordError('');

        let hasError = false;

        if (!email.trim()) {
            setEmailError('Email field is required.');
            hasError = true;
        }

        if (!password.trim()) {
            setPasswordError('Password field is required.');
            hasError = true;
        }

        if (hasError) return;

        if (!validateEmail(email)) {
            setEmailError('Invalid email address. Please enter a valid email in the format: username@example.com.');
            return;
        }

        if (!validatePassword(password)) {
            setPasswordError('Your password is incorrect.');
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (isLocked && lockedEmail === normalizedEmail) {
            setPasswordError(`Too many attempts. Try again in ${timer}s.`);
            return;
        }

        try {
            setLoading(true);
            const response = await loginUser(email, password);

            if (response.token) {
                await SecureStore.setItemAsync('access_token', response.token);
                await SecureStore.setItemAsync('user_email', email.trim().toLowerCase());
                await SecureStore.setItemAsync('user_name', response.user.name);
                await updateActivityTimestamp();
                router.replace('/(tabs)/dashboard');
            }

        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message;

                //  EMAIL NOT FOUND
                if (status === 404) {
                    setEmailError(message || 'No account found with this email.');
                    setPasswordError(''); // clear password
                    return;
                }

                //  WRONG PASSWORD
                if (status === 401 || status === 403) {
                    setEmailError(''); // clear email error
                    handleFailedAttempt();
                    return;
                }

                //  TOO MANY ATTEMPTS
                if (status === 429) {
                    setPasswordError(message || 'Too many attempts. Try again later.');
                    return;
                }

                setPasswordError(message || 'Login failed.');
            } else {
                setPasswordError('Network error.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFailedAttempt = async () => {
        const normalizedEmail = email.trim().toLowerCase();

        const currentAttempts = attemptsMap[normalizedEmail] || 0;
        const newAttempts = currentAttempts + 1;

        setAttemptsMap(prev => ({
            ...prev,
            [normalizedEmail]: newAttempts
        }));

        setFailedAttempts(newAttempts);

        if (newAttempts >= 3) {
            const lockUntil = Date.now() + 60000; // 60 seconds

            setIsLocked(true);
            setLockedEmail(normalizedEmail);
            setTimer(60);

            await SecureStore.setItemAsync('lock_email', normalizedEmail);
            await SecureStore.setItemAsync('lock_until', lockUntil.toString());

            setPasswordError('Too many failed attempts. Please try again in 1 minute.');
        } else {
            setPasswordError('Your password is incorrect.');
        }
    };

    const handleSwitchAccount = async () => {
        await SecureStore.deleteItemAsync('user_email');
        await SecureStore.deleteItemAsync('user_name');
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('last_activity');
        await SecureStore.deleteItemAsync('biometric_registered');

        setRememberedEmail(null);
        setRememberedName(null);
        setIsBiometricRegistered(false);
        setEmail('');
        setPassword('');
    };



    const handleBiometricAction = async () => {
        if (!email) {
            setEmailError('Please enter your email to proceed.');
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!isBiometricRegistered) {
            // --- REGISTRATION FLOW (Calling Backend) ---
            setLoading(true);
            setEmailError('');
            try {
                // Call the specific biometric OTP endpoint in your AuthController
                const response = await api.post('/biometrics/request-otp', {
                    email: normalizedEmail
                });

                // Show success feedback
                setShowSuccessModal(true);

                setTimeout(() => {
                    setShowSuccessModal(false);
                    router.push({
                        pathname: '/screens/verify-otp',
                        params: {
                            email: normalizedEmail,
                            type: 'biometric' // Passing type so verify-otp knows which API to call next
                        }
                    });
                }, 2000);

            } catch (error: any) {
                let msg = error.response?.data?.message || "Failed to send biometric code. Please try again.";
                setEmailError(msg);
                Alert.alert("Error", msg);
            } finally {
                setLoading(false);
            }

        } else {
            // --- LOGIN FLOW (Local Authentication) ---
            if (biometricFailures >= 3) {
                Alert.alert("Security Lock", "Too many attempts. Please use your password.");
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login with Biometrics',
                cancelLabel: 'Use Password',
            });

            if (result.success) {
                const token = await SecureStore.getItemAsync('access_token');
                if (token) {
                    setBiometricFailures(0);
                    await updateActivityTimestamp();
                    router.replace('/(tabs)/dashboard');
                } else {
                    Alert.alert("Session Expired", "Please login with password once to re-sync.");
                    await handleSwitchAccount();
                }
            } else {
                if (result.error !== 'user_cancel') {
                    setBiometricFailures(prev => prev + 1);
                }
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            checkSession();
        }, [])
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <SuccessModal
                visible={showSuccessModal}
                message="The biometric authorization code has been sent!"
            />
            <ImageBackground
                source={require('../../assets/images/blue-banner.png')}
                style={styles.headerBackground}
                resizeMode="cover"
            >
                <Image
                    source={require('../../assets/images/logo-white.png')}
                    style={styles.logoImage}
                    resizeMode="cover"
                />
            </ImageBackground>

            <View style={styles.content}>
                {rememberedEmail ? (
                    <View style={styles.personalizedContainer}>
                        <Text style={styles.readyText}>Hello,</Text>
                        <View style={styles.nameLine}>
                            <Text style={styles.nameText}>{rememberedName}!</Text>
                            <TouchableOpacity onPress={handleSwitchAccount} style={styles.switchIconBtn}>
                                <MaterialCommunityIcons name="swap-horizontal" size={22} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.loginTitle}>LOGIN</Text>

                )}

                <View style={styles.form}>
                    {/* Email Input */}
                    {!rememberedEmail && (
                        <View>
                            <TextInput
                                label="Email"
                                value={email}
                                editable={!loading && !isLocked}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (emailError) setEmailError('');
                                    if (passwordError) setPasswordError('');
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
                        </View>
                    )}


                    {/* Password Input */}
                    <TextInput
                        label="Password"
                        value={password}
                        editable={!loading && !isLocked}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (emailError) setEmailError('');
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

                    {rememberedEmail && (
                        (!isBiometricRegistered || (isBiometricRegistered && isBiometricEnabled)) ? (

                            <TouchableOpacity onPress={handleBiometricAction} style={styles.biometricsContainer}>
                                <MaterialCommunityIcons name="face-recognition" size={22} color={PRIMARY_BLUE} />
                                <Text style={styles.biometrics}>
                                    {isBiometricRegistered ? 'Login with Biometrics' : 'Register Biometrics'}
                                </Text>
                            </TouchableOpacity>
                        ) : null

                    )}

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
        </View >
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
    personalizedContainer: {
        alignItems: 'flex-start',
    },
    readyText: {
        fontSize: 30,
        // fontWeight: '700',
        color: '#05083E',
        marginBottom: 5,
        fontFamily: 'serif',
    },
    nameLine: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nameText: {
        color: '#05083E',
        fontSize: 32,
        fontWeight: '700',
        fontFamily: 'serif',
        marginBottom: 25,
    },
    switchIconBtn: {
        marginLeft: 100,
        padding: 6,
        borderRadius: 20,
        marginBottom: 25,
    },

});