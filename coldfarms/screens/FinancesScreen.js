// screens/FinancesScreen.js
import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FinancesScreen() {
  // Sample data
  const currentStorageCosts = {
    total: 9000,
    daily: 900,
    itemBreakdown: [
      { id: 1, name: 'Tomatoes', quantity: 25, cost: 250 },
      { id: 2, name: 'Potatoes', quantity: 50, cost: 500 },
      { id: 3, name: 'Carrots', quantity: 15, cost: 150 },
    ]
  };
  
  const marketplaceEarnings = {
    total: 25000,
    pending: 5000,
    transactions: [
      { id: 1, date: '2023-06-15', amount: 10000, status: 'paid' },
      { id: 2, date: '2023-06-18', amount: 15000, status: 'paid' },
      { id: 3, date: '2023-06-20', amount: 5000, status: 'pending' },
    ]
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryItem, styles.costSummaryItem]}>
            <Text style={styles.summaryLabel}>Storage Costs</Text>
            <Text style={styles.summaryValue}>{currentStorageCosts.total} XAF</Text>
            <Text style={styles.summarySecondary}>{currentStorageCosts.daily} XAF/day</Text>
          </View>
          
          <View style={[styles.summaryItem, styles.earningsItem]}>
            <Text style={styles.summaryLabel}>Earnings</Text>
            <Text style={styles.summaryValue}>{marketplaceEarnings.total} XAF</Text>
            <Text style={styles.summarySecondary}>{marketplaceEarnings.pending} XAF pending</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Costs</Text>
        
        {currentStorageCosts.itemBreakdown.map(item => (
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
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Marketplace Earnings</Text>
        
        {marketplaceEarnings.transactions.map(transaction => (
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
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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