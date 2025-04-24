import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Avatar, IconButton, Menu, Divider, Portal, Dialog, Button, Surface } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data - replace with actual data from your database
const mockDriverData = {
  vehicleCapacity: 15, // Original vehicle capacity
};

const mockEnrolledStudents = [
  {
    id: '1',
    name: 'Ametha Isiwara',
    phone: '+94762343272',
    school: "St. Peter's College, Galle Road, Colombo, Sri Lanka",
  },
  {
    id: '2',
    name: 'Ametha Isiwara',
    phone: '+94762343272',
    school: "St. Peter's College, Galle Road, Colombo, Sri Lanka",
  },
  // Add more mock data as needed
];

export default function StudentList() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  // Calculate remaining capacity
  const remainingCapacity = mockDriverData.vehicleCapacity - mockEnrolledStudents.length;

  const handleBack = () => {
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedStudents([]);
    } else {
      router.back();
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleDeleteSelected = () => {
    // TODO: Implement actual deletion from database
    console.log('Deleting students:', selectedStudents);
    setDeleteDialogVisible(false);
    setSelectionMode(false);
    setSelectedStudents([]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text variant="headlineMedium" style={styles.title}>
          Enrolled Students
        </Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setSelectionMode(true);
            }}
            title="Select Students"
          />
        </Menu>
      </View>

      <Surface style={styles.capacityCard}>
        <View style={styles.capacityInfo}>
          <Text variant="titleMedium" style={styles.capacityTitle}>Remaining Capacity</Text>
          <Text variant="displaySmall" style={styles.capacityNumber}>{remainingCapacity}</Text>
          <Text variant="bodyMedium" style={styles.totalCapacity}>
            of {mockDriverData.vehicleCapacity} total seats
          </Text>
        </View>
      </Surface>

      <ScrollView style={styles.studentList}>
        {mockEnrolledStudents.map((student, index) => (
          <React.Fragment key={student.id}>
            <Pressable
              style={[
                styles.studentCard,
                selectionMode && selectedStudents.includes(student.id) && styles.selectedCard
              ]}
              onPress={() => selectionMode && toggleStudentSelection(student.id)}
            >
              <View style={styles.studentInfo}>
                <Avatar.Icon size={48} icon="account" style={styles.avatar} />
                <View style={styles.textContainer}>
                  <Text variant="titleMedium" style={styles.name}>{student.name}</Text>
                  <Text variant="bodyMedium" style={styles.phone}>{student.phone}</Text>
                  <Text variant="bodyMedium" style={styles.school}>{student.school}</Text>
                </View>
                {selectionMode && (
                  <MaterialIcons
                    name={selectedStudents.includes(student.id) ? "check-circle" : "radio-button-unchecked"}
                    size={24}
                    color="#5DB0C7"
                    style={styles.checkbox}
                  />
                )}
              </View>
            </Pressable>
            {index < mockEnrolledStudents.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </ScrollView>

      {selectionMode && selectedStudents.length > 0 && (
        <View style={styles.deleteButtonContainer}>
          <Button
            mode="contained"
            onPress={() => setDeleteDialogVisible(true)}
            style={styles.deleteButton}
            icon="delete"
          >
            Delete Selected
          </Button>
        </View>
      )}

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Students</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete {selectedStudents.length} selected student(s)?
              This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteSelected} textColor="red">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  capacityCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#E3F2F6',
    elevation: 2,
  },
  capacityInfo: {
    alignItems: 'center',
  },
  capacityTitle: {
    color: '#5DB0C7',
    marginBottom: 8,
  },
  capacityNumber: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  totalCapacity: {
    color: '#666',
    marginTop: 4,
  },
  studentList: {
    flex: 1,
  },
  studentCard: {
    padding: 16,
  },
  selectedCard: {
    backgroundColor: '#E3F2F6',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#5DB0C7',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phone: {
    color: '#666',
    marginBottom: 2,
  },
  school: {
    color: '#666',
  },
  checkbox: {
    marginLeft: 16,
  },
  deleteButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
}); 