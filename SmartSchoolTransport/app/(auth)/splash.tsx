import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import Colors from '../../constants/Colors';
import { ActivityIndicator } from 'react-native';

export default function SplashScreen() {
  useEffect(() => {
    // Auto navigate to user type selection after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/(auth)/user-type');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/images/bus-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>SMART SCHOOL TRANSPORT</Text>
        <Text style={styles.subtitle}>Track. Monitor. Manage.</Text>
      </View>
      
      <ActivityIndicator size="small" color="white" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  loader: {
    position: 'absolute',
    bottom: 32,
  }
});