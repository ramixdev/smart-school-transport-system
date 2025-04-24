import React from 'react';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="drivers" options={{ headerShown: false }} />
      <Stack.Screen name="driver-profile/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="driver-schools/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="schools" options={{ headerShown: false }} />
      <Stack.Screen name="add-school" options={{ headerShown: false }} />
      <Stack.Screen name="students" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}