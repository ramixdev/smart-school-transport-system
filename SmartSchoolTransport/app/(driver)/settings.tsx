import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text, Surface, TextInput, Button, Portal, Dialog } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data - replace with actual data from your database
const mockDriverData = {
  name: "Malsri De Silva",
  phone: "+94764856713",
  location: "PWX5+V6J, Unnamed Road, Panadura",
  photo: null, // Replace with actual photo URL from storage
};

export default function Settings() {
  const [phone, setPhone] = useState(mockDriverData.phone);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [location, setLocation] = useState(mockDriverData.location);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSchoolsPress = () => {
    router.push('./schools');
  };

  const handlePhoneEdit = () => {
    setIsEditingPhone(true);
  };

  const handlePhoneSave = () => {
    // TODO: Save phone number to database
    setIsEditingPhone(false);
  };

  const handleLocationEdit = () => {
    setIsEditingLocation(true);
  };

  const handleLocationSave = () => {
    // TODO: Save location to database
    setIsEditingLocation(false);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic (clear auth state, etc.)
    router.replace('/');
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text variant="headlineMedium" style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <Surface style={styles.photoContainer}>
            {mockDriverData.photo ? (
              <Image 
                source={{ uri: mockDriverData.photo }} 
                style={styles.profilePhoto} 
              />
            ) : (
              <MaterialIcons name="account-circle" size={120} color="#5DB0C7" />
            )}
          </Surface>
        </View>

        <Surface style={styles.infoCard}>
          <Text variant="titleMedium" style={styles.name}>
            {mockDriverData.name}
          </Text>
        </Surface>

        <Surface style={styles.infoCard}>
          <View style={styles.phoneContainer}>
            {isEditingPhone ? (
              <>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  mode="outlined"
                  style={styles.phoneInput}
                  keyboardType="phone-pad"
                />
                <Button onPress={handlePhoneSave} mode="contained">
                  Save
                </Button>
              </>
            ) : (
              <>
                <Text variant="bodyLarge">{phone}</Text>
                <Pressable onPress={handlePhoneEdit}>
                  <MaterialIcons name="edit" size={20} color="#5DB0C7" />
                </Pressable>
              </>
            )}
          </View>
        </Surface>

        <Pressable style={styles.menuItem} onPress={handleSchoolsPress}>
          <Text variant="titleMedium">Schools</Text>
          <MaterialIcons name="chevron-right" size={24} color="#000" />
        </Pressable>

        <Surface style={styles.infoCard}>
          <View style={styles.locationContainer}>
            {isEditingLocation ? (
              <>
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  mode="outlined"
                  style={styles.locationInput}
                  multiline
                />
                <Button onPress={handleLocationSave} mode="contained" style={styles.saveButton}>
                  Save
                </Button>
              </>
            ) : (
              <>
                <Text variant="bodyLarge" style={styles.location}>{location}</Text>
                <Pressable onPress={handleLocationEdit}>
                  <MaterialIcons name="edit" size={20} color="#5DB0C7" />
                </Pressable>
              </>
            )}
          </View>
        </Surface>

        <Pressable style={styles.actionButton} onPress={handleChangePassword}>
          <MaterialIcons name="lock" size={20} color="#4A90E2" />
          <Text style={styles.changePasswordText}>Change Password</Text>
        </Pressable>

        <Pressable 
          style={styles.logoutButton} 
          onPress={() => setLogoutDialogVisible(true)}
        >
          <MaterialIcons name="logout" size={20} color="#FF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to logout?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLogout} textColor="red">Logout</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  name: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneInput: {
    flex: 1,
    marginRight: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  locationInput: {
    flex: 1,
    marginRight: 8,
  },
  location: {
    flex: 1,
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  saveButton: {
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  changePasswordText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 