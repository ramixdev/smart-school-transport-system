import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function ChangePassword() {
  const params = useLocalSearchParams();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    // Navigate back based on user type
    const userType = params.userType;
    switch (userType) {
      case 'admin':
        router.push('/(admin)/settings');
        break;
      case 'driver':
        router.push('/(driver)/settings');
        break;
      case 'parent':
        router.push('/(parent)/settings');
        break;
      default:
        router.back();
    }
  };

  const handleSave = async () => {
    setError('');
    
    // Validate inputs
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Implement password change logic based on user type
      const userType = params.userType;
      // Handle password change based on user type
      switch (userType) {
        case 'admin':
          // Verify against hardcoded admin credentials
          break;
        case 'driver':
        case 'parent':
          // Use authentication service
          break;
      }
      
      // On success:
      handleBack();
    } catch (err) {
      setError('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Surface style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text variant="titleLarge" style={styles.title}>Change Password</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputsContainer}>
            <TextInput
              label="Enter old password"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              theme={{ roundness: 8 }}
            />

            <TextInput
              label="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              theme={{ roundness: 8 }}
            />

            <TextInput
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              theme={{ roundness: 8 }}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            loading={isLoading}
            disabled={isLoading}
          >
            Save
          </Button>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#22242A',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  inputsContainer: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  error: {
    color: '#FF4444',
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: '#5B9BD5',
    borderRadius: 8,
    height: 50,
  },
}); 