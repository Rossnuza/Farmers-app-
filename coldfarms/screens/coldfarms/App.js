// App.js
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StorageBookingRequestScreen from './screens/StorageBookingRequestScreen';
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
// Import WebSocket utilities
import { connectWebSocket, disconnectWebSocket } from './screens/websocket';

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
          } else if (route.name === 'Storage') {
            iconName = focused ? 'snow' : 'snow-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'cube' : 'cube-outline';
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
      <Tab.Screen name="Storage" component={StorageBookingScreen} initialParams={{ user }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} initialParams={{ user }} />
      <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ user }} />
    </Tab.Navigator>
  );
}

// Main App component
const App = () => {
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
          
          // Connect to WebSocket when user is logged in
          connectWebSocket(userData.id);
          console.log(`WebSocket connected for farmer ID: ${userData.id}`);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
    
    // Disconnect WebSocket when component unmounts
    return () => {
      disconnectWebSocket();
      console.log('WebSocket disconnected on app unmount');
    };
  }, []);
  
  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    
    // Connect to WebSocket on login
    connectWebSocket(userData.id);
    console.log(`WebSocket connected for farmer ID: ${userData.id}`);
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
              <Stack.Screen 
                name="Finances" 
                component={FinancesScreen}
                options={{ title: 'Finances' }}
                initialParams={{ user }}
              />
              <Stack.Screen 
                name="Requests" 
                component={StorageBookingRequestScreen}
                options={{ title: 'Storage Requests' }}
                initialParams={{ user }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

// Make sure to export the App component as default
export default App;