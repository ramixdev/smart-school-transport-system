import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data - replace with actual data from your database
const mockSchools = [
  "St. Peter's College Colombo",
  "Ananda College Colombo",
  "Mahanama College Colombo",
  "Isipathana College Colombo",
  "Nalanda College Colombo",
  "Visakha Vidyalaya",
  "Devi Balika Vidyalaya",
  "St. Joseph's College Colombo",
  "D.S. Senanayake College"
];

export default function DriverSchoolsScreen() {
  const { id } = useLocalSearchParams();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Schools visited',
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
        <Text style={styles.headerTitle}>Schools visited</Text>
      </View>

      {/* Schools List */}
      <ScrollView style={styles.content}>
        {mockSchools.map((school, index) => (
          <React.Fragment key={index}>
            <View style={styles.schoolItem}>
              <Text style={styles.schoolName}>{school}</Text>
              <MaterialIcons name="remove" size={24} color="#757575" />
            </View>
            <Divider />
          </React.Fragment>
        ))}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  schoolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  schoolName: {
    fontSize: 16,
    flex: 1,
  },
}); 