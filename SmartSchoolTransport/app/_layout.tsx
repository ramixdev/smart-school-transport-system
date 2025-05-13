import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../contexts/firebase';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { updateFcmToken } from '../services/api';
import Constants from 'expo-constants';

export default function RootLayout() {
  const { user } = useAuth();

  useEffect(() => {
    async function registerForPushNotifications() {
      if (!user) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId
      });
      const fcmToken = tokenData.data;
      if (fcmToken) {
        try {
          // Get Firebase Auth token
          const authToken = await user.getIdToken();
          await updateFcmToken(fcmToken, authToken);
        } catch (err) {
          console.log('Error updating FCM token:', err);
        }
      }
    }
    registerForPushNotifications();
  }, [user]);

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="(parent)" />
            <Stack.Screen name="(driver)" />
          </Stack>
        </PaperProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}