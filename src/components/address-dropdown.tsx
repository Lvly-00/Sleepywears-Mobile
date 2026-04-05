import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

interface AddressDropdownProps {
  label?: string;      // Added Label
  required?: boolean;  // Added Required flag for the asterisk
  addresses: string[];
  selectedAddress: string;
  onSelect: (address: string) => void;
  error?: string;
}

export const AddressDropdown = ({ 
  label, 
  required, 
  addresses, 
  selectedAddress, 
  onSelect, 
  error 
}: AddressDropdownProps) => {
  const [isFocus, setIsFocus] = useState(false);

  const data = addresses.map((addr) => ({ label: addr, value: addr }));

  const renderItem = (item: { label: string; value: string }) => {
    const isSelected = selectedAddress === item.value;
    return (
      <View style={[styles.item, isSelected && styles.selectedItemContainer]}>
        <Text style={[styles.textItem, isSelected && styles.selectedTextItem]} numberOfLines={2}>
          {item.label}
        </Text>
        {isSelected && (
          <MaterialCommunityIcons name="check" size={18} color="#0D0F66" />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* LABEL SECTION */}
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <Dropdown
        style={[
          styles.dropdown, 
          isFocus && styles.dropdownFocus,
          !!error && styles.dropdownError
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        containerStyle={styles.listContainer}
        data={data}
        maxHeight={250}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Select an address' : ''}
        value={selectedAddress}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          onSelect(item.value);
          setIsFocus(false);
        }}
        renderRightIcon={() => (
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={isFocus ? '#0D0F66' : '#8D92A3'}
            style={{ transform: [{ rotate: isFocus ? '180deg' : '0deg' }] }}
          />
        )}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    zIndex: 5000, 
    marginBottom: 5, // Space for the error message below
  },
  label: {
    fontSize: 14,
    color: '#0D0F66',
    fontWeight: '600',
    marginBottom: 4,
  },
  required: {
    color: 'red',
  },
  dropdown: {
    height: 45,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingHorizontal: 0,
    backgroundColor: '#FFF',
  },
  dropdownFocus: {
    borderBottomColor: '#0D0F66',
    borderBottomWidth: 2,
  },
  dropdownError: {
    borderBottomColor: '#9E2626',
  },
  placeholderStyle: {
    fontSize: 15,
    color: '#A0A0A0',
  },
  selectedTextStyle: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  listContainer: {
    borderRadius: 8,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedItemContainer: {
    backgroundColor: '#F4F4F4',
  },
  textItem: {
    fontSize: 14,
    color: '#4A4A4A',
    flex: 1,
    marginRight: 10,
  },
  selectedTextItem: {
    color: '#0D0F66',
    fontWeight: '600',
  },
});