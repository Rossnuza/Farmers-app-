// screens/StorageBookingScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bookStorage } from './api.js';

export default function StorageBookingScreen({ navigation, route }) {
  // Get user from route params
  const { user } = route.params || {};
  
  // Sample data for storage units - in a real app, fetch from API
  const STORAGE_UNITS = [
    {
      id: '1',
      unitId: 'CF-001',
      location: 'Central Market, Douala',
      temperature: 4.5,
      capacity: 500,
      maxCapacity: 1000,
      status: 'operational',
    },
    {
      id: '2',
      unitId: 'CF-002',
      location: 'East Market, Douala',
      temperature: 3.8,
      capacity: 700,
      maxCapacity: 1000,
      status: 'operational',
    },
    {
      id: '3',
      unitId: 'CF-003',
      location: 'Main Market, Yaoundé',
      temperature: 5.2,
      capacity: 300,
      maxCapacity: 800,
      status: 'operational',
    },
  ];

  const [selectedUnit, setSelectedUnit] = useState(null);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(false);

  // Calculate storage cost - 10 XAF per kg per day
  const calculateCost = () => {
    if (!quantity) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    return parseFloat(quantity) * 10 * days;
  };

  const handleBookStorage = async () => {
    // Validation
    if (!selectedUnit || !productName || !quantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    if (!user || !user.id) {
      Alert.alert('Error', 'User information is missing. Please try logging in again.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const bookingData = {
        farmerId: user.id,
        storageUnitId: selectedUnit.id,
        productName,
        quantity: parseFloat(quantity),
        unit: 'kg',
        startDate,
        endDate,
        dailyRate: true,
        status: 'active'
      };
      
      // Call your backend API
      await bookStorage(bookingData);
      
      // Success - reset form and navigate
      setSelectedUnit(null);
      setProductName('');
      setQuantity('');
      
      Alert.alert(
        'Success', 
        'Storage booked successfully',
        [
          { 
            text: 'View Inventory', 
            onPress: () => navigation.navigate('Inventory')
          },
          {
            text: 'Book Another',
            onPress: () => {}
          }
        ]
      );
    } catch (error) {
      console.error('Error booking storage:', error);
      Alert.alert('Error', error.message || 'Failed to book storage. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book Cold Storage</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Storage Unit<Text style={styles.required}>*</Text></Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STORAGE_UNITS.map(unit => (
            <TouchableOpacity
              key={unit.id}
              style={[
                styles.unitCard,
                selectedUnit?.id === unit.id && styles.selectedUnitCard
              ]}
              onPress={() => setSelectedUnit(unit)}
            >
              <Text style={styles.unitId}>{unit.unitId}</Text>
              <Text style={styles.unitLocation}>{unit.location}</Text>
              <View style={styles.unitDetails}>
                <View style={styles.unitDetail}>
                  <Ionicons name="thermometer-outline" size={16} color="#666" />
                  <Text style={styles.unitDetailText}>{unit.temperature}°C</Text>
                </View>
                <View style={styles.unitDetail}>
                  <Ionicons name="cube-outline" size={16} color="#666" />
                  <Text style={styles.unitDetailText}>
                    {unit.maxCapacity - unit.capacity} kg free
                  </Text>
                </View>
              </View>
              <View style={[
                styles.statusIndicator,
                unit.status === 'operational' ? styles.operational : styles.nonOperational
              ]} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Details</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name<Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={productName}
            onChangeText={setProductName}
            placeholder="e.g. Tomatoes, Potatoes, etc."
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantity (kg)<Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Enter weight in kg"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.dateRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>End Date</Text>
            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>
      </View>
      
      <View style={styles.costSection}>
        <Text style={styles.costTitle}>Storage Cost</Text>
        <Text style={styles.costAmount}>
          {calculateCost().toLocaleString()} XAF
        </Text>
        <Text style={styles.costDescription}>
          10 XAF per kg per day
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.bookButton,
          (isLoading || !selectedUnit || !productName || !quantity) && styles.disabledButton
        ]}
        onPress={handleBookStorage}
        disabled={isLoading || !selectedUnit || !productName || !quantity}
      >
        {isLoading ? (
          <View style={styles.loadingButton}>
            <ActivityIndicator size="small" color="white" />
            <Text style={[styles.bookButtonText, {marginLeft: 10}]}>Processing...</Text>
          </View>
        ) : (
          <Text style={styles.bookButtonText}>Book Storage</Text>
        )}
      </TouchableOpacity>
      
      <Text style={styles.note}>
        Note: By booking storage, you agree to Coldfarms' terms and conditions.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  required: {
    color: '#F44336',
    fontSize: 16,
  },
  unitCard: {
    width: 180,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
  },
  selectedUnitCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f9f0',
  },
  unitId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  unitLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  unitDetails: {
    marginTop: 5,
  },
  unitDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  unitDetailText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  statusIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  operational: {
    backgroundColor: '#4CAF50',
  },
  nonOperational: {
    backgroundColor: '#F44336',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  dateRow: {
    flexDirection: 'row',
  },
  costSection: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  costTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  costAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  costDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    fontSize: 12,
  }
});