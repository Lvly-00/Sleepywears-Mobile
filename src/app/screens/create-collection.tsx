import React from 'react';
import { StyleSheet, View } from 'react-native';
import CollectionForm from '../../components/collection-form';

export default function CreateCollectionScreen() {
  return (
    <View style={styles.container}>
      <CollectionForm mode="create" />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });