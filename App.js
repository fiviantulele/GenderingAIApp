import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import DescriptionScreen from './src/screens/DescriptionScreen';
import ModernHomeScreen from './src/screens/ModernHomeScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import AgendaScreen from './src/screens/AgendaScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import SessionDetailScreen from './src/screens/SessionDetailScreen';

// Import theme
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#1a237e" />
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false, // Hide headers for splash and description screens
          }}
        >
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen}
          />
          <Stack.Screen 
            name="Description" 
            component={DescriptionScreen}
          />
          <Stack.Screen 
            name="Home" 
            component={ModernHomeScreen}
          />
          <Stack.Screen 
            name="Registration" 
            component={RegistrationScreen} 
            options={{ 
              title: 'Conference Registration',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#1a237e',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="Agenda" 
            component={AgendaScreen} 
            options={{ 
              title: 'Conference Agenda',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#1a237e',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="Schedule" 
            component={ScheduleScreen} 
            options={{ 
              title: 'My Schedule',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#1a237e',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="SessionDetail" 
            component={SessionDetailScreen} 
            options={{ 
              title: 'Session Details',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#1a237e',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}