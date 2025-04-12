// App.js
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import PhoneLoginScreen from './screens/PhoneLoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import StorageBookingScreen from './screens/StorageBookingScreen';
import InventoryScreen from './screens/InventoryScreen';
import FinancesScreen from './screens/FinancesScreen';
import ProfileScreen from './screens/ProfileScreen';
import ItemDetailsScreen from './screens/ItemDetailsScreen';

// Import utilities
import { getUserData } from './screens/storage.js';
// Removed notifications import

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator when user is logged in
function MainTabs({ route }) {
  const { user } = route.params || {};
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Book Storage') {
            iconName = focused ? 'snow' : 'snow-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Finances') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} initialParams={{ user }} />
      <Tab.Screen name="Book Storage" component={StorageBookingScreen} initialParams={{ user }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} initialParams={{ user }} />
      <Tab.Screen name="Finances" component={FinancesScreen} initialParams={{ user }} />
      <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ user }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for saved login when app starts
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await getUserData();
        if (userData) {
          setUser(userData);
          setIsLoggedIn(true);
          
          // Removed notification initialization
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);
  
  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    
    // Removed notification initialization
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }
  
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {!isLoggedIn ? (
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {props => <PhoneLoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen 
                name="Coldfarms" 
                component={MainTabs} 
                options={{ headerShown: false }}
                initialParams={{ user }}
              />
              <Stack.Screen 
                name="ItemDetails" 
                component={ItemDetailsScreen}
                options={{ title: 'Item Details' }}
                initialParams={{ user }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}