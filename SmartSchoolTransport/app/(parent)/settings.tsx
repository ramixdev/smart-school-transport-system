import React, { useState } from 'react';
import { View, StyleSheet, Alert, Pressable, Image } from 'react-native';
import { Text, TextInput, Button, Portal, Dialog, Surface } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Mock data - replace with actual data from your database
const mockParentData = {
  name: "Dumidu Ranjith",
  phone: "+94764589761",
  location: "18-14 De Mel Rd, Moratuwa 10400",
  photo: null as string | null, // Replace with actual photo URL from storage
};

const Settings = () => {
  const [name, setName] = useState(mockParentData.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [phone, setPhone] = useState(mockParentData.phone);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [location, setLocation] = useState(mockParentData.location);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(mockParentData.photo);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const handleLogout = () => {
    // TODO: Implement logout logic with Firebase
    router.replace('/');
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    // TODO: Implement account deletion logic with Firebase
    setShowDeleteDialog(false);
    router.replace('/');
  };

  const handleMapSelection = () => {
    router.push('/map-selection');
  };

  const handleChangePassword = () => {
    router.push({
      pathname: '/change-password',
      params: { userType: 'parent' }
    });
  };

  const handleBack = () => {
    router.push('/(parent)');
  };

  const handleNameSave = () => {
    // TODO: Save name to database
    setIsEditingName(false);
  };

  const handlePhoneSave = () => {
    // TODO: Save phone to database
    setIsEditingPhone(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfilePhoto(result.assets[0].uri);
        // TODO: Upload image to storage and update database
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
    setShowPhotoOptions(false);
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Error', 'Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfilePhoto(result.assets[0].uri);
        // TODO: Upload image to storage and update database
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
    setShowPhotoOptions(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text variant="headlineMedium" style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <Pressable onPress={() => setShowPhotoOptions(true)}>
            <Surface style={styles.photoContainer}>
              {profilePhoto ? (
                <Image 
                  source={{ uri: profilePhoto }} 
                  style={styles.profilePhoto} 
                />
              ) : (
                <MaterialIcons name="account-circle" size={120} color="#5DB0C7" />
              )}
              <View style={styles.editPhotoButton}>
                <MaterialIcons name="photo-camera" size={20} color="#fff" />
              </View>
            </Surface>
          </Pressable>
        </View>

        <Surface style={styles.infoCard}>
          <View style={styles.infoRow}>
            {isEditingName ? (
              <View style={styles.editContainer}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.editInput}
                  autoFocus
                />
                <Pressable onPress={handleNameSave}>
                  <MaterialIcons name="check" size={20} color="#5DB0C7" />
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={styles.infoText}>{name}</Text>
                <Pressable onPress={() => setIsEditingName(true)}>
                  <MaterialIcons name="edit" size={20} color="#5DB0C7" />
                </Pressable>
              </>
            )}
          </View>
        </Surface>

        <Surface style={styles.infoCard}>
          <View style={styles.infoRow}>
            {isEditingPhone ? (
              <View style={styles.editContainer}>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.editInput}
                  keyboardType="phone-pad"
                  autoFocus
                />
                <Pressable onPress={handlePhoneSave}>
                  <MaterialIcons name="check" size={20} color="#5DB0C7" />
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={styles.infoText}>{phone}</Text>
                <Pressable onPress={() => setIsEditingPhone(true)}>
                  <MaterialIcons name="edit" size={20} color="#5DB0C7" />
                </Pressable>
              </>
            )}
          </View>
        </Surface>

        <Surface style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{location}</Text>
          </View>
        </Surface>

        <Pressable onPress={handleMapSelection} style={styles.locationButton}>
          <MaterialIcons name="location-on" size={20} color="#5DB0C7" />
          <Text style={styles.locationButtonText}>set location from map</Text>
        </Pressable>

        <Pressable onPress={handleChangePassword} style={styles.actionButton}>
          <MaterialIcons name="lock" size={20} color="#4A90E2" />
          <Text style={styles.changePasswordText}>Change Password</Text>
        </Pressable>

        <View style={styles.bottomButtons}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>

          <Pressable style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
            <MaterialIcons name="delete" size={20} color="#FF4444" />
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </Pressable>
        </View>
      </View>

      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Delete Account</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete your account? This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button onPress={confirmDelete} textColor="red">Delete</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showPhotoOptions} onDismiss={() => setShowPhotoOptions(false)}>
          <Dialog.Title>Change Profile Photo</Dialog.Title>
          <Dialog.Content>
            <View style={styles.photoOptions}>
              <Button 
                mode="contained" 
                onPress={takePhoto}
                icon="camera"
                style={styles.photoOptionButton}
              >
                Take Photo
              </Button>
              <Button 
                mode="contained" 
                onPress={pickImage}
                icon="image"
                style={styles.photoOptionButton}
              >
                Choose from Gallery
              </Button>
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
};

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
    position: 'relative',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#5DB0C7',
    borderRadius: 12,
    padding: 4,
    margin: 4,
  },
  photoOptions: {
    gap: 12,
  },
  photoOptionButton: {
    marginVertical: 4,
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  infoText: {
    fontSize: 16,
    color: '#000',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  locationButtonText: {
    color: '#5DB0C7',
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  changePasswordText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomButtons: {
    marginTop: 'auto',
  },
  logoutButton: {
    backgroundColor: '#5DB0C7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteAccountText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Settings; 