import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function DriverDetailsScreen() {
  const { childId } = useLocalSearchParams();
  
  // Mock data - In real app, fetch driver details based on childId
  const driverDetails = {
    name: 'Malsri De Silva',
    profileImage: null,
    contactNumber: '+94764856713',
    experience: '30 years',
    address: 'PWX5+V6J, Unnamed Road, Panadura',
    vehicleNumber: 'NB 7581',
    vehicleImages: [
      '/path/to/image1',
      '/path/to/image2',
      '/path/to/image3'
    ]
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Driver Profile Section */}
        <View style={styles.profileSection}>
          {driverDetails.profileImage ? (
            <Image 
              source={{ uri: driverDetails.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <Avatar.Icon 
              size={120}
              icon="account"
              style={styles.avatar}
              color="#fff"
            />
          )}
          <Text style={styles.driverName}>{driverDetails.name}</Text>
        </View>

        {/* Contact Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.contactNumber}>{driverDetails.contactNumber}</Text>
        </View>

        {/* Experience Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Experience : {driverDetails.experience}</Text>
        </View>

        {/* Address Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>{driverDetails.address}</Text>
        </View>

        {/* Vehicle Details Section */}
        <View style={styles.vehicleSection}>
          <Text style={styles.sectionTitle}>Vehicle Details :</Text>
          <Text style={styles.vehicleNumber}>{driverDetails.vehicleNumber}</Text>
          
          {/* Vehicle Images */}
          <View style={styles.imageGrid}>
            {driverDetails.vehicleImages.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <MaterialIcons name="image" size={80} color="#666" />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatar: {
    backgroundColor: '#5DB0C7',
  },
  driverName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactNumber: {
    fontSize: 18,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  vehicleSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  vehicleNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  imageContainer: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
}); 