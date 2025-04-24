// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="user-type" options={{ headerShown: false }} />
      <Stack.Screen name="parent-signup" options={{ headerShown: false }} />
      <Stack.Screen name="parent-add-child" options={{ headerShown: false }} />
      <Stack.Screen name="parent-edit-child" options={{ headerShown: false }} />
      <Stack.Screen name="parent-select-driver" options={{ headerShown: false }} />
      <Stack.Screen name="driver-signup-email" options={{ headerShown: false }} />
      <Stack.Screen name="driver-signup-personal" options={{ headerShown: false }} />
      <Stack.Screen name="driver-signup-vehicle" options={{ headerShown: false }} />
      <Stack.Screen name="driver-signup-school" options={{ headerShown: false }} />
      <Stack.Screen name="driver-vehicle-map" options={{ headerShown: false }} />
    </Stack>
  );
}