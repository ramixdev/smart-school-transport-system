import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, useTheme, Avatar, Divider } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

type NotificationType = 'SCHOOL_ARRIVAL' | 'HOME_ARRIVAL' | 'SCHOOL_PICKUP';

// Define valid MaterialIcons names we're using
type IconName = 'school' | 'home' | 'directions-bus' | 'notifications';

interface Notification {
  id: number;
  childName: string;
  type: NotificationType;
  timestamp: Date;
}

// Temporary mock data - will be replaced with Firebase data
const mockNotifications: Notification[] = [
  {
    id: 1,
    childName: 'Thejana Silva',
    type: 'HOME_ARRIVAL',
    timestamp: new Date('2024-03-20T15:13:00'),
  },
  {
    id: 2,
    childName: 'Ametha Isiwara',
    type: 'HOME_ARRIVAL',
    timestamp: new Date('2024-03-20T14:56:00'),
  },
  {
    id: 3,
    childName: 'Thejana Silva',
    type: 'SCHOOL_ARRIVAL',
    timestamp: new Date('2024-03-20T07:10:00'),
  },
  {
    id: 4,
    childName: 'Ametha Isiwara',
    type: 'SCHOOL_ARRIVAL',
    timestamp: new Date('2024-03-20T07:06:00'),
  },
  // Yesterday's notifications
  {
    id: 5,
    childName: 'Thejana Silva',
    type: 'HOME_ARRIVAL',
    timestamp: new Date('2024-03-19T15:30:00'),
  },
];

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const getNotificationIcon = (type: NotificationType): IconName => {
    switch (type) {
      case 'SCHOOL_ARRIVAL':
        return 'school';
      case 'HOME_ARRIVAL':
        return 'home';
      case 'SCHOOL_PICKUP':
        return 'directions-bus';
      default:
        return 'notifications';
    }
  };

  const getNotificationMessage = (type: NotificationType, childName: string): string => {
    switch (type) {
      case 'SCHOOL_ARRIVAL':
        return `${childName} has reached the school`;
      case 'HOME_ARRIVAL':
        return `${childName} has reached home`;
      case 'SCHOOL_PICKUP':
        return `${childName} has been picked up from school`;
      default:
        return 'Unknown notification';
    }
  };

  const formatTime = (timestamp: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const notificationDate = new Date(timestamp);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (notificationDate >= today) {
      return notificationDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).toLowerCase();
    } else if (notificationDate >= yesterday) {
      return 'yesterday';
    } else {
      return notificationDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <Surface style={styles.notificationItem} elevation={0}>
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={getNotificationIcon(notification.type)}
            size={24}
            color={Colors.light.primary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.notificationText}>
            {getNotificationMessage(notification.type, notification.childName)}
          </Text>
          <Text style={styles.timestamp}>{formatTime(notification.timestamp)}</Text>
        </View>
      </View>
      <Divider style={styles.divider} />
    </Surface>
  );
};

const Notifications: React.FC = () => {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <View style={styles.header}>
        <MaterialIcons 
          name="arrow-back" 
          size={24} 
          onPress={() => router.back()} 
          style={styles.backButton}
        />
        <Text style={styles.title}>Notifications</Text>
      </View>

      <ScrollView 
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      >
        {mockNotifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: '#fff',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + '10', // 10% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
});

export default Notifications; 