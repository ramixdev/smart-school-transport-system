import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Surface, Checkbox, Button, Portal, Dialog } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data - replace with actual data from your database
const mockAllSchools = [
  {
    id: '1',
    name: "St. Peter's College",
    address: 'Galle Road, Colombo, Sri Lanka',
  },
  {
    id: '2',
    name: 'Royal College',
    address: 'Rajakeeya Mawatha, Colombo 07, Sri Lanka',
  },
  {
    id: '3',
    name: 'Ananda College',
    address: 'Maradana Road, Colombo 10, Sri Lanka',
  },
];

const mockSelectedSchools = ['1']; // Replace with actual selected schools from database

export default function Schools() {
  const [selectedSchools, setSelectedSchools] = useState<string[]>(mockSelectedSchools);
  const [saveDialogVisible, setSaveDialogVisible] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleBack = () => {
    if (hasChanges) {
      setSaveDialogVisible(true);
    } else {
      router.back();
    }
  };

  const handleSchoolToggle = (schoolId: string) => {
    setHasChanges(true);
    if (selectedSchools.includes(schoolId)) {
      setSelectedSchools(selectedSchools.filter(id => id !== schoolId));
    } else {
      setSelectedSchools([...selectedSchools, schoolId]);
    }
  };

  const handleSave = () => {
    // TODO: Save selected schools to database
    setHasChanges(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text variant="headlineMedium" style={styles.title}>Schools</Text>
        {hasChanges && (
          <Button 
            mode="contained" 
            onPress={handleSave}
            style={styles.saveButton}
          >
            Save
          </Button>
        )}
      </View>

      <ScrollView style={styles.schoolList}>
        {mockAllSchools.map((school) => (
          <Surface key={school.id} style={styles.schoolCard}>
            <Pressable
              style={styles.schoolInfo}
              onPress={() => handleSchoolToggle(school.id)}
            >
              <View style={styles.textContainer}>
                <Text variant="titleMedium" style={styles.schoolName}>
                  {school.name}
                </Text>
                <Text variant="bodyMedium" style={styles.schoolAddress}>
                  {school.address}
                </Text>
              </View>
              <Checkbox
                status={selectedSchools.includes(school.id) ? 'checked' : 'unchecked'}
                onPress={() => handleSchoolToggle(school.id)}
                color="#5DB0C7"
              />
            </Pressable>
          </Surface>
        ))}
      </ScrollView>

      <Portal>
        <Dialog visible={saveDialogVisible} onDismiss={() => setSaveDialogVisible(false)}>
          <Dialog.Title>Save Changes?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              You have unsaved changes. Would you like to save them before leaving?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setSaveDialogVisible(false);
              router.back();
            }}>Discard</Button>
            <Button onPress={handleSave} mode="contained">Save</Button>
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
  saveButton: {
    marginLeft: 8,
  },
  schoolList: {
    flex: 1,
    padding: 16,
  },
  schoolCard: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  textContainer: {
    flex: 1,
  },
  schoolName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  schoolAddress: {
    color: '#666',
  },
}); 