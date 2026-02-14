import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { loginUser, logoutUser } from '../services/authService';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);

    // ----- Auto Biometric Login on App Start -----
    useEffect(() => {
        (async () => {
            const token = await SecureStore.getItemAsync('access_token');
            if (token) {
                await handleBiometricLogin();
            }
        })();
    }, []);

    // ----- Manual Login -----
    const handleLogin = async () => {
        try {
            setLoading(true);

            const { user, token } = await loginUser(email, password);

            // Store securely
            await SecureStore.setItemAsync('access_token', token);
            await SecureStore.setItemAsync('email', email);

            router.replace('/(tabs)/dashboard');
        } catch (error: any) {
            console.log(error?.response?.data);

            Alert.alert(
                'Login Failed',
                error?.response?.data?.message || 'Invalid credentials'
            );
        } finally {
            setLoading(false);
        }
    };

    // ----- Biometric Login -----
    const handleBiometricLogin = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) return Alert.alert('Biometrics not supported');

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled)
                return Alert.alert('No biometrics enrolled', 'Please enroll Face ID / Touch ID');

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login with Face ID / Fingerprint',
                fallbackLabel: 'Enter Passcode',
                cancelLabel: 'Cancel',
            });

            if (result.success) {
                const token = await SecureStore.getItemAsync('access_token');
                if (token) {
                    router.replace('/(tabs)/dashboard');
                } else {
                    Alert.alert(
                        'Biometric login',
                        'Please login manually once to store your token.'
                    );
                }
            }
        } catch (err) {
            console.log('Biometric login error:', err);
        }
    };

    // ----- Logout Example (Optional) -----
    const handleLogout = async () => {
        await logoutUser();
        Alert.alert('Logged out successfully');
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Text style={styles.brandName}>SLEEPYWEARS</Text>
            </View>

            <View style={styles.form}>
                {/* Email Input */}
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    activeOutlineColor="#0A0B32"
                    style={styles.input}
                    textColor="#000"
                />

                {/* Password Input */}
                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={hidePassword}
                    activeOutlineColor="#0A0B32"
                    style={styles.input}
                    textColor="#000"
                    right={
                        <TextInput.Icon
                            icon={hidePassword ? 'eye-off' : 'eye'}
                            onPress={() => setHidePassword(!hidePassword)}
                        />
                    }
                />

                {/* Login Button */}
                <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.loginButton}
                    labelStyle={styles.buttonLabel}
                >
                    <Text> Login</Text>
                </Button>

                {/* Biometric Button */}
                <Button
                    icon={() => <MaterialCommunityIcons name="face-recognition" size={24} />}
                    onPress={handleBiometricLogin}
                    style={{ marginTop: 15 }}
                >
                    <Text style={styles.biometrics}>  Login with Biometrics</Text>
                </Button>

                {/* Forgot Password */}
                <Text
                    style={styles.forgotText}
                    onPress={() => router.push('/forgot-password')}
                >
                    Forgot Password?
                </Text>

                {/* Logout (optional, for testing) */}
                {/* <Button onPress={handleLogout} style={{ marginTop: 10 }}>Logout</Button> */}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f3f3',
        padding: 20,
        justifyContent: 'center'
    },

    logoContainer: {
        alignItems: 'center',
        marginBottom: 50
    },

    brandName: {
        fontFamily: 'LeagueSpartan-Bold',
        fontSize: 32,
        color: '#0A0B32',
        marginTop: 10
    },

    form: {
        width: '100%'
    },

    input: {
        marginBottom: 15,
        backgroundColor: '#fff'
    },

    loginButton: {
        backgroundColor: '#0A0B32',
        color: '#fff',
        paddingVertical: 5,
        borderRadius: 12,
        marginTop: 10
    },

    buttonLabel: {
        fontFamily: 'LeagueSpartan-Bold',
        fontSize: 18
    },

    forgotText: {
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'LeagueSpartan',
        color: '#AB8262'
    },

    biometrics: {
        color: '#000000'


    }
});
