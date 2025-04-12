// screens/FinancesScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFarmerFinances } from './api';
import { addMessageHandler } from './websocket';

export default function FinancesScreen({ route }) {
  const { user } = route.params || {};
  const [isLoading, setIsLoading] = useState(true);
  const [storageCosts, setStorageCosts] = useState({
    total: 0,
    daily: 0,
    itemBreakdown: []
  });
  
  const [earnings, setEarnings] = useState({
    total: 0,
    pending: 0,
    transactions: []
  });

  // Fetch finances data
  const fetchFinances = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      // Get financial data from API
      const response = await getFarmerFinances(user.id);
      
      if (response) {
        // Update storage costs
        setStorageCosts({
          total: response.storageCosts?.total || 0,
          daily: response.storageCosts?.daily || 0,
          itemBreakdown: response.storageCosts?.itemBreakdown || []
        });
        
        // Update earnings
        setEarnings({
          total: response.earnings?.total || 0,
          pending: response.earnings?.pending || 0,
          transactions: response.earnings?.transactions || []
        });
      }
    } catch (error) {
      console.error('Error fetching finances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load and WebSocket setup
  useEffect(() => {
    fetchFinances();
    
    // Listen for financial updates
    const removeEarningsHandler = addMessageHandler('farmer_earnings_updated', (data) => {
      if (data.farmerId === user.id) {
        fetchFinances(); // Refresh data when finances are updated
      }
    });
    
    const removeStorageCostHandler = addMessageHandler('farmer_storage_cost_updated', (data) => {
      if (data.farmerId === user.id) {
        fetchFinances(); // Refresh data when storage costs are updated
      }
    });
    
    // Clean up
    return () => {
      if (removeEarningsHandler) removeEarningsHandler();
      if (removeStorageCostHandler) removeStorageCostHandler();
    };
  }, [user?.id]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading financial information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryItem, styles.costSummaryItem]}>
            <Text style={styles.summaryLabel}>Storage Costs</Text>
            <Text style={styles.summaryValue}>{storageCosts.total} XAF</Text>
            <Text style={styles.summarySecondary}>{storageCosts.daily} XAF/day</Text>
          </View>
          
          <View style={[styles.summaryItem, styles.earningsItem]}>
            <Text style={styles.summaryLabel}>Earnings</Text>
            <Text style={styles.summaryValue}>{earnings.total} XAF</Text>
            <Text style={styles.summarySecondary}>{earnings.pending} XAF pending</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Costs</Text>
        
        {storageCosts.itemBreakdown.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No storage costs yet</Text>
          </View>
        ) : (
          storageCosts.itemBreakdown.map(item => (
            <View key={item.id} style={styles.costListItem}>
              <View style={styles.costDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>{item.quantity} kg</Text>
              </View>
              <View style={styles.costAmount}>
                <Text style={styles.dailyCost}>{item.cost} XAF/day</Text>
                <Text style={styles.monthlyCost}>{item.cost * 30} XAF/month</Text>
              </View>
            </View>
          ))
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Marketplace Earnings</Text>
        
        {earnings.transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No earnings yet</Text>
          </View>
        ) : (
          earnings.transactions.map(transaction => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
                <View style={[
                  styles.statusBadge,
                  transaction.status === 'paid' ? styles.paidBadge : styles.pendingBadge
                ]}>
                  <Text style={styles.statusText}>{transaction.status}</Text>
                </View>
              </View>
              <Text style={styles.transactionAmount}>{transaction.amount} XAF</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '47%',
    padding: 10,
    borderRadius: 8,
  },
  costSummaryItem: {
    backgroundColor: '#FFEBEE',
  },
  earningsItem: {
    backgroundColor: '#E8F5E9',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    flexShrink: 1,
  },
  summarySecondary: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#757575',
    fontSize: 16,
  },
  costListItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  costDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  costAmount: {
    alignItems: 'flex-end',
  },
  dailyCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 5,
  },
  monthlyCost: {
    fontSize: 12,
    color: '#666',
  },
  transactionItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 16,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: '#E8F5E9',
  },
  pendingBadge: {
    backgroundColor: '#FFF8E1',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});