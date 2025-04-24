import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Image, FlatList, Alert } from 'react-native';
import { Text, Surface, Menu, Divider, Searchbar } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data - replace with actual data from your backend
const mockStudents = [
  {
    id: '1',
    name: 'Ametha Isiwara',
    grade: 'Grade 3',
    school: "St. Peter's College, Galle Road, Colombo, Sri Lanka",
    parentContact: '+94764589761',
    photoUrl: null, // This will use placeholder if null
  },
  {
    id: '2',
    name: 'Govin Perera',
    grade: 'Grade 5',
    school: "St. Peter's College, Galle Road, Colombo, Sri Lanka",
    parentContact: '+94764589761',
    photoUrl: null,
  },
  {
    id: '3',
    name: 'Thejana Sooriyaarachchi',
    grade: 'Grade 2',
    school: "Royal College, Colombo 7, Sri Lanka",
    parentContact: '+94764589761',
    photoUrl: null,
  },
  {
    id: '4',
    name: 'Sanuda Fernando',
    grade: 'Grade 1',
    school: "Ananda College, Maradana, Colombo, Sri Lanka",
    parentContact: '+94764589761',
    photoUrl: null,
  },
];

export default function StudentsScreen() {
  const [visible, setVisible] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(mockStudents);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const searchTerm = query.toLowerCase();
    const filtered = mockStudents.filter(student => 
      student.name.toLowerCase().includes(searchTerm) ||
      student.grade.toLowerCase().includes(searchTerm) ||
      student.school.toLowerCase().includes(searchTerm)
    );
    setFilteredStudents(filtered);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      // Exit selection mode
      setIsSelectionMode(false);
      setSelectedStudents([]);
    } else {
      // Enter selection mode
      setIsSelectionMode(true);
    }
    closeMenu();
  };

  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const deleteSelectedStudents = () => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete ${selectedStudents.length} student(s)?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement the actual deletion logic here
            // For now, we'll just exit selection mode
            setIsSelectionMode(false);
            setSelectedStudents([]);
          },
        },
      ]
    );
  };

  const renderStudentItem = ({ item }: { item: typeof mockStudents[0] }) => (
    <Pressable
      style={styles.studentItemContainer}
      onPress={() => isSelectionMode && toggleStudentSelection(item.id)}
    >
      <View style={styles.studentItem}>
        <View style={styles.studentImageContainer}>
          {isSelectionMode && (
            <View style={[
              styles.checkCircle,
              selectedStudents.includes(item.id) && styles.checkedCircle
            ]}>
              {selectedStudents.includes(item.id) && (
                <MaterialIcons name="check" size={16} color="#fff" />
              )}
            </View>
          )}
          {item.photoUrl ? (
            <Image 
              source={{ uri: item.photoUrl }} 
              style={styles.studentImage} 
            />
          ) : (
            <View style={styles.studentImagePlaceholder}>
              <MaterialIcons name="person" size={32} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.studentInfoContainer}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentGrade}>{item.grade}</Text>
          <Text style={styles.studentSchool}>{item.school}</Text>
          <Text style={styles.studentContact}>{item.parentContact}</Text>
        </View>
      </View>
      <Divider style={styles.divider} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Admin - Children',
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Students</Text>
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <Pressable onPress={openMenu} style={styles.menuButton}>
              <MaterialIcons name="more-vert" size={24} color="#000" />
            </Pressable>
          }
        >
          <Menu.Item 
            onPress={toggleSelectionMode} 
            title={isSelectionMode ? "Cancel Selection" : "Select Students"}
            leadingIcon="checkbox-multiple-marked-circle"
          />
          {isSelectionMode && selectedStudents.length > 0 && (
            <Menu.Item 
              onPress={deleteSelectedStudents} 
              title="Delete Selected"
              leadingIcon="delete"
            />
          )}
        </Menu>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search students"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#666"
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Total count of students: {filteredStudents.length}
        </Text>
      </View>

      {/* Students List */}
      {isSelectionMode && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedStudents.length} selected
          </Text>
          {selectedStudents.length > 0 && (
            <Pressable 
              style={styles.deleteButton} 
              onPress={deleteSelectedStudents}
            >
              <MaterialIcons name="delete" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          )}
        </View>
      )}

      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
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
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 15,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchBar: {
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  searchInput: {
    fontSize: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  statsText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  studentItemContainer: {
    marginVertical: 8,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  studentImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  studentImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  studentImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#5DB0C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInfoContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentGrade: {
    fontSize: 14,
    marginBottom: 2,
  },
  studentSchool: {
    fontSize: 14,
    marginBottom: 2,
  },
  studentContact: {
    fontSize: 14,
  },
  divider: {
    marginTop: 8,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  selectionText: {
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    marginLeft: 4,
  },
  checkCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#5DB0C7',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCircle: {
    backgroundColor: '#5DB0C7',
  },
}); 