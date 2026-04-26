import SuccessModal from '@/src/components/success-modal';
import api from '@/src/services/api';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SettingsInput } from '../../components/settings-input';
import { UpdateButton } from '../../components/update-button';

export default function ProfileInfoScreen() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [modal, setModal] = useState({
    visible: false,
    loading: false,
    message: '',
  });


  useEffect(() => {
    const fetchProfile = async () => {
      const res = await api.get("/user/settings");
      setForm({ name: res.data.name, email: res.data.email });
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    setErrors({});
    setModal({
      visible: true,
      loading: true,
      message: "Updating profile...",
    });
    try {
      await api.put("/user/settings", form);

      await SecureStore.setItemAsync('user_name', form.name);
      await SecureStore.setItemAsync('user_email', form.email);
      
      setModal({
        visible: true,
        loading: false,
        message: "Profile updated successfully!",
      });
      setTimeout(() => {
        setModal({ visible: false, loading: false, message: "" });
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
      <Text style={styles.description}>Update your Business Name and Email.</Text>

      <SettingsInput
        label="Name"
        value={form.name}
        onChangeText={(val) => setForm({ ...form, name: val })}
        placeholder="Sleepywear"
        error={errors.name?.[0]}
      />

      <SettingsInput
        label="Email"
        value={form.email}
        onChangeText={(val) => setForm({ ...form, email: val })}
        placeholder="Sleepywear@gmail.com"
        error={errors.email?.[0]}
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
    fontSize: 15,
    color: '#232D80',
    marginBottom: 30,
  }
});