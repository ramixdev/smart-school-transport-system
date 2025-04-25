// app/(auth)/parent-select-driver.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import StarRating from '../../components/StarRating';
import { getDriverRating } from '../../api/feedback';

// Initial driver data without ratings
const DRIVERS = [
  { 
    id: 1, 
    name: 'Malsri De Silva', 
    phone: '+94764856713',
    schools: [
      'St. Peter\'s College, Galle Road, Colombo, Sri Lanka',
      'Ananda College, Maradana Road, Colombo, Sri Lanka'
    ]
  },
  { 
    id: 2, 
    name: 'K D Indrasiri', 
    phone: '+94776754983',
    schools: [
      'Royal College, Rajakeeya Mawatha, Colombo, Sri Lanka',
      'Nalanda College, Colombo, Sri Lanka'
    ]
  },
  { 
    id: 3, 
    name: 'Shehan Sampath', 
    phone: '+94757689471',
    schools: [
      'Isipathana College, Colombo, Sri Lanka',
      'St. Peter\'s College, Galle Road, Colombo, Sri Lanka'
    ]
  },
];

export default function ParentSelectDriverScreen() {
  const params = useLocalSearchParams();
  const { returnTo, childId } = params;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [filteredDrivers, setFilteredDrivers] = useState(DRIVERS);
  const [isSearching, setIsSearching] = useState(false);
  const [driverRatings, setDriverRatings] = useState<{ [key: number]: { averageRating: number, totalRatings: number } }>({});
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);
  
  useEffect(() => {
    // Fetch ratings for all drivers
    const fetchDriverRatings = async () => {
      try {
        const ratings: { [key: number]: { averageRating: number, totalRatings: number } } = {};
        
        // Fetch ratings for each driver
        await Promise.all(
          DRIVERS.map(async (driver) => {
            const ratingData = await getDriverRating(driver.id.toString());
            if (ratingData) {
              ratings[driver.id] = {
                averageRating: ratingData.averageRating,
                totalRatings: ratingData.totalRatings
              };
            }
          })
        );
        
        setDriverRatings(ratings);
        setIsLoadingRatings(false);
      } catch (error) {
        console.error('Error fetching driver ratings:', error);
        setIsLoadingRatings(false);
      }
    };

    fetchDriverRatings();
  }, []);

  useEffect(() => {
    // Filter drivers based on search query
    if (searchQuery.trim() === '') {
      setFilteredDrivers(DRIVERS);
      return;
    }
    
    setIsSearching(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      
      // Filter drivers that serve the searched school
      const results = DRIVERS.filter(driver => 
        driver.schools.some(school => 
          school.toLowerCase().includes(query)
        ) ||
        driver.name.toLowerCase().includes(query)
      );
      
      setFilteredDrivers(results);
      setIsSearching(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const handleSave = () => {
    if (!selectedDriver) return;
    
    // Save the selected driver and complete registration
    if (returnTo === 'edit-child') {
      // Return to edit-child page with selected driver
      router.back();
    } else {
      // Complete registration and go to parent home
      router.replace('/(parent)');
    }
  };
  
  const handleBack = () => {
    router.back();
  };

  const renderDriverItem = (driver: typeof DRIVERS[0]) => {
    const driverRating = driverRatings[driver.id];
    
    return (
      <TouchableOpacity 
        key={driver.id}
        style={[
          styles.driverItem,
          selectedDriver === driver.id && styles.selectedDriverItem
        ]}
        onPress={() => setSelectedDriver(driver.id)}
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
            {driver.schools.map((school, index) => (
              <View key={index} style={styles.schoolTag}>
                <FontAwesome name="graduation-cap" size={12} color="#5B9BD5" />
                <Text style={styles.schoolText} numberOfLines={1} ellipsizeMode="tail">
                  {school.split(',')[0]}
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
          
          <View style={styles.formContainer}>
            <View style={styles.searchContainer}>
              <FontAwesome name="search" size={16} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search drivers by school name"
                value={searchQuery}
                onChangeText={setSearchQuery}
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
            
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5B9BD5" />
                <Text style={styles.loadingText}>Searching drivers...</Text>
              </View>
            ) : filteredDrivers.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <FontAwesome name="exclamation-circle" size={50} color="#DDD" />
                <Text style={styles.noResultsText}>No drivers found for this school</Text>
                <Text style={styles.noResultsSubtext}>Try another school name</Text>
              </View>
            ) : (
              <View style={styles.driverList}>
                {filteredDrivers.map(renderDriverItem)}
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.saveButton, !selectedDriver && styles.disabledButton]} 
            onPress={handleSave}
            disabled={!selectedDriver}
          >
            <Text style={styles.saveButtonText}>Save</Text>
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