// screens/InventoryScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addMessageHandler } from './websocket';
import { getFarmerInventory, toggleMarketplaceListing } from './api';

export default function InventoryScreen({ route, navigation }) {
  const { user } = route.params || {};
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await getFarmerInventory(user.id);
      setInventoryItems(response || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      Alert.alert('Error', 'Failed to load inventory. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Pull to refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInventory();
  };

  // Toggle marketplace listing
  const handleToggleMarketplace = async (item) => {
    try {
      const newListedStatus = !item.listedOnMarketplace;
      
      // Optimistic UI update
      setInventoryItems(prev => 
        prev.map(inv => 
          inv.id === item.id 
            ? { ...inv, listedOnMarketplace: newListedStatus } 
            : inv
        )
      );
      
      // API call
      await toggleMarketplaceListing(user.id, item.id, newListedStatus);
      
      // Show success message
      Alert.alert(
        'Success', 
        `Product ${newListedStatus ? 'added to' : 'removed from'} marketplace.`
      );
    } catch (error) {
      console.error('Error toggling marketplace listing:', error);
      
      // Revert optimistic update
      setInventoryItems(prev => 
        prev.map(inv => 
          inv.id === item.id 
            ? { ...inv, listedOnMarketplace: item.listedOnMarketplace } 
            : inv
        )
      );
      
      Alert.alert('Error', 'Failed to update marketplace listing.');
    }
  };

  // View item details
  const handleViewDetails = (item) => {
    navigation.navigate('ItemDetails', { item, user });
  };

 // In InventoryScreen.js, update the WebSocket handlers in useEffect:

useEffect(() => {
  fetchInventory();
  
  // Register WebSocket handlers for real-time updates
  const removeCreatedHandler = addMessageHandler('farmer_inventory_created', (data) => {
    if (data.farmerId === user.id) {
      console.log('New inventory item received via WebSocket:', data);
      setInventoryItems(prev => [...prev, data]);
      
      // Show notification
      Alert.alert(
        'New Item in Storage', 
        `Your ${data.productName} has been added to storage.`
      );
    }
  });
  
  const removeUpdatedHandler = addMessageHandler('farmer_inventory_updated', (data) => {
    if (data.farmerId === user.id) {
      console.log('Updated inventory item received via WebSocket:', data);
      setInventoryItems(prev => 
        prev.map(item => item.id === data.id ? data : item)
      );
    }
  });
  
  const removeDeletedHandler = addMessageHandler('farmer_inventory_removed', (data) => {
    if (data.farmerId === user.id) {
      console.log('Removed inventory item received via WebSocket:', data);
      setInventoryItems(prev => 
        prev.filter(item => item.id !== data.id)
      );
      
      // Show notification
      Alert.alert(
        'Item Removed', 
        `Your ${data.productName} has been removed from storage.`
      );
    }
  });
  
  // Clean up WebSocket handlers on component unmount
  return () => {
    removeCreatedHandler();
    removeUpdatedHandler();
    removeDeletedHandler();
  };
}, [user?.id]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status color
  const getStatusColor = (daysLeft) => {
    if (daysLeft < 0) return '#d32f2f'; // Expired - red
    if (daysLeft < 3) return '#f57c00'; // Warning - orange
    return '#4caf50'; // Good - green
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={inventoryItems.length === 0 ? styles.emptyContainer : {}}
    >
      {inventoryItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={64} color="#aaa" />
          <Text style={styles.emptyStateTitle}>No Items in Storage</Text>
          <Text style={styles.emptyStateText}>
            You don't have any items stored with Coldfarms yet.
          </Text>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => navigation.navigate('Book Storage')}
          >
            <Text style={styles.bookButtonText}>Book Storage Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.header}>Your Storage Inventory</Text>
          <Text style={styles.subheader}>
            {inventoryItems.length} {inventoryItems.length === 1 ? 'item' : 'items'} in storage
          </Text>
          
          {inventoryItems.map((item) => {
            const daysLeft = getDaysUntilExpiry(item.endDate);
            const statusColor = getStatusColor(daysLeft);
            
            return (
              <TouchableOpacity 
                key={item.id} 
                style={styles.inventoryCard}
                onPress={() => handleViewDetails(item)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.productName}>{item.productName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>
                      {daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cardContent}>
                  <View style={styles.cardDetail}>
                    <Text style={styles.detailLabel}>Quantity:</Text>
                    <Text style={styles.detailValue}>
                      {item.quantity} {item.unit}
                    </Text>
                  </View>
                  
                  <View style={styles.cardDetail}>
                    <Text style={styles.detailLabel}>Storage Unit:</Text>
                    <Text style={styles.detailValue}>{item.storageUnitId}</Text>
                  </View>
                  
                  <View style={styles.cardDetail}>
                    <Text style={styles.detailLabel}>Start Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(item.startDate)}</Text>
                  </View>
                  
                  <View style={styles.cardDetail}>
                    <Text style={styles.detailLabel}>End Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(item.endDate)}</Text>
                  </View>
                </View>
                
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[
                      styles.marketplaceButton,
                      item.listedOnMarketplace ? styles.marketplaceActiveButton : {}
                    ]}
                    onPress={() => handleToggleMarketplace(item)}
                  >
                    <Ionicons 
                      name={item.listedOnMarketplace ? "pricetag" : "pricetag-outline"} 
                      size={16} 
                      color={item.listedOnMarketplace ? "white" : "#4CAF50"} 
                    />
                    <Text 
                      style={[
                        styles.marketplaceText,
                        item.listedOnMarketplace ? styles.marketplaceActiveText : {}
                      ]}
                    >
                      {item.listedOnMarketplace ? "Listed on Marketplace" : "Add to Marketplace"}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => handleViewDetails(item)}
                  >
                    <Ionicons name="information-circle-outline" size={16} color="#333" />
                    <Text style={styles.detailsText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  inventoryCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    marginBottom: 15,
  },
  cardDetail: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  marketplaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  marketplaceActiveButton: {
    backgroundColor: '#4CAF50',
  },
  marketplaceText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 5,
  },
  marketplaceActiveText: {
    color: 'white',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  detailsText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 5,
  },
});