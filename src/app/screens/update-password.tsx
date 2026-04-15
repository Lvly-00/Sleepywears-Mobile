import api from '@/src/services/api';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SettingsInput } from '../../components/settings-input';
import { UpdateButton } from '../../components/update-button';
// import { useAuth } from '../../context/auth';
import SuccessModal from '@/src/components/success-modal';
import * as SecureStore from 'expo-secure-store';


const ERROR_COLOR = '#9E2626';

export default function UpdatePasswordScreen() {
    // const { setHasToken } = useAuth();
    const [form, setForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const [modal, setModal] = useState({
        visible: false,
        loading: false,
        message: '',
    });

    const handleUpdate = async () => {
        if (form.new_password !== form.new_password_confirmation) {
            setErrors({ new_password_confirmation: ["Passwords do not match"] });
            setModal(prev => ({ ...prev, visible: false }));
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await api.put("/user/settings/password", form);


            await SecureStore.setItemAsync("force_login", "true");


            await SecureStore.deleteItemAsync("access_token");
            await SecureStore.deleteItemAsync("user_email");
            await SecureStore.deleteItemAsync("user_name");
            await SecureStore.deleteItemAsync("last_activity");
            await SecureStore.deleteItemAsync("biometric_registered");
            await SecureStore.deleteItemAsync("biometrics_enabled");


            setModal({
                visible: true,
                loading: false,
                message: "Password updated successfully. Please log in again.",
            });

            setTimeout(() => {
                router.replace("/"); // login screen
            }, 2000);

        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
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
            <SuccessModal
                visible={modal.visible}
                isLoading={modal.loading}
                message={modal.message}
            />
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