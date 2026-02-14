import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { loginUser } from '../services/authService';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);

    const handleLogin = async () => {
        try {
            setLoading(true);

            await loginUser(email, password);

            router.replace('/(tabs)/dashboard');
        } catch (error) {
            console.log(error?.response?.data);

            Alert.alert(
                "Login Failed",
                error?.response?.data?.message || "Invalid credentials"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        router.push('/forgot-password');
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
                    textColor="#000" // black text
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
                    textColor="#000" // black text
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
                    <Text style={styles.loginText}>Login</Text>
                </Button>

                <Text
                    style={styles.forgotText}
                    onPress={handleForgotPassword}
                >
                    Forgot Password?
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f3f3',
        padding: 20,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    brandName: {
        fontFamily: 'LeagueSpartan-Bold',
        fontSize: 32,
        color: '#0A0B32',
        marginTop: 10,
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    loginButton: {
        backgroundColor: '#0A0B32',
        paddingVertical: 5,
        borderRadius: 12,
        marginTop: 10,
    },
    buttonLabel: {
        fontFamily: 'LeagueSpartan-Bold',
        fontSize: 18,
    },
    forgotText: {
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'LeagueSpartan',
        color: '#AB8262',
    },
    loginText: {
        color: '#FFFFFF',
    },
});
