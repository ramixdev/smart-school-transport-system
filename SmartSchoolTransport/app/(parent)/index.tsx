import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Image, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Menu, Portal, Dialog, Button } from 'react-native-paper';
import { getParentProfile, deleteChild, markChildAbsent } from '@/services/api';

// Define valid route paths
type ParentRoutes = {
  'parent-add-child': undefined;
  'live-track': { childId: string };
  'notifications': undefined;
  'settings': undefined;
};

interface Child {
  id: string;
  name: string;
  school: string;
  address: string;
  grade: string;
  avatar: string | null;
  driverId: string | null;
}

const ParentHomePage = () => {
  const router = useRouter();
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [parentName, setParentName] = useState('');

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    try {
      setIsLoading(true);
      const data = await getParentProfile();
      setChildren(data.children);
      setParentName(data.parent.name);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch parent data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChild = () => {
    router.push('/(auth)/parent-add-child');
  };

  const handleTrack = (childId: string) => {
    router.push({
      pathname: './live-track' as const,
      params: { childId }
    });
  };

  const handleMarkAbsent = async (childId: string) => {
    try {
      await markChildAbsent(childId);
      Alert.alert('Success', 'Child marked as absent');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark child as absent');
      console.error(error);
    }
  };

  const handleNotifications = () => {
    router.push('./notifications' as const);
  };

  const handleSettings = () => {
    router.push('./settings' as const);
  };

  const handleChildOptions = (childId: string) => {
    setSelectedChildId(childId);
    setOptionsMenuVisible(true);
  };

  const handleEditChild = () => {
    setOptionsMenuVisible(false);
    if (selectedChildId) {
      router.push({
        pathname: '/(parent)/edit-child',
        params: { id: selectedChildId }
      });
    }
  };

  const handleDriverDetails = () => {
    setOptionsMenuVisible(false);
    if (selectedChildId) {
      router.push({
        pathname: '/(parent)/driver-details',
        params: { childId: selectedChildId }
      });
    }
  };

  const handleDeleteChild = () => {
    setOptionsMenuVisible(false);
    setDeleteDialogVisible(true);
  };

  const confirmDeleteChild = async () => {
    if (!selectedChildId) return;

    try {
      await deleteChild(selectedChildId);
      setDeleteDialogVisible(false);
      // Refresh children list
      fetchParentData();
      Alert.alert('Success', 'Child has been removed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove child');
      console.error(error);
    }
  };

  const renderChildItem = ({ item }: { item: Child }) => (
    <View style={styles.childCard}>
      <View style={styles.childInfoContainer}>
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={30} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.childInfo}>
          <ThemedText style={styles.childName}>{item.name}</ThemedText>
          <ThemedText style={styles.schoolInfo}>
            {item.school}, {item.address}
          </ThemedText>
          <ThemedText style={styles.gradeInfo}>{item.grade}</ThemedText>
        </View>
        <Menu
          visible={optionsMenuVisible && selectedChildId === item.id}
          onDismiss={() => setOptionsMenuVisible(false)}
          anchor={
            <TouchableOpacity 
              style={styles.optionsButton}
              onPress={() => handleChildOptions(item.id)}
            >
              <Ionicons name="ellipsis-vertical" size={18} color="#666" />
            </TouchableOpacity>
          }
        >
          <Menu.Item onPress={handleEditChild} title="Update Details" leadingIcon="pencil" />
          {item.driverId && (
            <Menu.Item onPress={handleDriverDetails} title="Driver Details" leadingIcon="account-tie" />
          )}
          <Menu.Item onPress={handleDeleteChild} title="Delete" leadingIcon="delete" />
        </Menu>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.trackButton}
          onPress={() => handleTrack(item.id)}
        >
          <ThemedText style={styles.buttonText}>Track</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.absentButton}
          onPress={() => handleMarkAbsent(item.id)}
        >
          <ThemedText style={styles.buttonText}>Mark Absent</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#50B6C2" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>{parentName}</ThemedText>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleNotifications}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleSettings}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={children}
        renderItem={renderChildItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddChild}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Child</Dialog.Title>
          <Dialog.Content>
            <ThemedText>Are you sure you want to remove this child? This action cannot be undone.</ThemedText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDeleteChild} textColor="#FF5252">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#50B6C2',
    padding: 16,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  listContainer: {
    padding: 16,
  },
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  childInfoContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#50B6C2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  schoolInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  gradeInfo: {
    fontSize: 14,
    color: '#666',
  },
  optionsButton: {
    padding: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  trackButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  absentButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#50B6C2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default ParentHomePage;