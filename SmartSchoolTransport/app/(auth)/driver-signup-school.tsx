// app/(auth)/driver-signup-school.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { schoolAPI, driverAPI } from '../../constants/api';

interface School {
  id: string;
  name: string;
}

export default function DriverSignUpSchoolScreen() {
  const [selectedSchools, setSelectedSchools] = useState<School[]>([]);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await schoolAPI.getAllSchools();
      if (response.schools && Array.isArray(response.schools)) {
        setAvailableSchools(response.schools);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      setError(error?.message || 'Failed to fetch schools');
      Alert.alert('Error', 'Failed to load schools. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolToggle = (school: School) => {
    if (!selectedSchools.some(s => s.id === school.id)) {
      setSelectedSchools([...selectedSchools, school]);
    }
  };

  const handleRemoveSchool = (schoolId: string) => {
    setSelectedSchools(selectedSchools.filter(s => s.id !== schoolId));
  };
  
  const handleFinish = async () => {
    if (selectedSchools.length === 0) {
      Alert.alert('Error', 'Please select at least one school');
      return;
    }

    setIsSaving(true);
    try {
      // Save the selected schools to the driver's profile
      await driverAPI.updateSchools(selectedSchools.map(s => s.id));
      router.replace('/(driver)');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to save school selection');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter out already selected schools
  const filteredAvailableSchools = availableSchools.filter(
    school => !selectedSchools.some(s => s.id === school.id)
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B9BD5" />
        <Text style={styles.loadingText}>Loading schools...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSchools}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>School Selection</Text>
        <Text style={styles.subtitle}>Select the schools the vehicle will be visiting</Text>
        
        {/* Dropdown Toggle */}
        <TouchableOpacity 
          style={styles.dropdownToggle}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={styles.dropdownText}>
            {selectedSchools.length > 0 
              ? `${selectedSchools.length} schools selected` 
              : 'Select schools'}
          </Text>
          <Ionicons 
            name={showDropdown ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666666" 
          />
        </TouchableOpacity>
        
        {/* Dropdown Menu */}
        {showDropdown && (
          <View style={styles.dropdown}>
            {filteredAvailableSchools.map((school) => (
              <TouchableOpacity
                key={school.id}
                style={styles.schoolItem}
                onPress={() => handleSchoolToggle(school)}
              >
                <Text style={styles.schoolName}>{school.name}</Text>
              </TouchableOpacity>
            ))}
            {filteredAvailableSchools.length === 0 && (
              <Text style={styles.noSchoolsText}>No more schools available</Text>
            )}
          </View>
        )}

        {/* Selected Schools List */}
        {selectedSchools.length > 0 && (
          <View style={styles.selectedSchoolsContainer}>
            {selectedSchools.map((school) => (
              <View key={school.id} style={styles.selectedSchoolItem}>
                <Text style={styles.selectedSchoolText}>{school.name}</Text>
                <TouchableOpacity 
                  onPress={() => handleRemoveSchool(school.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close" size={20} color="#666666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            styles.finishButton, 
            (selectedSchools.length === 0 || isSaving) && styles.disabledButton
          ]} 
          onPress={handleFinish}
          disabled={selectedSchools.length === 0 || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.finishButtonText}>Finish</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  dropdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  dropdownText: {
    fontSize: 16,
    color: '#666',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    maxHeight: 300,
  },
  schoolItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  schoolName: {
    fontSize: 14,
    color: '#000',
  },
  noSchoolsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 16,
  },
  selectedSchoolsContainer: {
    marginBottom: 24,
  },
  selectedSchoolItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  selectedSchoolText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  finishButton: {
    backgroundColor: '#5B9BD5',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#5B9BD5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});