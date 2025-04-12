// screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addMessageHandler } from './websocket';
import { getFarmerInventory, getFarmerBookingRequests } from './api';

export default function DashboardScreen({ route, navigation }) {
  const { user } = route.params || {};
  const [storageStats, setStorageStats] = useState({
    totalItems: 0,
    totalWeight: 0,
    expiringItems: 0,
    avgCostPerDay: 0,
  });
  const [pendingBookings, setPendingBookings] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      // Get inventory
      const inventory = await getFarmerInventory(user.id);
      
      // Get booking requests
      const bookings = await getFarmerBookingRequests(user.id);
      
      // Calculate stats
      let totalWeight = 0;
      let expiringItems = 0;
      let totalCost = 0;
      
      if (inventory && Array.isArray(inventory)) {
        inventory.forEach(item => {
          totalWeight += item.quantity || 0;
          
          // Check if expiring in 3 days
          const today = new Date();
          const endDate = new Date(item.endDate);
          const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
          
          if (daysLeft <= 3 && daysLeft > 0) {
            expiringItems++;
          }
          
          // Calculate daily cost (assuming 10 XAF per kg per day)
          totalCost += (item.quantity || 0) * 10;
        });
      
        // Update state
        setStorageStats({
          totalItems: inventory.length,
          totalWeight,
          expiringItems,
          avgCostPerDay: totalCost,
        });
      }
      
      // Count pending bookings
      if (bookings && Array.isArray(bookings)) {
        const pendingCount = bookings.filter(booking => 
          booking.status && booking.status.toLowerCase() === 'pending'
        ).length;
        
        setPendingBookings(pendingCount);
        
        // Create notifications
        const newNotifications = [];
        
        // Add expiring items notifications
        if (inventory && Array.isArray(inventory)) {
          inventory.forEach(item => {
            const today = new Date();
            const endDate = new Date(item.endDate);
            const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysLeft <= 3 && daysLeft > 0) {
              newNotifications.push({
                id: `expire-${item.id}`,
                type: 'storage',
                message: `${item.productName} expires in ${daysLeft} days`,
                date: new Date().toISOString(),
              });
            }
          });
        }
        
        // Add pending booking notifications
        if (bookings && Array.isArray(bookings)) {
          bookings.forEach(booking => {
            if (booking.status && booking.status.toLowerCase() === 'pending') {
              newNotifications.push({
                id: `booking-${booking.id}`,
                type: 'booking',
                message: `Booking for ${booking.productName} is pending approval`,
                date: booking.requestDate,
              });
            }
          });
        }
        
        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    fetchDashboardData();
  };

  // Set up WebSocket listeners
  useEffect(() => {
    fetchDashboardData();
    
    // Register handlers for real-time updates
    const removeBookingHandler = addMessageHandler('booking_request_updated', (data) => {
      if (data.farmerId === user.id) {
        // Refresh dashboard data when booking status changes
        fetchDashboardData();
      }
    });
    
    const removeInventoryHandler = addMessageHandler('farmer_inventory_created', (data) => {
      if (data.farmerId === user.id) {
        // Refresh dashboard data when inventory changes
        fetchDashboardData();
      }
    });
    
    // Clean up handlers
    return () => {
      if (removeBookingHandler) removeBookingHandler();
      if (removeInventoryHandler) removeInventoryHandler();
    };
  }, [user?.id]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'Farmer'}</Text>
        <TouchableOpacity style={styles.notificationIcon}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          {notifications.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notifications.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.storageCard}>
        <Text style={styles.cardTitle}>Storage Summary</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{storageStats.totalItems}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{storageStats.totalWeight} kg</Text>
            <Text style={styles.statLabel}>Total Weight</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{storageStats.expiringItems}</Text>
            <Text style={styles.statLabel}>Expiring Soon</Text>
          </View>
        </View>
        
        <View style={styles.costSummary}>
          <Text style={styles.costLabel}>Current Daily Cost:</Text>
          <Text style={styles.costValue}>{storageStats.avgCostPerDay} XAF/day</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('Storage')}
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.bookButtonText}>Book Storage</Text>
        </TouchableOpacity>
      </View>
      
      {pendingBookings > 0 && (
        <TouchableOpacity 
          style={styles.pendingCard}
          onPress={() => navigation.navigate('Requests')}
        >
          <Ionicons name="time-outline" size={24} color="white" />
          <View style={styles.pendingTextContainer}>
            <Text style={styles.pendingTitle}>Pending Bookings</Text>
            <Text style={styles.pendingDescription}>
              You have {pendingBookings} pending storage {pendingBookings === 1 ? 'request' : 'requests'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      )}
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        {notifications.length === 0 ? (
          <View style={styles.emptyNotifications}>
            <Ionicons name="notifications-off-outline" size={40} color="#aaa" />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        ) : (
          notifications.map(notification => (
            <View key={notification.id} style={styles.notificationItem}>
              <View style={[
                styles.notificationIcon, 
                notification.type === 'storage' ? styles.storageIcon : styles.bookingIcon
              ]}>
                <Ionicons 
                  name={notification.type === 'storage' ? 'time-outline' : 'calendar-outline'} 
                  size={20} 
                  color="white" 
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationDate}>{formatDate(notification.date)}</Text>
              </View>
            </View>
          ))
        )}
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Inventory')}
          >
            <Ionicons name="cube-outline" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>View Inventory</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Finances')}
          >
            <Ionicons name="cash-outline" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>Check Finances</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationIcon: {
    position: 'relative',
    padding: 5,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  storageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  costSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
    marginBottom: 16,
  },
  costLabel: {
    fontSize: 16,
    color: '#666',
  },
  costValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  pendingCard: {
    backgroundColor: '#f57c00',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  pendingTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  pendingDescription: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyNotifications: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#aaa',
    marginTop: 8,
    fontSize: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storageIcon: {
    backgroundColor: '#FF9800',
  },
  bookingIcon: {
    backgroundColor: '#4CAF50',
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  notificationDate: {
    fontSize: 12,
    color: '#888',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '48%',
  },
  actionText: {
    marginTop: 8,
    color: '#333',
    fontWeight: '500',
  },
});