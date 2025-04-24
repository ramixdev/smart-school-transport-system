// app/(auth)/driver-signup-vehicle.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Portal, Modal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  VEHICLE_NUMBER: 'driver_vehicle_number',
  CAPACITY: 'driver_vehicle_capacity',
  LOCATION: 'driver_vehicle_location',
  PHOTOS: 'driver_vehicle_photos'
};

export default function DriverSignUpVehicleScreen() {
  const params = useLocalSearchParams();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [startingLocation, setStartingLocation] = useState('');
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([]);
  const [photoMenuVisible, setPhotoMenuVisible] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Handle location selection from map
  useEffect(() => {
    if (params.selectedLocation) {
      setStartingLocation(params.selectedLocation as string);
      AsyncStorage.setItem(STORAGE_KEYS.LOCATION, params.selectedLocation as string);
    }
  }, [params.selectedLocation]);

  const loadSavedData = async () => {
    try {
      const [savedNumber, savedCapacity, savedLocation, savedPhotos] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.VEHICLE_NUMBER),
        AsyncStorage.getItem(STORAGE_KEYS.CAPACITY),
        AsyncStorage.getItem(STORAGE_KEYS.LOCATION),
        AsyncStorage.getItem(STORAGE_KEYS.PHOTOS),
      ]);

      if (savedNumber) setVehicleNumber(savedNumber);
      if (savedCapacity) setCapacity(savedCapacity);
      if (savedLocation) setStartingLocation(savedLocation);
      if (savedPhotos) setVehiclePhotos(JSON.parse(savedPhotos));
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const handleVehicleNumberChange = async (text: string) => {
    setVehicleNumber(text);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VEHICLE_NUMBER, text);
    } catch (error) {
      console.error('Error saving vehicle number:', error);
    }
  };

  const handleCapacityChange = async (text: string) => {
    setCapacity(text);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CAPACITY, text);
    } catch (error) {
      console.error('Error saving capacity:', error);
    }
  };

  const handleNext = async () => {
    // Validate inputs
    if (!vehicleNumber.trim()) {
      alert('Please enter vehicle number');
      return;
    }
    if (!capacity.trim()) {
      alert('Please enter vehicle capacity');
      return;
    }
    if (!startingLocation) {
      alert('Please set vehicle starting location');
      return;
    }
    if (vehiclePhotos.length === 0) {
      alert('Please add at least one vehicle photo');
      return;
    }

    // Clear all saved data
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.VEHICLE_NUMBER),
        AsyncStorage.removeItem(STORAGE_KEYS.CAPACITY),
        AsyncStorage.removeItem(STORAGE_KEYS.LOCATION),
        AsyncStorage.removeItem(STORAGE_KEYS.PHOTOS),
      ]);
    } catch (error) {
      console.error('Error clearing saved data:', error);
    }

    // Navigate to school selection
    router.push('/(auth)/driver-signup-school');
  };
  
  const handleSetLocationFromMap = () => {
    router.push('/(auth)/driver-vehicle-map');
  };
  
  const pickImage = async () => {
    setPhotoMenuVisible(false);
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to add photos!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const updatedPhotos = [...vehiclePhotos, result.assets[0].uri];
        setVehiclePhotos(updatedPhotos);
        await AsyncStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(updatedPhotos));
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const takePhoto = async () => {
    setPhotoMenuVisible(false);
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to take photos!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const updatedPhotos = [...vehiclePhotos, result.assets[0].uri];
        setVehiclePhotos(updatedPhotos);
        await AsyncStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(updatedPhotos));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Enter Vehicle Details</Text>
          <Text style={styles.subtitle}>Fill in the required details of the vehicle</Text>
          
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Vehicle number"
              value={vehicleNumber}
              onChangeText={handleVehicleNumberChange}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Full capacity of the vehicle"
              value={capacity}
              onChangeText={handleCapacityChange}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Vehicle Starting Location"
              value={startingLocation}
              editable={false}
            />
            
            <TouchableOpacity 
              style={styles.locationButton} 
              onPress={handleSetLocationFromMap}
            >
              <Ionicons name="location-outline" size={18} color="#4DC0B5" />
              <Text style={styles.locationButtonText}>set location from map</Text>
            </TouchableOpacity>
            
            <Text style={styles.photoLabel}>Add clear photos of the vehicle :</Text>
            
            <View style={styles.photoGrid}>
              {vehiclePhotos.map((photo, index) => (
                <Image 
                  key={index} 
                  source={{ uri: photo }} 
                  style={styles.vehiclePhoto} 
                />
              ))}
              <TouchableOpacity 
                style={styles.addPhotoButton}
                onPress={() => setPhotoMenuVisible(true)}
              >
                <Ionicons name="add" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.nextButton,
              (!vehicleNumber || !capacity || !startingLocation || vehiclePhotos.length === 0) && 
              styles.nextButtonDisabled
            ]} 
            onPress={handleNext}
            disabled={!vehicleNumber || !capacity || !startingLocation || vehiclePhotos.length === 0}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Photo Selection Modal */}
      <Portal>
        <Modal
          visible={photoMenuVisible}
          onDismiss={() => setPhotoMenuVisible(false)}
          contentContainerStyle={styles.photoMenu}
        >
          <TouchableOpacity style={styles.photoMenuItem} onPress={pickImage}>
            <Ionicons name="images-outline" size={24} color="#333" />
            <Text style={styles.photoMenuText}>Choose from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoMenuItem} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={24} color="#333" />
            <Text style={styles.photoMenuText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => setPhotoMenuVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#22242A',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: '100%',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22242A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
    fontSize: 16,
    paddingBottom: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -12,
    marginBottom: 24,
  },
  locationButtonText: {
    marginLeft: 8,
    color: '#4DC0B5',
    fontSize: 14,
  },
  photoLabel: {
    fontSize: 16,
    color: '#22242A',
    marginBottom: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  vehiclePhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  addPhotoButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#4DC0B5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#5B9BD5',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  nextButtonDisabled: {
    backgroundColor: '#BDC3C7',
    opacity: 0.7,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoMenu: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  photoMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  photoMenuText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});