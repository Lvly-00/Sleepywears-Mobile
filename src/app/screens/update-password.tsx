import api from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SettingsInput } from '../../components/settings-input';
import { UpdateButton } from '../../components/update-button';
// import { useAuth } from '../../context/auth';

export default function UpdatePasswordScreen() {
    // const { setHasToken } = useAuth();
    const [form, setForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const handleUpdate = async () => {
        if (form.new_password !== form.new_password_confirmation) {
            setErrors({ new_password_confirmation: ["Passwords do not match"] });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await api.put("/user/settings/password", form);

            Alert.alert(
                "Password Updated",
                "Your password has been changed successfully. For security, please log in again.",
                [
                    {
                        text: "OK",
                        onPress: async () => {
                            await AsyncStorage.removeItem('authToken');
                            // setHasToken(false);
                            router.replace('/');

                        }
                    }
                ]
            );

        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                Alert.alert("Error", "Failed to update password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.screen}>
            <Text style={styles.description}>
                Use a strong combination of letters, numbers, and symbols.
            </Text>

            <SettingsInput
                label="Current Password"
                value={form.current_password}
                onChangeText={(val) => setForm({ ...form, current_password: val })}
                isPassword
                error={errors.current_password?.[0]}
            />

            <SettingsInput
                label="New Password"
                value={form.new_password}
                onChangeText={(val) => setForm({ ...form, new_password: val })}
                isPassword
                error={errors.new_password?.[0]}
            />

            <SettingsInput
                label="Confirm Password"
                value={form.new_password_confirmation}
                onChangeText={(val) => setForm({ ...form, new_password_confirmation: val })}
                isPassword
                error={errors.new_password_confirmation?.[0]}
            />

            <UpdateButton onPress={handleUpdate} loading={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#FFF', padding: 25 },
    description: {
        fontFamily: 'LeagueSpartan',
        fontSize: 14,
        color: '#8E94C1',
        marginBottom: 35,
    }
});