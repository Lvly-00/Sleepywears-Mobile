import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function ResetPasswordScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleResetPassword = () => {
        // Perform auth logic here
        console.log('Forgot Password Pressed');

        // Use replace so the user cannot go back to the login screen
        router.push('/');
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                {/* <Image 
          source={require('../assets/images/Logo.png')} 
          style={styles.logo} 
        /> */}
                <Text style={styles.brandName}>SLEEPYWEARS</Text>
                <Text style={styles.brandName}>Reset Password</Text>

            </View>

            <View style={styles.form}>
                <TextInput
                    label="New Password"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    activeOutlineColor="#0A0B32"
                    style={styles.input}
                />
                <TextInput
                    label="Confirm Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    activeOutlineColor="#0A0B32"
                    style={styles.input}
                />

                <Button
                    mode="contained"
                    onPress={handleResetPassword}
                    style={styles.loginButton}
                    labelStyle={styles.buttonLabel}
                >
                    <Text
                     style={styles.loginText}>Reset Password</Text>
                </Button>

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
    logo: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
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