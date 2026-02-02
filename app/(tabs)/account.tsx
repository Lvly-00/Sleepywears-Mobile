import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, List, Surface, Text } from 'react-native-paper';

export default function AccountScreen() {
  
  const handleLogout = () => {
    console.log('User logged out');
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      {/* 1. PROFILE HEADER SECTION */}
      <Surface style={styles.header} elevation={1}>
        <Avatar.Image 
          size={100} 
          source={{ uri: 'https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/392177261/original/dc71edee38b6a6ae07992b6bc1d01e25def7b7a3/draw-pfp-avatar-icon-album-cover-portrait-of-your-oc-vtuber-anime-character.png' }} // Placeholder image
          style={styles.avatar}
        />
        <Text style={styles.userName}>Miku</Text>
        <Text style={styles.userRole}>Store Manager</Text>
        
        <Button 
          mode="outlined" 
          onPress={() => {}} 
          style={styles.editButton}
          textColor="#AB8262"
          labelStyle={styles.editButtonLabel}
        >
          Edit Profile
        </Button>
      </Surface>

      {/* 2. SETTINGS LIST SECTION */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>General Settings</Text>
        
        <List.Item
          title="Personal Information"
          left={props => <List.Icon {...props} icon="account-outline" color="#0A0B32" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          titleStyle={styles.listTitle}
          onPress={() => {}}
        />
        <Divider />
        
        <List.Item
          title="Notification Preferences"
          left={props => <List.Icon {...props} icon="bell-outline" color="#0A0B32" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          titleStyle={styles.listTitle}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Privacy & Security"
          left={props => <List.Icon {...props} icon="shield-check-outline" color="#0A0B32" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          titleStyle={styles.listTitle}
          onPress={() => {}}
        />
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <List.Item
          title="Help & Support"
          left={props => <List.Icon {...props} icon="help-circle-outline" color="#0A0B32" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          titleStyle={styles.listTitle}
          onPress={() => {}}
        />
        <Divider />

        {/* 3. LOGOUT BUTTON */}
        <List.Item
          title="Logout"
          titleStyle={[styles.listTitle, { color: '#9E2626' }]}
          left={props => <List.Icon {...props} icon="logout" color="#9E2626" />}
          onPress={handleLogout}
        />
      </View>

      <Text style={styles.versionText}>Version 1.0.2 (Build 24)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F0ED', // Your brand light background
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    backgroundColor: '#AB8262',
    marginBottom: 15,
  },
  userName: {
    fontFamily: 'LeagueSpartan-Bold',
    fontSize: 26,
    color: '#0A0B32',
  },
  userRole: {
    fontFamily: 'LeagueSpartan',
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  editButton: {
    borderColor: '#AB8262',
    borderRadius: 10,
  },
  editButtonLabel: {
    fontFamily: 'LeagueSpartan-Bold',
  },
  listSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 15,
    overflow: 'hidden',
    paddingVertical: 5,
  },
  sectionTitle: {
    fontFamily: 'LeagueSpartan-Bold',
    fontSize: 14,
    color: '#AB8262',
    marginLeft: 15,
    marginTop: 10,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  listTitle: {
    fontFamily: 'LeagueSpartan',
    fontSize: 16,
    color: '#333',
  },
  versionText: {
    textAlign: 'center',
    fontFamily: 'LeagueSpartan',
    fontSize: 12,
    color: '#999',
    marginVertical: 30,
  },
});