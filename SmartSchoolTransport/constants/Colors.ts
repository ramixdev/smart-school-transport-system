/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Primary app colors
const primaryColor = '#4DC0B5';    // Teal color from your UI
const secondaryColor = '#5B9BD5';  // Blue color from your UI

// Tint colors (used for selected tabs, etc.)
const tintColorLight = primaryColor;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#333333',           // Dark text for readability
    textLight: '#666666',      // Lighter text for secondary information
    background: '#fff',
    tint: tintColorLight,
    primary: primaryColor,
    secondary: secondaryColor,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#E0E0E0',
    error: '#FF6B6B',
    success: '#4CAF50',
    warning: '#FFC107',
  },
  dark: {
    text: '#ECEDEE',
    textLight: '#9BA1A6',
    background: '#151718',
    tint: tintColorDark,
    primary: primaryColor,     // Keep primary color consistent
    secondary: '#7BAAE0',      // Slightly lighter version for dark mode
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#2E3235',
    error: '#FF8A8A',
    success: '#5FCC63',
    warning: '#FFD74D',
  },
};

export default Colors;