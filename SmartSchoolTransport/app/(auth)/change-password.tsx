import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    router.back();
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
      // 1. For admin: Use hardcoded credentials to verify old password
      // 2. For drivers/parents: Use authentication service to verify and update password
      
      // On success:
      router.back();
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
          <Button
            icon={() => <MaterialIcons name="arrow-back" size={24} color="#000" />}
            onPress={handleBack}
            style={styles.backButton}
          />
          <Text variant="headlineMedium" style={styles.title}>Change Password</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Enter old password"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

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
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  form: {
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
    marginTop: 8,
    backgroundColor: '#5B9BD5',
  },
}); 