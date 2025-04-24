import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Divider } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function AddSchoolScreen() {
  const [schoolName, setSchoolName] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to set the school location.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setIsMapVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!schoolName.trim()) {
      Alert.alert('Error', 'Please enter a school name');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Please set the school location');
      return;
    }

    try {
      // TODO: Implement the actual save to database logic here
      // This is where you would make an API call to save the school
      console.log('Saving school:', {
        name: schoolName,
        location,
      });

      Alert.alert('Success', 'School added successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save school. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Add New School',
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons 
          name="arrow-back" 
          size={24} 
          color="#000" 
          onPress={handleBack}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Add New School</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* School Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>School Name</Text>
          <TextInput
            style={styles.input}
            value={schoolName}
            onChangeText={setSchoolName}
            placeholder="Enter school name"
            mode="outlined"
          />
        </View>

        <Divider style={styles.divider} />

        {/* Location Section */}
        <View style={styles.locationContainer}>
          <Text style={styles.label}>School Location</Text>
          <Button
            mode="outlined"
            onPress={handleSetLocation}
            style={styles.locationButton}
            icon="map-marker"
          >
            Set Location from Map
          </Button>

          {isMapVisible && location && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onPress={(e) => {
                  setLocation({
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude,
                  });
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                />
              </MapView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
        >
          Save School
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
    padding: 20,
    paddingTop: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
  },
  divider: {
    marginVertical: 20,
  },
  locationContainer: {
    marginBottom: 20,
  },
  locationButton: {
    marginTop: 8,
  },
  mapContainer: {
    height: 300,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#5DB0C7',
  },
  saveButtonContent: {
    height: 50,
  },
}); 