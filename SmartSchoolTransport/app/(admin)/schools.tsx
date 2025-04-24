import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Pressable, 
  FlatList, 
  TextInput,
  Alert,
  Animated
} from 'react-native';
import { Text, Divider, FAB } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

// Mock data - replace with actual data from your backend
const mockSchools = [
  { id: '1', name: "St. Peter's College Colombo" },
  { id: '2', name: "Ananda College Colombo" },
  { id: '3', name: "Mahanama College Colombo" },
  { id: '4', name: "Isipathana College Colombo" },
  { id: '5', name: "Nalanda College Colombo" },
  { id: '6', name: "Visakha Vidyalaya" },
  { id: '7', name: "Devi Balika Vidyalaya" },
  { id: '8', name: "St. Joseph's College Colombo" },
  { id: '9', name: "D.S. Senanayake College" },
];

export default function SchoolsScreen() {
  const [schools, setSchools] = useState(mockSchools);
  const [searchQuery, setSearchQuery] = useState('');
  const swipeableRefs = useRef<Array<Swipeable | null>>([]);
  
  // Initialize the refs array when schools change
  useEffect(() => {
    swipeableRefs.current = Array(schools.length).fill(null);
  }, [schools]);

  const handleBack = () => {
    router.back();
  };

  const handleAddSchool = () => {
    router.push({
      pathname: '/(admin)/add-school' as any
    });
  };

  const handleDeleteSchool = (id: string) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this school?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement actual deletion logic
            setSchools(schools.filter(school => school.id !== id));
          },
        },
      ]
    );
  };

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, id: string) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });
    
    return (
      <View style={styles.deleteContainer}>
        <Animated.View
          style={[
            styles.deleteButton,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          <Pressable onPress={() => handleDeleteSchool(id)} style={styles.deleteButtonInner}>
            <MaterialIcons name="delete" size={24} color="#fff" />
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  const renderSchoolItem = ({ item, index }: { item: typeof schools[0], index: number }) => (
    <Swipeable
      ref={(ref) => {
        swipeableRefs.current[index] = ref;
      }}
      renderRightActions={(progress) => renderRightActions(progress, item.id)}
      onSwipeableOpen={() => {
        swipeableRefs.current?.forEach((ref, idx) => {
          if (idx !== index && ref) ref.close();
        });
      }}
    >
      <View style={styles.schoolItemContainer}>
        <Text style={styles.schoolName}>{item.name}</Text>
      </View>
      <Divider />
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Admin - Manage Schools',
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>All Schools</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search schools"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Schools List */}
      <FlatList
        data={filteredSchools}
        renderItem={renderSchoolItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {/* Add School FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        onPress={handleAddSchool}
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  schoolItemContainer: {
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteContainer: {
    width: 75,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
  },
  deleteButtonInner: {
    flex: 1,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#5DB0C7',
  },
}); 