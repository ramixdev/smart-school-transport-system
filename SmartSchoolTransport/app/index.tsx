import { Redirect } from 'expo-router';

export default function Index() {
  // This redirects to the splash screen at app startup
  return <Redirect href="/(auth)/splash" />;
}