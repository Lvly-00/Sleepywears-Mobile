import { Ionicons } from '@expo/vector-icons'; // Or your custom Icons
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isPassword?: boolean;
  error?: string;
  disabled?: boolean;
}


export const SettingsInput = ({ label, value, onChangeText, placeholder, isPassword, error, disabled }: Props) => {
  const [secure, setSecure] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.errorBorder : null]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B0B3C7"
          secureTextEntry={isPassword && secure}
          editable={!disabled}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Ionicons
              name={secure ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#232D80"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 25 },
  label: {
    fontFamily: 'LeagueSpartan-Medium',
    fontSize: 16,
    color: '#232D80',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#232D80',
    paddingBottom: 5,
  },
  input: {
    flex: 1,
    fontFamily: 'LeagueSpartan',
    fontSize: 16,
    color: '#232c808f',
    paddingVertical: 5,
  },
  errorBorder: { borderBottomColor: '#9E2626' },
  errorText: { color: '#9E2626', fontSize: 12, marginTop: 5, fontFamily: 'LeagueSpartan' },
});