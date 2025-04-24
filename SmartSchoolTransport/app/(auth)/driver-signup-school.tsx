// app/(auth)/driver-signup-school.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock data for schools
const SCHOOLS = [
  'St. Peter\'s College Colombo',
  'Royal College Colombo',
  'Ananda College Colombo',
  'Nalanda College Colombo',
  'Isipathana College Colombo',
  'D.S. Senanayake College Colombo',
  'Thurstan College Colombo',
  'Mahanama College Colombo',
  'Visakha Vidyalaya',
  'Devi Balika Vidyalaya',
  'Sti. Joseph\'s College Colombo',
];

export default function DriverSignUpSchoolScreen() {
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handleSchoolToggle = (school: string) => {
    if (!selectedSchools.includes(school)) {
      setSelectedSchools([...selectedSchools, school]);
    }
  };

  const handleRemoveSchool = (school: string) => {
    setSelectedSchools(selectedSchools.filter(s => s !== school));
  };
  
  const handleFinish = () => {
    // Complete registration and navigate to driver home
    router.replace('/(driver)');
  };

  // Get available schools (not selected)
  const availableSchools = SCHOOLS.filter(school => !selectedSchools.includes(school));

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
            {availableSchools.map((school, index) => (
              <TouchableOpacity
                key={index}
                style={styles.schoolItem}
                onPress={() => handleSchoolToggle(school)}
              >
                <Text style={styles.schoolName}>{school}</Text>
              </TouchableOpacity>
            ))}
            {availableSchools.length === 0 && (
              <Text style={styles.noSchoolsText}>No more schools available</Text>
            )}
          </View>
        )}

        {/* Selected Schools List */}
        {selectedSchools.length > 0 && (
          <View style={styles.selectedSchoolsContainer}>
            {selectedSchools.map((school, index) => (
              <View key={index} style={styles.selectedSchoolItem}>
                <Text style={styles.selectedSchoolText}>{school}</Text>
                <TouchableOpacity 
                  onPress={() => handleRemoveSchool(school)}
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
            selectedSchools.length === 0 && styles.disabledButton
          ]} 
          onPress={handleFinish}
          disabled={selectedSchools.length === 0}
        >
          <Text style={styles.finishButtonText}>Finish</Text>
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
});