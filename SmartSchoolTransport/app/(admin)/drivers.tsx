import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { Text, Searchbar, Avatar } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data - replace with actual data from your database
const initialDrivers = [
  { id: '1', name: 'Malsri De Silva', photoUrl: null },
  { id: '2', name: 'Shehan Sampath', photoUrl: null },
  { id: '3', name: 'K D Indasiri', photoUrl: null },
  { id: '4', name: 'Saman Perera', photoUrl: null },
  { id: '5', name: 'Nimal Fernando', photoUrl: null },
  { id: '6', name: 'Kumara Fernando', photoUrl: null },
  { id: '7', name: 'Kamal Jayathilake', photoUrl: null },
  { id: '8', name: 'R A Karunaratne', photoUrl: null },
  { id: '9', name: 'Basil Fernando', photoUrl: null },
];

export default function DriversScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [drivers, setDrivers] = useState(initialDrivers);

  const handleBack = () => {
    router.back();
  };

  const handleDriverPress = (driverId: string) => {
    router.push({
      pathname: "/(admin)/driver-profile/[id]",
      params: { id: driverId }
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setDrivers(initialDrivers);
    } else {
      const filtered = initialDrivers.filter(driver =>
        driver.name.toLowerCase().includes(query.toLowerCase())
      );
      setDrivers(filtered);
    }
  };

  const renderDriver = ({ item }: { item: typeof drivers[0] }) => (
    <Pressable
      style={styles.driverItem}
      onPress={() => handleDriverPress(item.id)}
    >
      <Avatar.Icon 
        size={50} 
        icon="account"
        style={styles.avatar}
        color="#fff"
      />
      <Text style={styles.driverName}>{item.name}</Text>
      <MaterialIcons name="chevron-right" size={24} color="#757575" />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'All Drivers',
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
        <Text style={styles.headerTitle}>All Drivers</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search drivers"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#757575"
        />
      </View>

      {/* Total Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          Total count of drivers : {initialDrivers.length}
        </Text>
      </View>

      {/* Drivers List */}
      <FlatList
        data={drivers}
        renderItem={renderDriver}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchBar: {
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  countText: {
    fontSize: 16,
    color: '#000',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  driverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    backgroundColor: '#5DB0C7',
  },
  driverName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
}); 