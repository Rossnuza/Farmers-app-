// screens/ItemDetailsScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ItemDetailsScreen({ route, navigation }) {
  const { item } = route.params;
  const [isMarketplaceEnabled, setIsMarketplaceEnabled] = useState(item.listedOnMarketplace);
  
  const handleMarketplaceToggle = (value) => {
    setIsMarketplaceEnabled(value);
    
    // In a real app, this would update your API
    Alert.alert(
      value ? 'Listed on Marketplace' : 'Removed from Marketplace',
      value 
        ? 'Your item is now available for sale' 
        : 'Your item is no longer listed for sale'
    );
  };

  // Calculate remaining days
  const calculateRemainingDays = () => {
    const endDate = new Date(item.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.productName}>{item.productName}</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Quantity</Text>
            <Text style={styles.infoValue}>{item.quantity} {item.unit}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Storage Unit</Text>
            <Text style={styles.infoValue}>{item.storageUnitId}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Start Date</Text>
            <Text style={styles.infoValue}>{item.startDate}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>End Date</Text>
            <Text style={styles.infoValue}>{item.endDate}</Text>
          </View>
        </View>
        
        <View style={styles.daysRemaining}>
          <Text style={styles.daysLabel}>Days Remaining</Text>
          <Text style={styles.daysValue}>{calculateRemainingDays()}</Text>
        </View>
        
        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={[styles.statusBadge, 
            item.status === 'active' ? styles.activeStatus : styles.inactiveStatus]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.marketplaceSection}>
          <View style={styles.marketplaceHeader}>
            <Text style={styles.marketplaceLabel}>List on Marketplace</Text>
            <Switch
              value={isMarketplaceEnabled}
              onValueChange={handleMarketplaceToggle}
              trackColor={{ false: "#ddd", true: "#4CAF50" }}
              thumbColor={isMarketplaceEnabled ? "#fff" : "#f4f3f4"}
            />
          </View>
          
          <Text style={styles.marketplaceDescription}>
            When enabled, your product will be available for purchase on the Coldfarms marketplace.
            You will be notified of sales and receive payment directly.
          </Text>
        </View>
        
        <View style={styles.costSection}>
          <Text style={styles.costLabel}>Storage Cost</Text>
          <Text style={styles.costValue}>
            {item.quantity * 10} XAF/day
          </Text>
          <Text style={styles.costDescription}>10 XAF per kg per day</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => {
          Alert.alert(
            "Remove Item",
            "Are you sure you want to remove this item?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Remove", style: "destructive", onPress: () => navigation.goBack() }
            ]
          );
        }}
      >
        <Ionicons name="trash-outline" size={20} color="white" />
        <Text style={styles.removeButtonText}>Remove Item</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    width: '48%',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  daysRemaining: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#F0F4C3',
    borderRadius: 8,
  },
  daysLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  daysValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  activeStatus: {
    backgroundColor: '#E8F5E9',
  },
  inactiveStatus: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  marketplaceSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
    marginBottom: 20,
  },
  marketplaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  marketplaceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  marketplaceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  costSection: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  costValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  costDescription: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});