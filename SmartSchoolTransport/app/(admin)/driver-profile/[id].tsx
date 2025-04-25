import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Pressable } from 'react-native';
import { Text, Avatar, Button, Menu, Divider } from 'react-native-paper';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import StarRating from '../../../components/StarRating';

type RouteParams = {
  id: string;
}

// Mock data - replace with actual data from your database
const mockDriver = {
  id: '1',
  name: 'Malsri De Silva',
  photoUrl: null,
  contactNumber: '+94764856713',
  experience: '30 years',
  address: 'PWX5+V6J, Unnamed Road, Panadura',
  nic: '743924789V',
  dateOfBirth: '10/01/2018',
  rating: 4.5,
  totalRatings: 128,
  vehicle: {
    number: 'NB 7581',
    startLocation: 'PWX5+V6J, Unnamed Road, Panadura',
    capacity: 40,
    photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg']
  }
};

export default function DriverProfileScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const id = params.id;
  const [menuVisible, setMenuVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSchoolsPress = () => {
    router.push({
      pathname: "/(admin)/driver-schools/[id]" as const,
      params: { id }
    });
  };

  const handleDeleteDriver = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Driver',
      'Are you sure you want to delete this driver? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              // TODO: Implement actual delete logic here
              // Delete driver and vehicle records from database
              console.log('Deleting driver:', id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete driver. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Driver Profile',
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
        <Text style={styles.headerTitle}>Driver Profile</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Pressable onPress={() => setMenuVisible(true)}>
              <MaterialIcons 
                name="more-vert" 
                size={24} 
                color="#000" 
                style={styles.menuButton}
              />
            </Pressable>
          }
        >
          <Menu.Item 
            onPress={handleDeleteDriver} 
            title="Delete Driver" 
            leadingIcon="delete"
          />
        </Menu>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Avatar.Icon 
            size={80} 
            icon="account"
            style={styles.avatar}
            color="#fff"
          />
          <Text style={styles.name}>{mockDriver.name}</Text>
          
          {/* Rating Section */}
          <View style={styles.ratingContainer}>
            <StarRating
              rating={mockDriver.rating}
              size={24}
              disabled={true}
            />
            <Text style={styles.ratingText}>
              {mockDriver.rating.toFixed(1)} ({mockDriver.totalRatings} ratings)
            </Text>
          </View>
        </View>

        {/* Driver Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailText}>{mockDriver.contactNumber}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailText}>Experience : {mockDriver.experience}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailText}>{mockDriver.address}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailText}>{mockDriver.nic}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailText}>{mockDriver.dateOfBirth}</Text>
          </View>

          <Pressable style={styles.schoolsButton} onPress={handleSchoolsPress}>
            <Text style={styles.detailText}>Schools</Text>
            <MaterialIcons name="chevron-right" size={24} color="#757575" />
          </Pressable>
        </View>

        {/* Vehicle Details */}
        <View style={styles.vehicleSection}>
          <Text style={styles.sectionTitle}>Vehicle Details :</Text>
          
          <Text style={styles.vehicleNumber}>{mockDriver.vehicle.number}</Text>
          <Text style={styles.vehicleDetail}>{mockDriver.vehicle.startLocation}</Text>
          <Text style={styles.vehicleDetail}>Capacity : {mockDriver.vehicle.capacity}</Text>

          <View style={styles.vehiclePhotos}>
            {mockDriver.vehicle.photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <MaterialIcons name="image" size={50} color="#757575" />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: '#5DB0C7',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailsContainer: {
    paddingHorizontal: 20,
  },
  detailItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  detailText: {
    fontSize: 16,
  },
  schoolsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  vehicleSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 15,
  },
  vehicleNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  vehicleDetail: {
    fontSize: 16,
    marginBottom: 10,
  },
  vehiclePhotos: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  photoContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ratingContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 