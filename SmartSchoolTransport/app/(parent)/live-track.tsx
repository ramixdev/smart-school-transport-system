import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Linking, Pressable } from 'react-native';
import { Text, Surface, Button, Avatar } from 'react-native-paper';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { subscribeToDriverLocation } from '../../services/api';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../contexts/firebase';
import { useAuth } from '../../contexts/firebase';

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

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

export default function Page() {
  const { childId } = useLocalSearchParams();
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number; timestamp: number } | null>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [route, setRoute] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [eta, setEta] = useState<number | null>(null);

  // Fetch all children for the parent
  useEffect(() => {
    if (!user) return;
    async function fetchChildren() {
      const q = query(collection(db, 'children'), where('parentId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const childrenList: any[] = [];
      querySnapshot.forEach((doc) => {
        childrenList.push({ id: doc.id, ...doc.data() });
      });
      setChildren(childrenList);
      // Select the child from param or default to first
      const found = childrenList.find((c) => c.id === childId);
      setSelectedChild(found || childrenList[0] || null);
    }
    fetchChildren();
  }, [user, childId]);

  // Fetch school location for destination marker
  useEffect(() => {
    async function fetchDestination() {
      if (selectedChild && selectedChild.school) {
        const schoolDoc = await getDoc(doc(db, 'schools', selectedChild.school));
        if (schoolDoc.exists()) {
          const schoolData = schoolDoc.data();
          if (schoolData.location) {
            setDestination({ latitude: schoolData.location.latitude, longitude: schoolData.location.longitude });
          }
        }
      }
    }
    fetchDestination();
  }, [selectedChild]);

  // Fetch route from journeys for the selected child
  useEffect(() => {
    async function fetchRoute() {
      if (!selectedChild) return;
      const journeysRef = collection(db, 'journeys');
      const q = query(
        journeysRef,
        where('children', 'array-contains', selectedChild.id),
        where('status', '==', 'in_progress')
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const journeyDoc = querySnapshot.docs[0];
        const journeyData = journeyDoc.data();
        if (journeyData.route && journeyData.route.stops) {
          setRoute(journeyData.route.stops.map((stop: any) => stop.location));
        } else {
          setRoute([]);
        }
      } else {
        setRoute([]);
      }
    }
    fetchRoute();
  }, [selectedChild]);

  // Subscribe to driver's location
  useEffect(() => {
    if (!selectedChild || !selectedChild.driver) return;
    const unsubscribe = subscribeToDriverLocation(selectedChild.driver, (location) => {
      setDriverLocation(location);
      if (location) {
        setMapRegion((prev: any) => ({
          ...prev,
          latitude: location.latitude,
          longitude: location.longitude,
        }));
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedChild]);

  // Calculate ETA (simple straight-line, assume 30km/h average speed)
  useEffect(() => {
    if (driverLocation && destination) {
      const dist = haversineDistance(driverLocation.latitude, driverLocation.longitude, destination.latitude, destination.longitude);
      const speed = 30; // km/h
      const etaMinutes = Math.round((dist / speed) * 60);
      setEta(etaMinutes);
    } else {
      setEta(null);
    }
  }, [driverLocation, destination]);

  if (!selectedChild || !driverLocation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Child selector for multiple children */}
      {children.length > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 8 }}>
          {children.map((child) => (
            <Button
              key={child.id}
              mode={selectedChild.id === child.id ? 'contained' : 'outlined'}
              onPress={() => setSelectedChild(child)}
              style={{ marginHorizontal: 4 }}
            >
              {child.name}
            </Button>
          ))}
        </View>
      )}
      {/* ETA display */}
      {eta !== null && (
        <View style={{ alignItems: 'center', margin: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>ETA: {eta} min</Text>
        </View>
      )}
      <MapView
        style={{ flex: 1 }}
        region={mapRegion || {
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onRegionChangeComplete={setMapRegion}
        showsUserLocation
        showsMyLocationButton
        zoomEnabled
        rotateEnabled
      >
        {/* Driver marker */}
        <Marker
          coordinate={{ latitude: driverLocation.latitude, longitude: driverLocation.longitude }}
          title={selectedChild.driverName || 'Driver'}
          description={`Driver of ${selectedChild.name}`}
        >
          <View style={{ backgroundColor: '#fff', padding: 8, borderRadius: 20, elevation: 3 }}>
            <MaterialIcons name="directions-bus" size={24} color={Colors.light.primary} />
          </View>
        </Marker>
        {/* Destination marker */}
        {destination && (
          <Marker
            coordinate={destination}
            title="Destination"
            description="School location"
          >
            <View style={{ backgroundColor: '#fff', padding: 8, borderRadius: 20, elevation: 3 }}>
              <MaterialIcons name="location-on" size={24} color={Colors.light.error} />
            </View>
          </Marker>
        )}
        {/* Route polyline */}
        {route.length > 1 && (
          <Polyline
            coordinates={route}
            strokeColor={Colors.light.primary}
            strokeWidth={3}
          />
        )}
      </MapView>
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