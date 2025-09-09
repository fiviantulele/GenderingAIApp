import { DefaultTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1a237e',
    secondary: '#00bcd4',
    accent: '#3949ab',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#1a237e',
    placeholder: '#666666',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    onSurface: '#1a237e',
    notification: '#f44336',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
};

export const colors = {
  primary: '#1a237e',
  secondary: '#00bcd4',
  accent: '#3949ab',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#1a237e',
  textSecondary: '#666666',
  border: '#e0e0e0',
  success: '#4caf50',
  warning: '#ffc107',
  error: '#f44336',
  info: '#2196f3',
  white: '#ffffff',
  black: '#000000',
  gray: '#666666',
  lightGray: '#f0f0f0',
  darkGray: '#333333',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  body: {
    fontSize: 16,
    color: colors.text,
  },
  caption: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  small: {
    fontSize: 12,
    color: colors.textSecondary,
  },
};
