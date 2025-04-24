import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform, Image } from 'react-native';
import { Text, TextInput, Avatar, Button, Divider, Menu, Modal, Portal, Surface } from 'react-native-paper';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function EditChildScreen() {
  const { id } = useLocalSearchParams();
  
  // Mock child data - in real app, fetch this based on the ID
  const [childName, setChildName] = useState('Ametha Isiwara');
  const [grade, setGrade] = useState('3');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date(2018, 0, 10));
  const [school, setSchool] = useState('St. Peter\'s College, Galle Road, Colombo, Sri Lanka');
  const [driver, setDriver] = useState('Malsri De Silva');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [schoolsMenuVisible, setSchoolsMenuVisible] = useState(false);
  const [photoMenuVisible, setPhotoMenuVisible] = useState(false);
  
  // For custom date picker
  const [selectedDay, setSelectedDay] = useState(dateOfBirth.getDate());
  const [selectedMonth, setSelectedMonth] = useState(dateOfBirth.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(dateOfBirth.getFullYear());
  
  // Mock schools list - in real app, fetch from database
  const schools = [
    'St. Peter\'s College, Galle Road, Colombo, Sri Lanka',
    'Ananda College, Maradana Road, Colombo, Sri Lanka',
    'Royal College, Rajakeeya Mawatha, Colombo, Sri Lanka',
    'Isipathana College, Colombo, Sri Lanka',
    'Nalanda College, Colombo, Sri Lanka'
  ];

  const handleBack = () => {
    router.back();
  };
  
  const handleConfirmDate = (date: Date) => {
    setDatePickerVisible(false);
    setDateOfBirth(date);
  };
  
  const handleCancelDate = () => {
    setDatePickerVisible(false);
  };
  
  const handleSelectDriver = () => {
    // Store current changes
    // Navigate to driver selection
    router.push({
      pathname: '/(auth)/parent-select-driver',
      params: { 
        childId: id as string,
        returnTo: 'edit-child'
      }
    });
  };
  
  const pickImage = async () => {
    setPhotoMenuVisible(false);
    
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a photo.');
      return;
    }

    // Launch image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    setPhotoMenuVisible(false);
    
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to take a photo.');
      return;
    }

    // Launch camera
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };
  
  const handleSave = () => {
    // Validate inputs
    if (!childName.trim()) {
      Alert.alert('Error', 'Please enter child\'s name');
      return;
    }
    
    if (!grade.trim()) {
      Alert.alert('Error', 'Please enter child\'s grade');
      return;
    }
    
    if (!school.trim()) {
      Alert.alert('Error', 'Please select a school');
      return;
    }
    
    if (!driver.trim()) {
      Alert.alert('Error', 'Please select a driver');
      return;
    }
    
    // In real app, save changes to database
    Alert.alert('Success', 'Child details updated successfully', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };
  
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Generate arrays for date picker
  const days = Array.from({length: 31}, (_, i) => i + 1);
  const months = Array.from({length: 12}, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: currentYear - 2000 + 1}, (_, i) => 2000 + i); // From 2000 to current year

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Child Details</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Profile Photo */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={() => setPhotoMenuVisible(true)}>
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                style={styles.profileImage} 
              />
            ) : (
              <Avatar.Icon 
                size={100} 
                icon="account" 
                style={styles.avatar}
                color="#fff"
              />
            )}
            <View style={styles.editPhotoButton}>
              <MaterialIcons name="photo-camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <Portal>
            <Menu
              visible={photoMenuVisible}
              onDismiss={() => setPhotoMenuVisible(false)}
              anchor={{ x: 0, y: 0 }}
              style={styles.photoMenu}
            >
              <Menu.Item 
                leadingIcon="image" 
                onPress={pickImage} 
                title="Choose from Gallery" 
              />
              <Menu.Item 
                leadingIcon="camera" 
                onPress={takePhoto} 
                title="Take a Photo" 
              />
            </Menu>
          </Portal>
        </View>

        {/* Edit Fields */}
        <View style={styles.fieldsContainer}>
          {/* Child Name */}
          <View style={styles.fieldItem}>
            <TextInput
              mode="outlined"
              value={childName}
              onChangeText={setChildName}
              outlineStyle={styles.inputOutline}
              style={styles.input}
              right={<TextInput.Icon icon="pencil" />}
            />
          </View>

          {/* Grade */}
          <View style={styles.fieldItem}>
            <TextInput
              mode="outlined"
              value={grade}
              onChangeText={setGrade}
              outlineStyle={styles.inputOutline}
              style={styles.input}
              right={<TextInput.Icon icon="pencil" />}
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.fieldItem}>
            <TextInput
              mode="outlined"
              value={formatDate(dateOfBirth)}
              onChangeText={() => {}}
              outlineStyle={styles.inputOutline}
              style={styles.input}
              editable={false}
              right={
                <TextInput.Icon 
                  icon="calendar" 
                  onPress={() => setDatePickerVisible(true)} 
                />
              }
            />
            
            {/* Custom Date Picker Modal */}
            <Portal>
              <Modal
                visible={datePickerVisible}
                onDismiss={handleCancelDate}
                contentContainerStyle={styles.datePickerModal}
              >
                <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
                <View style={styles.datePickerContainer}>
                  {/* Day Picker */}
                  <View style={styles.datePickerColumn}>
                    <Text style={styles.datePickerLabel}>Day</Text>
                    <ScrollView 
                      style={styles.datePickerScroll}
                      showsVerticalScrollIndicator={false}
                    >
                      {days.map(day => (
                        <TouchableOpacity 
                          key={`day-${day}`}
                          style={[
                            styles.datePickerItem,
                            selectedDay === day && styles.datePickerItemSelected
                          ]}
                          onPress={() => setSelectedDay(day)}
                        >
                          <Text style={[
                            styles.datePickerText,
                            selectedDay === day && styles.datePickerTextSelected
                          ]}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  
                  {/* Month Picker */}
                  <View style={styles.datePickerColumn}>
                    <Text style={styles.datePickerLabel}>Month</Text>
                    <ScrollView 
                      style={styles.datePickerScroll}
                      showsVerticalScrollIndicator={false}
                    >
                      {months.map(month => (
                        <TouchableOpacity 
                          key={`month-${month}`}
                          style={[
                            styles.datePickerItem,
                            selectedMonth === month && styles.datePickerItemSelected
                          ]}
                          onPress={() => setSelectedMonth(month)}
                        >
                          <Text style={[
                            styles.datePickerText,
                            selectedMonth === month && styles.datePickerTextSelected
                          ]}>
                            {month}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  
                  {/* Year Picker */}
                  <View style={styles.datePickerColumn}>
                    <Text style={styles.datePickerLabel}>Year</Text>
                    <ScrollView 
                      style={styles.datePickerScroll}
                      showsVerticalScrollIndicator={false}
                    >
                      {years.map(year => (
                        <TouchableOpacity 
                          key={`year-${year}`}
                          style={[
                            styles.datePickerItem,
                            selectedYear === year && styles.datePickerItemSelected
                          ]}
                          onPress={() => setSelectedYear(year)}
                        >
                          <Text style={[
                            styles.datePickerText,
                            selectedYear === year && styles.datePickerTextSelected
                          ]}>
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
                
                <View style={styles.datePickerActions}>
                  <TouchableOpacity 
                    style={styles.datePickerCancelButton}
                    onPress={handleCancelDate}
                  >
                    <Text style={styles.datePickerCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.datePickerConfirmButton}
                    onPress={() => handleConfirmDate(new Date(selectedYear, selectedMonth - 1, selectedDay))}
                  >
                    <Text style={styles.datePickerConfirmText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            </Portal>
          </View>

          {/* School */}
          <View style={styles.fieldItem}>
            <TextInput
              mode="outlined"
              value={school}
              placeholder="Select school"
              onChangeText={() => {}}
              outlineStyle={styles.inputOutline}
              style={styles.input}
              editable={false}
              right={
                <TextInput.Icon 
                  icon="school"
                  onPress={() => setSchoolsMenuVisible(true)} 
                />
              }
              onPressIn={() => setSchoolsMenuVisible(true)}
            />
            
            <Portal>
              <Modal
                visible={schoolsMenuVisible}
                onDismiss={() => setSchoolsMenuVisible(false)}
                contentContainerStyle={styles.schoolsModal}
              >
                <Text style={styles.modalTitle}>Select School</Text>
                <ScrollView style={styles.schoolsList}>
                  {schools.map((schoolName, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.schoolItem,
                        school === schoolName && styles.selectedSchoolItem
                      ]}
                      onPress={() => {
                        setSchool(schoolName);
                        setSchoolsMenuVisible(false);
                      }}
                    >
                      <MaterialIcons 
                        name="school" 
                        size={24} 
                        color={school === schoolName ? "#5DB0C7" : "#757575"} 
                        style={styles.schoolIcon}
                      />
                      <Text style={[
                        styles.schoolText,
                        school === schoolName && styles.selectedSchoolText
                      ]}>
                        {schoolName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Button 
                  mode="outlined" 
                  onPress={() => setSchoolsMenuVisible(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
              </Modal>
            </Portal>
          </View>

          {/* Driver */}
          <View style={styles.fieldItem}>
            <TextInput
              mode="outlined"
              value={driver}
              onChangeText={() => {}}
              outlineStyle={styles.inputOutline}
              style={styles.input}
              editable={false}
              right={
                <TextInput.Icon 
                  icon="account-tie" 
                  onPress={handleSelectDriver} 
                />
              }
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={handleSave}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
        >
          Save
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  avatar: {
    backgroundColor: '#5DB0C7',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#5DB0C7',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  photoMenu: {
    width: 200,
    position: 'absolute',
    top: 200,
    left: 100,
  },
  fieldsContainer: {
    paddingHorizontal: 16,
  },
  fieldItem: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  inputOutline: {
    borderRadius: 8,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  saveButton: {
    backgroundColor: '#5DB0C7',
    borderRadius: 8,
  },
  saveButtonContent: {
    height: 48,
  },
  datePickerModal: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  datePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  datePickerLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  datePickerScroll: {
    height: 200,
    width: '100%',
  },
  datePickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  datePickerItemSelected: {
    backgroundColor: '#5DB0C7',
    borderRadius: 20,
    width: '80%',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  datePickerCancelButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerConfirmButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#5DB0C7',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  schoolsModal: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
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
  selectedSchoolItem: {
    backgroundColor: '#f0f9fb',
  },
  schoolIcon: {
    marginRight: 16,
  },
  schoolText: {
    fontSize: 16,
    flex: 1,
  },
  selectedSchoolText: {
    color: '#5DB0C7',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 16,
  },
}); 