// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { auth } from '../../contexts/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  const { userType } = useLocalSearchParams<{ userType: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check user type from custom claims or user data
      // For now, we'll use the userType from params
      if (userType === 'parent') {
        router.replace('/(parent)');
      } else if (userType === 'driver') {
        router.replace('/(driver)');
      } else if (userType === 'admin') {
        router.replace('/(admin)');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    console.log('Forgot password');
  };

  const handleCreateAccount = () => {
    router.push('/(auth)/user-type');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.triangleContainer}>
          <View style={styles.triangle} />
          <Image 
            source={require('../../assets/images/bus-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Login</Text>
          <View style={styles.underline} />
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
            />
          </View>

          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>forgot password ?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleCreateAccount}>
              <Text style={styles.createAccount}>create new account</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#22242A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    height: '95%',
    position: 'relative',
    overflow: 'hidden',
  },
  triangleContainer: {
    position: 'relative',
    height: '25%',
  },
  triangle: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 300,
    borderTopWidth: 220,
    borderRightColor: 'transparent',
    borderTopColor: '#5B9BD5',
  },
  logo: {
    position: 'absolute',
    width: 100,
    height: 80,
    left: 90,
    top: 50,
    zIndex: 1,
  },
  formContainer: {
    padding: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#22242A',
    marginBottom: 8,
  },
  underline: {
    width: 120,
    height: 4,
    backgroundColor: '#5B9BD5',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 8,
  },
  linksContainer: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  createAccount: {
    fontSize: 14,
    color: '#5B9BD5',
  },
  loginButton: {
    backgroundColor: '#5B9BD5',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    backgroundColor: '#5B9BD5',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});