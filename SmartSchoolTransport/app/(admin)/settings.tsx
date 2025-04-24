import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Mock admin data - replace with actual data from your backend
const mockAdminData = {
  name: 'Ramika Perera',
  username: 'Admin_123',
  imageUrl: null, // This will use the placeholder if null
};

export default function AdminSettings() {
  const handleBack = () => {
    router.back();
  };

  const handleChangePassword = () => {
    router.push({
      pathname: '/(admin)/change-password' as any
    });
  };

  const handleLogout = () => {
    // You would implement actual logout logic here
    // Clear any auth tokens or state
    
    // Navigate to the login screen - using absolute path to ensure it goes to login
    router.navigate('/');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Admin - Settings',
          headerShown: false,
        }}
      />

      {/* Header with back button */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {mockAdminData.imageUrl ? (
            <Image 
              source={{ uri: mockAdminData.imageUrl }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <MaterialIcons name="person" size={60} color="#fff" />
            </View>
          )}
        </View>

        {/* Admin Info Cards */}
        <Surface style={styles.infoCard}>
          <Text style={styles.infoText}>{mockAdminData.name}</Text>
        </Surface>

        <Surface style={styles.infoCard}>
          <Text style={styles.infoText}>{mockAdminData.username}</Text>
        </Surface>

        {/* Change Password */}
        <Pressable onPress={handleChangePassword}>
          <Text style={styles.changePasswordText}>Change Password</Text>
        </Pressable>

        {/* Logout Button */}
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color="#000" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
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
    padding: 20,
    paddingTop: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileImageContainer: {
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#5DB0C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    width: '100%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  infoText: {
    fontSize: 18,
  },
  changePasswordText: {
    fontSize: 18,
    color: '#5DB0C7',
    marginTop: 20,
    marginBottom: 30,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 18,
    marginLeft: 8,
  },
}); 