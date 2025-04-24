import React from 'react';
import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="live-track" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="map-selection" options={{ headerShown: false }} />
      <Stack.Screen name="edit-child" options={{ headerShown: false }} />
      <Stack.Screen name="driver-details" options={{ headerShown: false }} />
    </Stack>
  );
} 