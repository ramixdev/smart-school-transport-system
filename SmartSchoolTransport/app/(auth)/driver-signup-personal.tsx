// app/(auth)/driver-signup-personal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function DriverSignUpPersonalScreen() {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [nationalId, setNationalId] = useState('');
  const [experience, setExperience] = useState('');
  const [address, setAddress] = useState('');
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };
  
  const handleNext = () => {
    // Validate inputs
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!dateOfBirth) {
      alert('Please enter your date of birth');
      return;
    }
    if (!nationalId.trim()) {
      alert('Please enter your National ID');
      return;
    }
    if (!experience.trim()) {
      alert('Please enter your years of experience');
      return;
    }
    if (!address.trim()) {
      alert('Please enter your address');
      return;
    }

    // Store personal details and navigate to next screen
    router.push('/(auth)/driver-signup-email');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Create your Account</Text>
          <Text style={styles.subtitle}>Join Lanka Bus now. It's free!</Text>
          
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Name"
              value={name}
              onChangeText={setName}
            />
            
            <Pressable onPress={showDatePicker}>
              <View style={styles.dateInput}>
                <Text style={[styles.dateText, !dateOfBirth && styles.placeholderText]}>
                  {dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : 'Date of Birth'}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#666666" />
              </View>
            </Pressable>

            {showPicker && (
              <DateTimePicker
                value={dateOfBirth || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
            
            <TextInput
              style={styles.input}
              placeholder="National ID"
              value={nationalId}
              onChangeText={setNationalId}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Number of years of experience"
              value={experience}
              onChangeText={setExperience}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>
          
          <TouchableOpacity 
            style={[
              styles.nextButton,
              (!name || !dateOfBirth || !nationalId || !experience || !address) && styles.nextButtonDisabled
            ]} 
            onPress={handleNext}
            disabled={!name || !dateOfBirth || !nationalId || !experience || !address}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#22242A',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: '100%',
    padding: 24,
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
    paddingBottom: 8,
  },
  dateInput: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#000000',
  },
  placeholderText: {
    color: '#999999',
  },
  nextButton: {
    backgroundColor: '#5B9BD5',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  nextButtonDisabled: {
    backgroundColor: '#BDC3C7',
    opacity: 0.7,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});