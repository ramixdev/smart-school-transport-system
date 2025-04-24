import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

// Mock data - replace with actual data from your database
const mockJourneyData = {
  morning: {
    pickups: [
      {
        id: '1',
        name: 'Ametha',
        location: { latitude: 6.7951, longitude: 79.8909 },
        eta: '13 min',
        distance: '1.1 km',
      },
      {
        id: '2',
        name: 'Govin',
        location: { latitude: 6.7960, longitude: 79.8920 },
        eta: '19 min',
        distance: '1.8 km',
      },
      // Add more students
    ],
    dropoffs: [
      {
        id: 'school1',
        name: "St. Peter's College",
        location: { latitude: 6.8021, longitude: 79.8564 },
        eta: '25 min',
        distance: '3.2 km',
      },
      // Add more schools
    ],
  },
  evening: {
    pickups: [
      {
        id: 'school1',
        name: "St. Peter's College",
        location: { latitude: 6.8021, longitude: 79.8564 },
        eta: '15 min',
        distance: '2.1 km',
      },
    ],
    dropoffs: [
      {
        id: '1',
        name: 'Ametha',
        location: { latitude: 6.7951, longitude: 79.8909 },
        eta: '23 min',
        distance: '2.8 km',
      },
      // Add more students
    ],
  },
};

// Mock optimized route coordinates
const mockRouteCoordinates = [
  { latitude: 6.7951, longitude: 79.8909 },
  { latitude: 6.7960, longitude: 79.8920 },
  { latitude: 6.8021, longitude: 79.8564 },
];

export default function JourneyMap() {
  const { journeyType } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [showStopsList, setShowStopsList] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [region, setRegion] = useState({
    latitude: 6.7951,
    longitude: 79.8909,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const isEvening = journeyType === 'evening';
  const journeyData = isEvening ? mockJourneyData.evening : mockJourneyData.morning;
  const stops = [...journeyData.pickups, ...journeyData.dropoffs];
  const currentStop = stops[currentStep];
  const nextStop = stops[currentStep + 1];

  const toggleStopsList = () => {
    const toValue = showStopsList ? 0 : 1;
    setShowStopsList(!showStopsList);
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
    }).start();
  };

  const getStopStatus = (index: number) => {
    if (isEvening) {
      if (index < journeyData.pickups.length) {
        return `Picking up from ${stops[index].name}`;
      }
      return `Dropping off ${stops[index].name}`;
    } else {
      if (index < journeyData.pickups.length) {
        return `Picking up ${stops[index].name}`;
      }
      return `Dropping off at ${stops[index].name}`;
    }
  };

  const handleEndJourney = () => {
    // TODO: Implement journey end logic
    router.back();
  };

  const handleBackPress = () => {
    router.replace('/(driver)');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Navigation Header */}
      <Surface style={styles.navigationHeader}>
        <View style={styles.headerContainer}>
          <IconButton
            icon="arrow-left"
            iconColor="#fff"
            size={24}
            onPress={handleBackPress}
            style={styles.backButton}
          />
          <View style={styles.navigationInfo}>
            <MaterialIcons name="turn-left" size={24} color="#fff" style={styles.turnIcon} />
            <View>
              <Text style={styles.distance}>100 ft</Text>
              <Text style={styles.streetName}>Galle Road</Text>
            </View>
          </View>
        </View>
      </Surface>

      {/* Map View */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {/* Route Line */}
        <Polyline
          coordinates={mockRouteCoordinates}
          strokeColor="#4285F4"
          strokeWidth={4}
        />

        {/* Markers for stops */}
        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={stop.location}
            title={stop.name}
            pinColor={index === currentStep ? '#4CAF50' : '#2196F3'}
          />
        ))}
      </MapView>

      {/* Journey Info Panel */}
      <Pressable onPress={toggleStopsList}>
        <Surface style={styles.journeyInfo}>
          <View style={styles.journeyDetails}>
            <View style={styles.etaInfo}>
              <Text style={styles.eta}>{currentStop?.eta}</Text>
              <Text style={styles.distance}>{currentStop?.distance}</Text>
            </View>
            <Text style={styles.status}>{getStopStatus(currentStep)}</Text>
          </View>

          {/* Expandable Stops List */}
          <Animated.View
            style={[
              styles.stopsList,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [200, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {stops.slice(currentStep + 1).map((stop, index) => (
              <View key={stop.id} style={styles.stopItem}>
                <Text style={styles.stopName}>{stop.name}</Text>
                {index < stops.length - currentStep - 2 && (
                  <MaterialIcons name="arrow-downward" size={20} color="#666" />
                )}
              </View>
            ))}
            <Pressable
              style={styles.endJourneyButton}
              onPress={handleEndJourney}
            >
              <Text style={styles.endJourneyText}>End Journey</Text>
            </Pressable>
          </Animated.View>
        </Surface>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigationHeader: {
    backgroundColor: '#5DB0C7',
    padding: 16,
    elevation: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
    marginLeft: -8,
  },
  navigationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  turnIcon: {
    marginRight: 16,
  },
  map: {
    flex: 1,
  },
  journeyInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
  },
  journeyDetails: {
    padding: 16,
  },
  etaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eta: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  distance: {
    fontSize: 18,
    color: '#fff',
  },
  streetName: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    color: '#666',
  },
  stopsList: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  stopItem: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
  },
  stopName: {
    fontSize: 16,
    marginBottom: 8,
  },
  endJourneyButton: {
    backgroundColor: '#FF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  endJourneyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 