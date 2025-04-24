import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Linking, Pressable } from 'react-native';
import { Text, Surface, Button, Avatar } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Colors } from '../../constants/Colors';

// Temporary mock data - will be replaced with real-time data
const mockChildren = [
  {
    id: 1,
    childName: 'Ametha Isiwara',
    driverName: 'Malsri De Silva',
    driverPhone: '+94771234567',
    eta: 37,
    currentLocation: {
      latitude: 6.8213,
      longitude: 79.8715,
    },
    destination: {
      latitude: 6.8356,
      longitude: 79.8653,
    },
    route: [
      { latitude: 6.8213, longitude: 79.8715 },
      { latitude: 6.8245, longitude: 79.8701 },
      { latitude: 6.8289, longitude: 79.8687 },
      { latitude: 6.8356, longitude: 79.8653 },
    ],
  },
  {
    id: 2,
    childName: 'Thejana Silva',
    driverName: 'Shehan Sampath',
    driverPhone: '+94777654321',
    eta: 43,
    currentLocation: {
      latitude: 6.8156,
      longitude: 79.8728,
    },
    destination: {
      latitude: 6.8356,
      longitude: 79.8653,
    },
    route: [
      { latitude: 6.8156, longitude: 79.8728 },
      { latitude: 6.8234, longitude: 79.8712 },
      { latitude: 6.8356, longitude: 79.8653 },
    ],
  },
  {
    id: 3,
    childName: 'Govin Wickramasooriya',
    driverName: 'K D Indasiri',
    driverPhone: '+94765432198',
    eta: 37,
    currentLocation: {
      latitude: 6.8198,
      longitude: 79.8745,
    },
    destination: {
      latitude: 6.8356,
      longitude: 79.8653,
    },
    route: [
      { latitude: 6.8198, longitude: 79.8745 },
      { latitude: 6.8267, longitude: 79.8698 },
      { latitude: 6.8356, longitude: 79.8653 },
    ],
  },
];

// Add this interface after the imports
interface ChildTracking {
  id: number;
  childName: string;
  driverName: string;
  driverPhone: string;
  eta: number;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  destination: {
    latitude: number;
    longitude: number;
  };
  route: Array<{
    latitude: number;
    longitude: number;
  }>;
}

export default function Page() {
  const [selectedChild, setSelectedChild] = useState<ChildTracking | null>(mockChildren[0]);
  const [mapRegion, setMapRegion] = useState({
    latitude: mockChildren[0].currentLocation.latitude,
    longitude: mockChildren[0].currentLocation.longitude,
    latitudeDelta: 0.0422,
    longitudeDelta: 0.0221,
  });

  const handleCallDriver = useCallback((phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  }, []);

  const handleChildSelect = useCallback((child: ChildTracking) => {
    setSelectedChild(child);
    setMapRegion(prev => ({
      ...prev,
      latitude: child.currentLocation.latitude,
      longitude: child.currentLocation.longitude,
    }));
  }, []);

  // Early return with loading state
  if (!selectedChild) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text>Loading...</Text>
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
        <Text variant="headlineMedium" style={styles.title}>Live Track</Text>
        <MaterialIcons 
          name="layers" 
          size={24} 
          style={styles.layersButton}
          onPress={() => {/* TODO: Implement layer switching */}}
        />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation
          showsMyLocationButton
          zoomEnabled
          rotateEnabled
        >
          <Marker
            coordinate={selectedChild.currentLocation}
            title={selectedChild.driverName}
            description={`Driver of ${selectedChild.childName}`}
          >
            <View style={styles.vehicleMarker}>
              <MaterialIcons name="directions-bus" size={24} color={Colors.light.primary} />
            </View>
          </Marker>

          <Marker
            coordinate={selectedChild.destination}
            title="Destination"
            description="Drop-off location"
          >
            <View style={styles.destinationMarker}>
              <MaterialIcons name="location-on" size={24} color={Colors.light.error} />
            </View>
          </Marker>

          <Polyline
            coordinates={selectedChild.route}
            strokeColor={Colors.light.primary}
            strokeWidth={3}
          />
        </MapView>
      </View>

      <View style={styles.childList}>
        {mockChildren.map((child) => (
          <Pressable
            key={child.id}
            onPress={() => handleChildSelect(child)}
          >
            <Surface 
              style={[
                styles.childCard,
                selectedChild.id === child.id && styles.selectedCard
              ].filter(Boolean)} 
              elevation={1}
            >
              <View style={styles.childCardContent}>
                <Avatar.Icon 
                  size={40} 
                  icon="account" 
                  style={styles.avatar}
                  color={Colors.light.primary}
                />
                <View style={styles.childInfo}>
                  <Text variant="titleMedium" style={styles.childName}>{child.childName}</Text>
                  <Text variant="bodyMedium" style={styles.driverInfo}>{child.driverName}</Text>
                  <Text variant="bodyMedium" style={styles.eta}>ETA: {child.eta} minutes</Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => handleCallDriver(child.driverPhone)}
                  style={styles.callButton}
                >
                  Call Driver
                </Button>
              </View>
            </Surface>
          </Pressable>
        ))}
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
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  backButton: {
    padding: 8,
  },
  layersButton: {
    padding: 8,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  vehicleMarker: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  destinationMarker: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  childList: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  childCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  childCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    backgroundColor: Colors.light.primary + '10',
  },
  childInfo: {
    flex: 1,
    marginLeft: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  driverInfo: {
    fontSize: 14,
    color: '#666',
  },
  eta: {
    fontSize: 14,
    marginTop: 4,
  },
  callButton: {
    marginLeft: 8,
  },
}); 