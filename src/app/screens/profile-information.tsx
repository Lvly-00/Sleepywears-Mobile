import api from '@/src/services/api';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SettingsInput } from '../../components/settings-input';
import { UpdateButton } from '../../components/update-button';

export default function ProfileInfoScreen() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

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
    try {
      await api.put("/user/settings", form);
      Alert.alert("Success", "Profile updated successfully");
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
        onChangeText={(val) => setForm({...form, name: val})}
        placeholder="Sleepywear"
        error={errors.name?.[0]}
      />

      <SettingsInput 
        label="Email"
        value={form.email}
        onChangeText={(val) => setForm({...form, email: val})}
        placeholder="Sleepywear@gmail.com"
        error={errors.email?.[0]}
      />

      <UpdateButton onPress={handleUpdate} loading={loading} />
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