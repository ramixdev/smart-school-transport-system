import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Button, Text } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function Page() {
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 6.7951,  // Default to Sri Lanka coordinates
    longitude: 79.9009,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setSelectedLocation(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
      setIsLoading(false);
    })();
  }, []);

  const handleLocationSelect = useCallback(() => {
    // TODO: Pass the selected location back to settings
    router.back();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <MaterialIcons 
          name="arrow-back" 
          size={24} 
          onPress={() => router.back()} 
          style={styles.backButton}
        />
        <Text variant="headlineMedium" style={styles.title}>Select Location</Text>
      </View>

      <MapView
        style={styles.map}
        region={selectedLocation}
        onRegionChange={setSelectedLocation}
        showsUserLocation
        showsMyLocationButton
        zoomEnabled
        rotateEnabled
      >
        <Marker
          coordinate={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          }}
          draggable
          onDragEnd={(e) => {
            setSelectedLocation(prev => ({
              ...prev,
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude,
            }));
          }}
        />
      </MapView>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleLocationSelect}
          style={styles.confirmButton}
        >
          Confirm Location
        </Button>
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmButton: {
    backgroundColor: '#5DB0C7',
  },
}); 