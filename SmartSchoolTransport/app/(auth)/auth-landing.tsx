import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';

type UserType = 'parent' | 'driver' | 'admin';

export default function AuthLanding() {
  const { userType } = useLocalSearchParams<{ userType: UserType }>();

  const handleLogin = () => {
    router.push({ pathname: '/(auth)/login', params: { userType } });
  };

  const handleSignUp = () => {
    if (userType === 'parent') {
      router.push('/(auth)/parent-signup');
    } else if (userType === 'driver') {
      router.push('/(auth)/driver-signup-personal');
    } else if (userType === 'admin') {
      // Optionally, handle admin signup or show a message
      // For now, just go to login
      router.push({ pathname: '/(auth)/login', params: { userType } });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Continue as {userType?.charAt(0).toUpperCase() + userType?.slice(1)}</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      {userType !== 'admin' && (
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#5B9BD5',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 