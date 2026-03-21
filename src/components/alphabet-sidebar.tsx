import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AlphabetSidebarProps {
  onLetterPress: (letter: string) => void;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

export const AlphabetSidebar = ({ onLetterPress }: AlphabetSidebarProps) => {
  return (
    <View style={styles.sidebar}>
      {ALPHABET.map((char) => (
        <TouchableOpacity 
          key={char} 
          onPress={() => onLetterPress(char)}
          hitSlop={{ top: 5, bottom: 5, left: 10, right: 10 }} // Makes it easier to tap
        >
          <Text style={styles.sidebarChar}>{char}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 5,
    backgroundColor: 'white'
  },
  sidebarChar: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1D2671',
    marginVertical: 1,
  },
});