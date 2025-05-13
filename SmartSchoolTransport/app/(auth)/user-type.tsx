// app/(auth)/user-type.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useFonts } from 'expo-font';

type UserType = 'parent' | 'driver' | 'admin';

export default function UserTypeScreen() {
  const [fontsLoaded] = useFonts({
    'Nunito-Bold': require('../../assets/fonts/static/Nunito-Bold.ttf'),
    'Nunito-ExtraBold': require('../../assets/fonts/static/Nunito-ExtraBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSelectUserType = (userType: UserType) => {
    router.push({ pathname: '/(auth)/auth-landing', params: { userType } } as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Select User Type</Text>
        <Text style={styles.subtitle}>Please choose your role</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleSelectUserType('admin')}
        >
          <View style={styles.iconContainer}>
            <Image 
              source={require('../../assets/images/admin-icon.png')} 
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.optionText}>Admin</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleSelectUserType('parent')}
        >
          <View style={styles.iconContainer}>
            <Image 
              source={require('../../assets/images/parent-icon.png')} 
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.optionText}>Parent</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleSelectUserType('driver')}
        >
          <View style={styles.iconContainer}>
            <Image 
              source={require('../../assets/images/driver-icon.png')} 
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.optionText}>Driver</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');
const ICON_SIZE = width * 0.3; // 30% of screen width

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  headerContainer: {
    marginTop: 60,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  title: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 32,
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#666',
  },
  optionsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  option: {
    width: ICON_SIZE,
    aspectRatio: 1,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  icon: {
    width: ICON_SIZE * 0.45,
    height: ICON_SIZE * 0.45,
    marginBottom: 16,
  },
  optionText: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 19,
    color: '#000',
  },
});