import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

// ... interfaces remain the same ...

export const CollectionDropdown = ({ collections, selected, onSelect }: CollectionDropdownProps) => {
    const [isFocus, setIsFocus] = useState(false);

    const renderItem = (item: Collection) => {
        const isSelected = selected?.id === item.id;
        return (
            <View style={[styles.item, isSelected && styles.selectedItemContainer]}>
                <Text style={[styles.textItem, isSelected && styles.selectedTextItem]}>
                    {item.name}
                </Text>
                {isSelected && (
                    <MaterialCommunityIcons name="check" size={18} color="#000" />
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Dropdown
                style={[styles.dropdown, isFocus && styles.dropdownFocus]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.listContainer}
                data={collections}
                maxHeight={250}
                labelField="name"
                valueField="id"
                placeholder={!isFocus ? 'Select collection' : ''}
                value={selected?.id}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    onSelect(item);
                    setIsFocus(false);
                }}
                renderRightIcon={() => (
                    <MaterialCommunityIcons
                        name="chevron-down"
                        size={20}
                        color={isFocus ? '#000' : '#8D92A3'}
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
        paddingHorizontal: 20,
        paddingVertical: 12,
        zIndex: 5000, 
    },
    dropdown: {
        height: 48,
        borderColor: '#EAEAEA',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: '#FAFAFA', // Very light gray background
    },
    dropdownFocus: {
        borderColor: '#000', // Sharp, minimal focus indicator
        backgroundColor: '#fff',
    },
    placeholderStyle: {
        fontSize: 15,
        color: '#A0A0A0',
        fontWeight: '400',
    },
    selectedTextStyle: {
        fontSize: 15,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    listContainer: {
        borderRadius: 8,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        backgroundColor: '#fff',
        // Minimal subtle shadow
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
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
        backgroundColor: '#F8F8F8',
    },
    textItem: {
        fontSize: 15,
        color: '#4A4A4A',
    },
    selectedTextItem: {
        color: '#000',
        fontWeight: '600',
    },
});