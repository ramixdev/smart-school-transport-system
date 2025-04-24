import React from 'react';
import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{ 
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="pending-students"
        options={{ 
          title: 'Pending Requests',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="settings"
        options={{ 
          title: 'Settings',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="student-list"
        options={{ 
          title: 'Student List',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="journey-map"
        options={{ 
          title: 'Journey Map',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="schools"
        options={{ 
          title: 'Schools',
          headerShown: true,
        }}
      />
    </Stack>
  );
}