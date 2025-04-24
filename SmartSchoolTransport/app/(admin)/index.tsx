import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data - replace with actual data from your backend
const mockStats = {
  totalUsers: 256,
};

export default function AdminDashboard() {
  const handleNavigation = (route: string) => {
    router.push({
      pathname: `/(admin)/${route}` as any // Type assertion needed for route paths
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <Surface style={styles.header}>
        <Text style={styles.headerTitle}>Ramika Perera</Text>
        <Pressable 
          onPress={() => handleNavigation('settings')}
          style={styles.settingsButton}
        >
          <MaterialIcons name="settings" size={24} color="#fff" />
        </Pressable>
      </Surface>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Total Users: {mockStats.totalUsers}</Text>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable 
          style={styles.navButton}
          onPress={() => handleNavigation('students')}
        >
          <Surface style={styles.buttonContent}>
            <MaterialCommunityIcons 
              name="account-child" 
              size={32} 
              color="#5DB0C7" 
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Students</Text>
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color="#5DB0C7" 
              style={styles.arrowIcon}
            />
          </Surface>
        </Pressable>

        <Pressable 
          style={styles.navButton}
          onPress={() => handleNavigation('drivers')}
        >
          <Surface style={styles.buttonContent}>
            <MaterialCommunityIcons 
              name="account-tie" 
              size={32} 
              color="#5DB0C7" 
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Drivers</Text>
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color="#5DB0C7" 
              style={styles.arrowIcon}
            />
          </Surface>
        </Pressable>

        <Pressable 
          style={styles.navButton}
          onPress={() => handleNavigation('schools')}
        >
          <Surface style={styles.buttonContent}>
            <MaterialIcons 
              name="school" 
              size={32} 
              color="#5DB0C7" 
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Schools</Text>
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color="#5DB0C7" 
              style={styles.arrowIcon}
            />
          </Surface>
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
    backgroundColor: '#5DB0C7',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  statsContainer: {
    padding: 20,
  },
  statsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  buttonsContainer: {
    padding: 20,
    gap: 16,
  },
  navButton: {
    width: '100%',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5FAFA',
    borderRadius: 12,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 16,
  },
  buttonText: {
    fontSize: 18,
    color: '#5DB0C7',
    flex: 1,
  },
  arrowIcon: {
    opacity: 0.7,
  },
});