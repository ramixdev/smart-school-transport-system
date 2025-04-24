import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Avatar, Divider, Portal, Dialog, Button } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data - replace with actual data from your database
const mockPendingStudents = [
  {
    id: '1',
    name: 'Ametha Isiwara',
    phone: '+94762343272',
    school: "St. Peter's College, Galle Road, Colombo, Sri Lanka",
    location: {
      latitude: 6.7951,
      longitude: 79.8909,
      address: "15/A, Galle Road, Colombo 3, Sri Lanka",
    }
  },
  {
    id: '2',
    name: 'Ametha Isiwara',
    phone: '+94762343272',
    school: "St. Peter's College, Galle Road, Colombo, Sri Lanka",
    location: {
      latitude: 6.7955,
      longitude: 79.8915,
      address: "22, Galle Road, Colombo 3, Sri Lanka",
    }
  },
  {
    id: '3',
    name: 'Ametha Isiwara',
    phone: '+94762343272',
    school: "St. Peter's College, Galle Road, Colombo, Sri Lanka",
    location: {
      latitude: 6.7960,
      longitude: 79.8920,
      address: "45, Temple Road, Colombo 3, Sri Lanka",
    }
  },
  {
    id: '4',
    name: 'Ametha Isiwara',
    phone: '+94762343272',
    school: "St. Peter's College, Galle Road, Colombo, Sri Lanka",
    location: {
      latitude: 6.7965,
      longitude: 79.8925,
      address: "78, Park Street, Colombo 3, Sri Lanka",
    }
  },
];

export default function PendingStudents() {
  const [pendingStudents, setPendingStudents] = useState(mockPendingStudents);
  const [actionDialogVisible, setActionDialogVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{id: string, action: 'accept' | 'reject'} | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleAction = (studentId: string, action: 'accept' | 'reject') => {
    setSelectedStudent({ id: studentId, action });
    setActionDialogVisible(true);
  };

  const confirmAction = () => {
    if (!selectedStudent) return;

    if (selectedStudent.action === 'accept') {
      // TODO: Update database to accept student and update route
      console.log('Accepting student:', selectedStudent.id);
      
      // In a real implementation, you would:
      // 1. Update the student status in the database
      // 2. Add student to the driver's enrolled students list
      // 3. Update the driver's route to include the new pickup location
    } else {
      // TODO: Update database to reject student
      console.log('Rejecting student:', selectedStudent.id);
    }

    // Remove student from pending list
    setPendingStudents(pendingStudents.filter(student => student.id !== selectedStudent.id));
    setActionDialogVisible(false);
    setSelectedStudent(null);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Pending Requests",
          headerShown: true,
          headerBackVisible: true,
        }}
      />

      <ScrollView style={styles.studentList}>
        {pendingStudents.map((student, index) => (
          <React.Fragment key={student.id}>
            <View style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <Avatar.Icon size={60} icon="account" style={styles.avatar} />
                <View style={styles.textContainer}>
                  <Text variant="titleMedium" style={styles.name}>{student.name}</Text>
                  <Text variant="bodyMedium" style={styles.details}>{student.phone}</Text>
                  <Text variant="bodyMedium" style={styles.details}>{student.school}</Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <Pressable
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleAction(student.id, 'reject')}
                >
                  <MaterialIcons name="close" size={28} color="#fff" />
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAction(student.id, 'accept')}
                >
                  <MaterialIcons name="check" size={28} color="#fff" />
                </Pressable>
              </View>
            </View>
            {index < pendingStudents.length - 1 && <Divider style={styles.divider} />}
          </React.Fragment>
        ))}
        
        {pendingStudents.length === 0 && (
          <View style={styles.emptyState}>
            <Text variant="titleMedium" style={styles.emptyText}>No pending requests</Text>
          </View>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={actionDialogVisible} onDismiss={() => setActionDialogVisible(false)}>
          <Dialog.Title>
            {selectedStudent?.action === 'accept' ? 'Accept Request' : 'Reject Request'}
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {selectedStudent?.action === 'accept'
                ? 'Are you sure you want to accept this student? This will update your route to include their pickup location.'
                : 'Are you sure you want to reject this student request?'}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setActionDialogVisible(false)}>Cancel</Button>
            <Button 
              onPress={confirmAction} 
              mode="contained"
              buttonColor={selectedStudent?.action === 'accept' ? '#4CAF50' : '#F44336'}
            >
              {selectedStudent?.action === 'accept' ? 'Accept' : 'Reject'}
            </Button>
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
  studentList: {
    flex: 1,
    padding: 16,
  },
  studentCard: {
    marginVertical: 8,
  },
  studentInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#5DB0C7',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  details: {
    color: '#666',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginBottom: 8,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#666',
  }
}); 