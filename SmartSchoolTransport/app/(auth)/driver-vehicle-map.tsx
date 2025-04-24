import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function DriverVehicleMapScreen() {
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 6.9271,
    longitude: 79.8612,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoading, setIsLoading] = useState(false);

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      if (result[0]) {
        const address = result[0];
        return [
          address.street,
          address.district,
          address.city,
          address.region,
        ].filter(Boolean).join(', ');
      }
      return `${latitude}, ${longitude}`;
    } catch (error) {
      console.error('Error getting address:', error);
      return `${latitude}, ${longitude}`;
    }
  };

  const handleConfirmLocation = async () => {
    setIsLoading(true);
    try {
      const address = await getAddressFromCoordinates(
        selectedLocation.latitude,
        selectedLocation.longitude
      );

      // Navigate back with both address and coordinates
      router.push({
        pathname: '/(auth)/driver-signup-vehicle',
        params: {
          selectedLocation: address,
          coordinates: `${selectedLocation.latitude}, ${selectedLocation.longitude}`
        }
      });
    } catch (error) {
      console.error('Error confirming location:', error);
      alert('Error getting location address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Starting Location</Text>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={selectedLocation}
        onRegionChangeComplete={setSelectedLocation}
      >
        <Marker
          coordinate={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          }}
        />
      </MapView>

      {/* Confirm Button */}
      <TouchableOpacity 
        style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]} 
        onPress={handleConfirmLocation}
        disabled={isLoading}
      >
        <Text style={styles.confirmButtonText}>
          {isLoading ? 'Getting Address...' : 'Confirm Location'}
        </Text>
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  map: {
    flex: 1,
  },
  confirmButton: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: '#5B9BD5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 