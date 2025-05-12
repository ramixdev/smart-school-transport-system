// app/(auth)/login.tsx
import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { auth } from '../../contexts/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useFonts } from 'expo-font';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const { userType } = useLocalSearchParams<{ userType: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Nunito: require('../../assets/fonts/static/Nunito-Regular.ttf'),
    'Nunito-Bold': require('../../assets/fonts/static/Nunito-Bold.ttf'),
  });
  if (!fontsLoaded) return null;

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.triangleContainer}>
          <View style={styles.triangle} />
          <View style={styles.triangleBg} />
          <Text style={styles.greeting}>Hello !</Text>
          <Image 
            source={require('../../assets/images/bus-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.formCard}>
          <Text style={styles.title}>Login</Text>
          <View style={styles.underline} />
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.nunito]}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#888"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.nunito]}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              placeholderTextColor="#888"
            />
          </View>
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={[styles.forgotPassword, styles.nunitoBold]}>forgot password ?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreateAccount}>
              <Text style={[styles.createAccount, styles.nunitoBold]}>create new account</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={[styles.loginButtonText, styles.nunitoBold]}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backButtonText, styles.nunitoBold]}>BACK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#5B9BD5',
  },
  container: {
    flex: 1,
    backgroundColor: '#22242A',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  triangleContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.28,
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  triangle: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: SCREEN_WIDTH,
    borderTopWidth: SCREEN_HEIGHT * 0.28,
    borderRightColor: 'transparent',
    borderTopColor: '#5B9BD5',
  },
  triangleBg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: SCREEN_WIDTH,
    borderTopWidth: SCREEN_HEIGHT * 0.28,
    borderRightColor: 'transparent',
    borderTopColor: '#E3EAF6',
    zIndex: -1,
  },
  logo: {
    position: 'absolute',
    width: 140,
    height: 112,
    left: SCREEN_WIDTH * 0.03,
    top: SCREEN_HEIGHT * 0.03,
    zIndex: 1,
  },
  formCard: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#22242A',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  underline: {
    width: 120,
    height: 4,
    backgroundColor: '#5B9BD5',
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    marginBottom: 24,
    width: '100%',
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 8,
    width: '100%',
  },
  linksContainer: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
    width: '100%',
    alignItems: 'flex-start',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#D90429',
    fontWeight: 'bold',
  },
  createAccount: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#5B9BD5',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
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
  greeting: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.15,
    left: SCREEN_WIDTH * 0.58,
    color: '#fff',
    fontSize: 40,
    fontFamily: 'Nunito-Bold',
    zIndex: 2,
  },
  nunito: {
    fontFamily: 'Nunito',
  },
  nunitoBold: {
    fontFamily: 'Nunito-Bold',
  },
});