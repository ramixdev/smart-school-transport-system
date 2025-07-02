// app/(auth)/parent-select-driver.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import StarRating from '../../components/StarRating';
import { getDriverRating } from '../../services/api';
import { schoolAPI, parentAPI } from '../../constants/api';
import { auth } from '../../contexts/firebase';

export default function ParentSelectDriverScreen() {
  const params = useLocalSearchParams();
  const { schoolId, childName, grade, dateOfBirth, schoolName, childId, returnTo } = params;

  const [drivers, setDrivers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [filteredDrivers, setFilteredDrivers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [driverRatings, setDriverRatings] = useState<{ [key: string]: { averageRating: number, totalRatings: number } }>({});
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch drivers for the selected school
    async function fetchDrivers() {
      setIsLoadingDrivers(true);
      setError(null);
      try {
        if (!schoolId) {
          throw new Error('School ID is required');
        }
        const res = await schoolAPI.getDriversBySchool(schoolId as string);
        if (!res.drivers || res.drivers.length === 0) {
          setError('No drivers available for this school');
        }
        setDrivers(res.drivers || []);
        setFilteredDrivers(res.drivers || []);
      } catch (error: any) {
        setError(error?.message || 'Failed to fetch drivers');
        setDrivers([]);
        setFilteredDrivers([]);
      } finally {
        setIsLoadingDrivers(false);
      }
    }
    fetchDrivers();
  }, [schoolId]);

  useEffect(() => {
    // Fetch ratings for all drivers
    const fetchDriverRatings = async () => {
      try {
        const ratings: { [key: string]: { averageRating: number, totalRatings: number } } = {};
        await Promise.all(
          drivers.map(async (driver) => {
            try {
              const ratingData = await getDriverRating(driver.id);
              if (ratingData) {
                ratings[driver.id] = {
                  averageRating: ratingData.averageRating,
                  totalRatings: ratingData.totalRatings
                };
              }
            } catch (error) {
              console.warn(`Failed to fetch rating for driver ${driver.id}:`, error);
            }
          })
        );
        setDriverRatings(ratings);
      } catch (error) {
        console.error('Error fetching driver ratings:', error);
      } finally {
        setIsLoadingRatings(false);
      }
    };
    if (drivers.length > 0) {
      setIsLoadingRatings(true);
      fetchDriverRatings();
    }
  }, [drivers]);

  useEffect(() => {
    // Filter drivers based on search query
    if (searchQuery.trim() === '') {
      setFilteredDrivers(drivers);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const results = drivers.filter(driver =>
        (driver.schools && driver.schools.some((school: string) => school.toLowerCase().includes(query))) ||
        (driver.name && driver.name.toLowerCase().includes(query))
      );
      setFilteredDrivers(results);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, drivers]);

  const handleSave = async () => {
    if (!selectedDriver) {
      Alert.alert('Error', 'Please select a driver');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const enrollmentData = {
        childId: childId as string,
        driverId: selectedDriver,
        schoolId: schoolId as string,
        parentId: auth.currentUser?.uid
      };
      await parentAPI.requestEnrollment(enrollmentData);
      Alert.alert(
        'Success',
        'Enrollment request sent to the driver!',
        [
          {
            text: 'OK',
            onPress: () => {
              if (returnTo) {
                router.replace({
                  pathname: '/(parent)/edit-child',
                  params: { id: childId }
                });
              } else {
                router.replace('/(parent)');
              }
            }
          }
        ]
      );
    } catch (error: any) {
      setError(error?.message || 'Failed to send enrollment request');
      Alert.alert('Error', error?.message || 'Failed to send enrollment request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (isSubmitting) {
      Alert.alert(
        'Confirm Exit',
        'Are you sure you want to leave? Your changes will not be saved.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const renderDriverItem = (driver: any) => {
    const driverRating = driverRatings[driver.id];
    return (
      <TouchableOpacity
        key={driver.id}
        style={[
          styles.driverItem,
          selectedDriver === driver.id && styles.selectedDriverItem
        ]}
        onPress={() => setSelectedDriver(driver.id)}
        activeOpacity={0.7}
      >
        <View style={styles.driverAvatar}>
          <FontAwesome name="user-circle" size={32} color="#5B9BD5" />
        </View>
        <View style={styles.driverInfo}>
          <View style={styles.driverHeader}>
            <Text style={styles.driverName}>{driver.name}</Text>
            {!isLoadingRatings && driverRating && (
              <View style={styles.ratingContainer}>
                <StarRating
                  rating={driverRating.averageRating}
                  size={16}
                  disabled={true}
                />
                <Text style={styles.ratingText}>
                  ({driverRating.totalRatings})
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.driverPhone}>{driver.phone}</Text>
          <View style={styles.schoolsList}>
            {driver.schools && driver.schools.map((school: string, index: number) => (
              <View key={index} style={styles.schoolTag}>
                <FontAwesome name="graduation-cap" size={12} color="#5B9BD5" />
                <Text style={styles.schoolText} numberOfLines={1} ellipsizeMode="tail">
                  {school}
                </Text>
              </View>
            ))}
          </View>
        </View>
        {selectedDriver === driver.id && (
          <FontAwesome name="check-circle" size={24} color="#5B9BD5" style={styles.selectedIcon} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <FontAwesome name="arrow-left" size={20} color="#22242A" />
            </TouchableOpacity>
            <Text style={styles.title}>Select Driver</Text>
          </View>
          <Text style={styles.subtitle}>Select the driver you want for your child</Text>
          {error && (
            <View style={styles.errorContainer}>
              <FontAwesome name="exclamation-circle" size={16} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <View style={styles.formContainer}>
            <View style={styles.searchContainer}>
              <FontAwesome name="search" size={16} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search drivers by school name"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <FontAwesome name="times-circle" size={16} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            {isLoadingDrivers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5B9BD5" />
                <Text style={styles.loadingText}>Loading drivers...</Text>
              </View>
            ) : isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5B9BD5" />
                <Text style={styles.loadingText}>Searching drivers...</Text>
              </View>
            ) : filteredDrivers.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <FontAwesome name="exclamation-circle" size={50} color="#DDD" />
                <Text style={styles.noResultsText}>No drivers found</Text>
                <Text style={styles.noResultsSubtext}>
                  {searchQuery ? 'Try another search term' : 'No drivers available for this school'}
                </Text>
              </View>
            ) : (
              <View style={styles.driverList}>
                {filteredDrivers.map(renderDriverItem)}
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedDriver || isSubmitting) && styles.disabledButton
            ]}
            onPress={handleSave}
            disabled={!selectedDriver || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#22242A',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
    minHeight: height - 50,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22242A',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 8,
    flex: 1,
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#22242A',
  },
  clearButton: {
    padding: 4,
  },
  driverList: {
    marginTop: 8,
  },
  driverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedDriverItem: {
    borderColor: '#5B9BD5',
    backgroundColor: '#F0F8FF',
  },
  driverAvatar: {
    marginRight: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22242A',
  },
  driverPhone: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  schoolsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  schoolTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  schoolText: {
    fontSize: 12,
    color: '#5B9BD5',
    marginLeft: 4,
    maxWidth: 120,
  },
  selectedIcon: {
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#5B9BD5',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  noResultsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },
  noResultsSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});