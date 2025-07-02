// app/(auth)/parent-add-child.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Platform, Dimensions, KeyboardAvoidingView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { getSchools } from '../../services/api';
import { parentAPI } from '../../constants/api';
import { auth } from '../../contexts/firebase';

export default function ParentAddChildScreen() {
  const [childName, setChildName] = useState('');
  const [grade, setGrade] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [schoolsMenuVisible, setSchoolsMenuVisible] = useState(false);
  
  // For custom date picker
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 10); // Default to 10 years ago
  
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchSchools() {
      setSchoolsLoading(true);
      try {
        const schoolsList = await getSchools();
        setSchools(schoolsList);
      } catch (error) {
        setSchools([]);
      } finally {
        setSchoolsLoading(false);
      }
    }
    fetchSchools();
  }, []);
  
  const handleNext = async () => {
    // Validate inputs
    if (!childName.trim()) {
      Alert.alert('Error', 'Please enter your child\'s name');
      return;
    }
    if (!grade.trim()) {
      Alert.alert('Error', 'Please enter your child\'s grade');
      return;
    }
    if (!dateOfBirth) {
      Alert.alert('Error', 'Please select your child\'s date of birth');
      return;
    }
    if (!selectedSchool) {
      Alert.alert('Error', 'Please select your child\'s school');
      return;
    }

    try {
      // Create child in backend
      const schoolId = schools.find(s => s.name === selectedSchool)?.id;
      if (!schoolId) {
        throw new Error('Invalid school selected');
      }

      const childData = {
        name: childName,
        dateOfBirth: dateOfBirth.split('/').reverse().join('-'),
        grade,
        schoolId,
        parentId: auth.currentUser?.uid // This will be set by the backend from the auth token
      };

      const response = await parentAPI.addChild(childData);
      
      if (!response.child || !response.child.id) {
        throw new Error('Failed to create child record');
      }

      // Move to the driver selection screen with the created child's ID
      router.push({
        pathname: '/(auth)/parent-select-driver',
        params: {
          schoolId,
          childId: response.child.id,
          childName,
          grade,
          dateOfBirth,
          schoolName: selectedSchool
        }
      });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to add child. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const confirmDate = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    setDateOfBirth(`${selectedDay.toString().padStart(2, '0')}/${selectedMonth.toString().padStart(2, '0')}/${selectedYear}`);
    setDatePickerVisible(false);
  };

  // Generate arrays for date picker
  const days = Array.from({length: 31}, (_, i) => i + 1);
  const months = Array.from({length: 12}, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: currentYear - 2000 + 1}, (_, i) => 2000 + i); // From 2000 to current year

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Child Information</Text>
          <Text style={styles.subtitle}>Add your child's information</Text>
          
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter child's name"
              value={childName}
              onChangeText={setChildName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Enter child's grade"
              value={grade}
              onChangeText={setGrade}
              keyboardType="numeric"
            />
            
            <TouchableOpacity 
              style={styles.inputWithIcon}
              onPress={() => setDatePickerVisible(true)}
            >
              <TextInput
                style={styles.input}
                placeholder="Enter child's date of birth"
                value={dateOfBirth}
                editable={false}
              />
              <FontAwesome name="calendar" size={20} color="#999" style={styles.inputIcon} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.inputWithIcon}
              onPress={() => setSchoolsMenuVisible(true)}
            >
              <TextInput
                style={[styles.input, { paddingRight: 40 }]}
                placeholder="Select school"
                value={selectedSchool}
                editable={false}
              />
              <FontAwesome name="graduation-cap" size={20} color="#999" style={styles.inputIcon} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.nextButton, (!childName || !grade || !dateOfBirth || !selectedSchool) && styles.disabledButton]} 
            onPress={handleNext}
            disabled={!childName || !grade || !dateOfBirth || !selectedSchool}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Date Picker Modal */}
      <Modal
        visible={datePickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
            <View style={styles.datePickerContainer}>
              {/* Day Picker */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Day</Text>
                <ScrollView style={styles.datePickerScroll}>
                  {days.map(day => (
                    <TouchableOpacity 
                      key={`day-${day}`}
                      style={[
                        styles.datePickerItem,
                        selectedDay === day && styles.datePickerItemSelected
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text style={selectedDay === day ? styles.datePickerTextSelected : styles.datePickerText}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Month Picker */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Month</Text>
                <ScrollView style={styles.datePickerScroll}>
                  {months.map(month => (
                    <TouchableOpacity 
                      key={`month-${month}`}
                      style={[
                        styles.datePickerItem,
                        selectedMonth === month && styles.datePickerItemSelected
                      ]}
                      onPress={() => setSelectedMonth(month)}
                    >
                      <Text style={selectedMonth === month ? styles.datePickerTextSelected : styles.datePickerText}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Year Picker */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Year</Text>
                <ScrollView style={styles.datePickerScroll}>
                  {years.map(year => (
                    <TouchableOpacity 
                      key={`year-${year}`}
                      style={[
                        styles.datePickerItem,
                        selectedYear === year && styles.datePickerItemSelected
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text style={selectedYear === year ? styles.datePickerTextSelected : styles.datePickerText}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.datePickerActions}>
              <TouchableOpacity 
                style={styles.datePickerButton} 
                onPress={() => setDatePickerVisible(false)}
              >
                <Text style={styles.datePickerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.datePickerButton, styles.confirmButton]} 
                onPress={confirmDate}
              >
                <Text style={styles.datePickerButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Schools Menu Modal */}
      <Modal
        visible={schoolsMenuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSchoolsMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.schoolsModal}>
            <Text style={styles.schoolsModalTitle}>Select School</Text>
            <ScrollView style={styles.schoolsList}>
              {schoolsLoading ? (
                <Text>Loading schools...</Text>
              ) : (
                schools.map((school) => (
                  <TouchableOpacity
                    key={school.id}
                    style={styles.schoolItem}
                    onPress={() => {
                      setSelectedSchool(school.name || school.id);
                      setSchoolsMenuVisible(false);
                    }}
                  >
                    <Text style={styles.schoolName}>{school.name || school.id}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setSchoolsMenuVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22242A',
    marginBottom: 4,
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
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
    fontSize: 16,
    width: '100%',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    right: 10,
  },
  nextButton: {
    backgroundColor: '#5B9BD5',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
    opacity: 0.7,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 200,
  },
  datePickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  datePickerScroll: {
    height: 200,
    width: '100%',
  },
  datePickerItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    marginVertical: 2,
  },
  datePickerItemSelected: {
    backgroundColor: '#5B9BD5',
    borderRadius: 22,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerTextSelected: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  datePickerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#5B9BD5',
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  schoolsModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  schoolsModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  schoolsList: {
    maxHeight: 300,
  },
  schoolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  schoolName: {
    fontSize: 16,
    flex: 1,
  },
  closeModalButton: {
    marginTop: 16,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});