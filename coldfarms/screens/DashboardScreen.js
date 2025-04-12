// screens/DashboardScreen.js
import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
  // Sample data
  const storageStats = {
    totalItems: 3,
    totalWeight: 90,
    expiringItems: 1,
    avgCostPerDay: 900,
  };
  
  const notifications = [
    { id: 1, type: 'storage', message: 'Tomatoes expire in 2 days', date: '2023-06-20' },
    { id: 2, type: 'payment', message: 'You received payment: 5,000 XAF', date: '2023-06-18' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Farmer</Text>
        <TouchableOpacity style={styles.notificationIcon}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
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
          onPress={() => navigation.navigate('Book Storage')}
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.bookButtonText}>Book Storage</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.notificationsSection}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        {notifications.map(notification => (
          <View key={notification.id} style={styles.notificationItem}>
            <View style={[
              styles.notificationIcon, 
              notification.type === 'storage' ? styles.storageIcon : styles.paymentIcon
            ]}>
              <Ionicons 
                name={notification.type === 'storage' ? 'time-outline' : 'cash-outline'} 
                size={20} 
                color="white" 
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationDate}>{notification.date}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <View style={styles.quickActions}>
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
            <Text style={styles.actionText}>Check Earnings</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
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
    borderRadius: 10,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  costSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginBottom: 15,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 16,
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
    marginLeft: 5,
  },
  notificationsSection: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  storageIcon: {
    backgroundColor: '#FF9800',
  },
  paymentIcon: {
    backgroundColor: '#4CAF50',
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    margin: 20,
    marginTop: 0,
    marginBottom: 30,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: {
    marginTop: 10,
    color: '#4CAF50',
    fontWeight: '500',
  },
});