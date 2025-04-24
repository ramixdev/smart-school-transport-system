import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function DriverHome() {
  const currentDate = format(new Date(), 'EEE, dd MMM yyyy');
  const driverName = "Malsri De Silva"; // This should come from authentication context
  const busNumber = "NB 7581"; // This should come from driver's data

  const handleNotifications = () => {
    router.push('./pending-students');
  };

  const handleSettings = () => {
    router.push('./settings');
  };

  const handleStudentList = () => {
    router.push('./student-list');
  };

  const handleStartJourney = (type: 'morning' | 'evening') => {
    router.push({
      pathname: './journey-map',
      params: { journeyType: type }
    });
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.driverName}>
          {driverName}
        </Text>
        <View style={styles.headerIcons}>
          <Pressable onPress={handleNotifications} style={styles.iconButton}>
            <MaterialIcons name="notifications" size={24} color="#000" />
          </Pressable>
          <Pressable onPress={handleSettings} style={styles.iconButton}>
            <MaterialIcons name="settings" size={24} color="#000" />
          </Pressable>
        </View>
      </Surface>

      <Pressable 
        style={styles.studentListButton}
        onPress={handleStudentList}
      >
        <Text variant="titleLarge">Student List</Text>
        <MaterialIcons name="chevron-right" size={24} color="#000" />
      </Pressable>

      <View style={styles.journeyCards}>
        <Surface style={styles.journeyCard} elevation={1}>
          <Text style={styles.busNumber}>{busNumber}</Text>
          <Text style={styles.date}>{currentDate}</Text>
          <View style={styles.busIconContainer}>
            <MaterialIcons name="directions-bus" size={48} color="#5DB0C7" />
          </View>
          <Text variant="headlineSmall" style={styles.journeyType}>Morning</Text>
          <Pressable
            style={styles.startButton}
            onPress={() => handleStartJourney('morning')}
          >
            <Text style={styles.startButtonText}>Start Journey</Text>
          </Pressable>
        </Surface>

        <Surface style={styles.journeyCard} elevation={1}>
          <Text style={styles.busNumber}>{busNumber}</Text>
          <Text style={styles.date}>{currentDate}</Text>
          <View style={styles.busIconContainer}>
            <MaterialIcons name="directions-bus" size={48} color="#5DB0C7" />
          </View>
          <Text variant="headlineSmall" style={styles.journeyType}>Evening</Text>
          <Pressable
            style={styles.startButton}
            onPress={() => handleStartJourney('evening')}
          >
            <Text style={styles.startButtonText}>Start Journey</Text>
          </Pressable>
        </Surface>
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
    padding: 16,
    backgroundColor: '#5DB0C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverName: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  studentListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F9FA',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  journeyCards: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  journeyCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  busNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    color: '#666',
    marginTop: 4,
  },
  busIconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  journeyType: {
    textAlign: 'center',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#5DB0C7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});