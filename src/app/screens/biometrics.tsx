import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { loginUser } from '../../services/authService';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);

    // ----- Logic -----
    // useEffect(() => {
    //     (async () => {
    //         const token = await SecureStore.getItemAsync('access_token');
    //         if (token) {
    //             await handleBiometricLogin();
    //         }
    //     })();
    // }, []);

    const handleLogin = async () => {
        try {
            setLoading(true);
            const { user, token } = await loginUser(email, password);
            await SecureStore.setItemAsync('access_token', token);
            await SecureStore.setItemAsync('email', email);
            router.replace('/(tabs)/dashboard');
        } catch (error: any) {
            Alert.alert('Login Failed', error?.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    // const handleBiometricLogin = async () => {
    //     try {
    //         const hasHardware = await LocalAuthentication.hasHardwareAsync();
    //         if (!hasHardware) return;

    //         const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    //         if (!isEnrolled) return;

    //         const result = await LocalAuthentication.authenticateAsync({
    //             promptMessage: 'Login with Face ID / Fingerprint',
    //         });

    //         if (result.success) {
    //             const token = await SecureStore.getItemAsync('access_token');
    //             if (token) router.replace('/(tabs)/dashboard');
    //         }
    //     } catch (err) {
    //         console.log('Biometric error:', err);
    //     }
    // };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            {/* 1. Header Section: Using an ImageBackground for the blue bg + wave */}
            <ImageBackground 
                source={require('../../../assets/images/blue-banner.png')} // THIS SHOULD BE THE BLUE BG WITH THE WAVE
                style={styles.headerBackground}
                resizeMode="cover"
            >
                {/* 2. Logo: Positioned inside the header */}
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
                        onChangeText={setEmail}
                        mode="flat"
                        activeUnderlineColor="#0D0F66"
                        underlineColor="#BDBDBD"
                        style={styles.input}
                        textColor="#0D0F66"
                        autoCapitalize="none"
                        theme={{ colors: { onSurfaceVariant: '#818181' } }} // Label color
                    />

                    {/* Password Input */}
                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        mode="flat"
                        secureTextEntry={hidePassword}
                        activeUnderlineColor="#0D0F66"
                        underlineColor="#BDBDBD"
                        style={styles.input}
                        textColor="#0D0F66"
                        theme={{ colors: { onSurfaceVariant: '#818181' } }}
                        right={
                            <TextInput.Icon
                                icon={hidePassword ? 'eye-off' : 'eye'}
                                color="#0D0F66"
                                onPress={() => setHidePassword(!hidePassword)}
                            />
                        }
                    />

                    {/* Forgot Password */}
                    <TouchableOpacity 
                        onPress={() => router.push('/screens/forgot-password')}
                        style={styles.forgotContainer}
                    >
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Biometric Button */}
                    {/* <TouchableOpacity 
                        style={styles.biometricBtn}
                        onPress={handleBiometricLogin}
                    >
                        <MaterialCommunityIcons name="face-recognition" size={24} color="#3F4168" />
                        <Text style={styles.biometricsLabel}>Login with Biometrics</Text>
                    </TouchableOpacity> */}

                    {/* Login Button */}
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
        height: width * 1, // Adjust height ratio based on your wave image
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -10, // Pull up the header to overlap the top edge
        marginBottom: -130, // Pull up the content to overlap the wave
        // backgroundColor: '#0A0B32',
    },
    logoImage: {
        width: '75%',
        height: 100,
        marginTop: -110, // Adjust based on your image asset positioning
    },
    content: {
        flex: 1,
        paddingHorizontal: 40,
        marginTop: -20, // Pull content up slightly to overlap wave if needed
    },
    loginTitle: {
        fontSize: 40,
        fontWeight: '700',
        color: '#05083E',
        marginBottom: 35,
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 15,
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        fontSize: 16,
    },
    forgotContainer: {
        alignSelf: 'flex-end',
        marginTop: 5,
        marginBottom: 30,
    },
    forgotText: {
        color: '#1D72D4', // Light blue from image
        fontSize: 14,
        fontWeight: '500',
    },
    biometricBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    biometricsLabel: {
        marginLeft: 8,
        color: '#3F4168',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#0D0F66', // Deep navy
        borderRadius: 12,
        elevation: 0,
        fontSize: 20,
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