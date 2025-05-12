import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import StarRating from '../../components/StarRating';
import { getDriverDetails, getDriverRating, rateDriver } from '@/services/api';

interface DriverDetails {
  name: string;
  profileImage: string | null;
  contactNumber: string;
  experience: string;
  address: string;
  vehicleNumber: string;
  vehicleImages: string[];
}

interface DriverRating {
  averageRating: number;
  totalRatings: number;
  parentRating?: {
    rating: number;
    comment?: string;
  };
}

export default function DriverDetailsScreen() {
  const { childId } = useLocalSearchParams();
  const [driverDetails, setDriverDetails] = useState<DriverDetails | null>(null);
  const [driverRating, setDriverRating] = useState<DriverRating | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  useEffect(() => {
    fetchDriverDetails();
  }, []);

  const fetchDriverDetails = async () => {
    try {
      setIsLoading(true);
      // Get child's driver ID from child details
      const childDetails = await getChildDetails(childId as string);
      if (!childDetails?.driverId) {
        Alert.alert('Error', 'No driver assigned to this child');
        router.back();
        return;
      }

      // Fetch driver details and rating
      const [driver, rating] = await Promise.all([
        getDriverDetails(childDetails.driverId),
        getDriverRating(childDetails.driverId)
      ]);

      setDriverDetails(driver);
      setDriverRating(rating);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch driver details');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    if (!driverDetails) return;

    try {
      setIsRatingLoading(true);
      await rateDriver(driverDetails.id, newRating);
      // Refresh driver rating
      const updatedRating = await getDriverRating(driverDetails.id);
      setDriverRating(updatedRating);
      Alert.alert('Success', 'Rating updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update rating. Please try again.');
      console.error(error);
    } finally {
      setIsRatingLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading || !driverDetails || !driverRating) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
          
          {/* Rating Section */}
          <View style={styles.ratingContainer}>
            <StarRating
              rating={driverRating.parentRating?.rating || 0}
              size={30}
              onRatingChange={handleRatingChange}
              disabled={isRatingLoading}
            />
            <Text style={styles.ratingText}>
              Average Rating: {driverRating.averageRating.toFixed(1)} ({driverRating.totalRatings} ratings)
            </Text>
          </View>
        </View>

        {/* Contact Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.contactNumber}>{driverDetails.contactNumber}</Text>
        </View>

        {/* Experience Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Experience: {driverDetails.experience}</Text>
        </View>

        {/* Address Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>{driverDetails.address}</Text>
        </View>

        {/* Vehicle Details Section */}
        <View style={styles.vehicleSection}>
          <Text style={styles.sectionTitle}>Vehicle Details:</Text>
          <Text style={styles.vehicleNumber}>{driverDetails.vehicleNumber}</Text>
          
          {/* Vehicle Images */}
          <View style={styles.imageGrid}>
            {driverDetails.vehicleImages.map((image, index) => (
              <Image 
                key={index}
                source={{ uri: image }}
                style={styles.vehicleImage}
              />
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
  ratingContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  ratingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
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
  },
  vehicleImage: {
    width: '48%',
    height: 150,
    marginBottom: 16,
    borderRadius: 8,
  },
}); 