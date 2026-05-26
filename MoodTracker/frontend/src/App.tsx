import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, StatusBar } from 'react-native';

// Context
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';

// Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors, isDarkMode } = useContext(ThemeContext);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Registro de Humor',
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Histórico',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppWithTheme() {
  const { isDarkMode, colors } = useContext(ThemeContext);
  
  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={colors.surface} 
      />
      <RootNavigator />
    </>
  );
}
