// screens/StorageBookingScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getAvailableStorageUnits, 
  createStorageBooking, 
  getCategories, 
  getProductTypes 
} from './api.js';
import { addMessageHandler } from './websocket.js';

export default function StorageBookingScreen({ navigation, route }) {
  // Get user from route params
  const { user } = route.params || {};
  
  // State for storage units
  const [storageUnits, setStorageUnits] = useState([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  
  // State for categories and product types
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // Form state
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [farmerNotes, setFarmerNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useDailyRate, setUseDailyRate] = useState(true);

  // Fetch data on component load
  useEffect(() => {
    // Fetch available storage units
    const fetchStorageUnits = async () => {
      try {
        setIsLoadingUnits(true);
        // Get storage units from API
        const response = await getAvailableStorageUnits();
        
        if (response && Array.isArray(response) && response.length > 0) {
          console.log("Received storage units from API:", response);
          setStorageUnits(response);
        } else {
          console.warn("API returned empty or invalid storage units data");
          // Use placeholder data that matches admin panel format
          setStorageUnits([
            {
              id: '1',
              unitId: 'CSU-CA-YA-001',
              location: 'Yaoundé, Cameroon',
              temperature: 2,
              capacity: 0,
              maxCapacity: 1000,
              status: 'operational',
            },
            {
              id: '2',
              unitId: 'CSU-CA-YA-002',
              location: 'Yaoundé, Cameroon',
              temperature: 2,
              capacity: 0,
              maxCapacity: 1000,
              status: 'operational',
            },
            {
              id: '3',
              unitId: 'CSU-CA-YA-003',
              location: 'Yaoundé, Cameroon',
              temperature: 2,
              capacity: 10,
              maxCapacity: 1000,
              status: 'operational',
            }
          ]);
          
          Alert.alert('Notice', 'Using placeholder storage units. Live data unavailable.');
        }
      } catch (error) {
        console.error('Error fetching storage units:', error);
        // Use placeholder data that matches admin panel format
        setStorageUnits([
          {
            id: '1',
            unitId: 'CSU-CA-YA-001',
            location: 'Yaoundé, Cameroon',
            temperature: 2,
            capacity: 0,
            maxCapacity: 1000,
            status: 'operational',
          },
          {
            id: '2',
            unitId: 'CSU-CA-YA-002',
            location: 'Yaoundé, Cameroon',
            temperature: 2,
            capacity: 0,
            maxCapacity: 1000,
            status: 'operational',
          },
          {
            id: '3',
            unitId: 'CSU-CA-YA-003',
            location: 'Yaoundé, Cameroon',
            temperature: 2,
            capacity: 10,
            maxCapacity: 1000,
            status: 'operational',
          }
        ]);
        
        Alert.alert('Notice', 'Using placeholder storage units. Server connection failed.');
      } finally {
        setIsLoadingUnits(false);
      }
    };
    
    // Fetch categories
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await getCategories();
        if (response && Array.isArray(response)) {
          setCategories(response);
        } else {
          // Fallback categories if API fails
          setCategories([
            { id: 1, name: "Fruits", description: "Fresh fruits from local farms" },
            { id: 2, name: "Vegetables", description: "Seasonal vegetables" },
            { id: 3, name: "Dairy", description: "Milk, cheese, and other dairy products" },
            { id: 4, name: "Meat", description: "Fresh meat products" },
            { id: 5, name: "Grains", description: "Rice, wheat, and other grains" }
          ]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback categories if API fails
        setCategories([
          { id: 1, name: "Fruits", description: "Fresh fruits from local farms" },
          { id: 2, name: "Vegetables", description: "Seasonal vegetables" },
          { id: 3, name: "Dairy", description: "Milk, cheese, and other dairy products" },
          { id: 4, name: "Meat", description: "Fresh meat products" },
          { id: 5, name: "Grains", description: "Rice, wheat, and other grains" }
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchStorageUnits();
    fetchCategories();
    
    // Listen for booking request updates
    const removeBookingCreatedHandler = addMessageHandler('booking_request_created', (data) => {
      if (data.farmerId === user.id) {
        Alert.alert('Booking Request Received', 'Your storage booking request has been submitted.');
      }
    });
    
    const removeBookingUpdatedHandler = addMessageHandler('booking_request_updated', (data) => {
      if (data.farmerId === user.id) {
        let message = 'Your booking request has been updated.';
        
        if (data.status === 'approved') {
          message = 'Your booking request has been approved! Your items are now in storage.';
        } else if (data.status === 'rejected') {
          message = `Your booking request was rejected. Reason: ${data.adminNotes || 'None provided'}`;
        }
        
        Alert.alert('Booking Status Update', message);
      }
    });
    
    // NEW: Listen for new categories and product types
    const removeCategoryCreatedHandler = addMessageHandler('category_created', (data) => {
      console.log('New category received:', data);
      setCategories(prev => {
        // Check if we already have this category (avoid duplicates)
        if (prev.some(cat => cat.id === data.id)) {
          return prev;
        }
        return [...prev, data];
      });
    });

    const removeCategoryUpdatedHandler = addMessageHandler('category_updated', (data) => {
      console.log('Category updated:', data);
      setCategories(prev => 
        prev.map(cat => cat.id === data.id ? data : cat)
      );
      
      // If the updated category is the selected category, update it
      if (selectedCategory && selectedCategory.id === data.id) {
        setSelectedCategory(data);
      }
    });

    const removeProductTypeCreatedHandler = addMessageHandler('product_type_created', (data) => {
      console.log('New product type received:', data);
      // Only add to product types if it's for the currently selected category
      if (selectedCategory && data.categoryId === selectedCategory.id) {
        setProductTypes(prev => {
          // Check if we already have this product type (avoid duplicates)
          if (prev.some(prod => prod.id === data.id)) {
            return prev;
          }
          return [...prev, data];
        });
      }
    });

    const removeProductTypeUpdatedHandler = addMessageHandler('product_type_updated', (data) => {
      console.log('Product type updated:', data);
      // Only update product types if it's for the currently selected category
      if (selectedCategory && data.categoryId === selectedCategory.id) {
        setProductTypes(prev => 
          prev.map(prod => prod.id === data.id ? data : prod)
        );
        
        // If the updated product type is the selected product type, update it
        if (selectedProductType && selectedProductType.id === data.id) {
          setSelectedProductType(data);
        }
      }
    });
    
    // Clean up event handlers
    return () => {
      if (removeBookingCreatedHandler) removeBookingCreatedHandler();
      if (removeBookingUpdatedHandler) removeBookingUpdatedHandler();
      if (removeCategoryCreatedHandler) removeCategoryCreatedHandler();
      if (removeCategoryUpdatedHandler) removeCategoryUpdatedHandler();
      if (removeProductTypeCreatedHandler) removeProductTypeCreatedHandler();
      if (removeProductTypeUpdatedHandler) removeProductTypeUpdatedHandler();
    };
  }, [user?.id, selectedCategory?.id, selectedProductType?.id]);

  // Load product types when category changes
  useEffect(() => {
    // Updated fetchProductTypes function
    const fetchProductTypes = async () => {
      if (!selectedCategory) {
        setProductTypes([]);
        setSelectedProductType(null);
        return;
      }
      
      try {
        setIsLoadingProductTypes(true);
        console.log("Fetching products for category:", selectedCategory.id);
        const response = await getProductTypes(selectedCategory.id);
        console.log("Product types response:", response);
        
        if (response && Array.isArray(response) && response.length > 0) {
          setProductTypes(response);
        } else {
          console.warn("No product types found for category");
          setProductTypes([]);
        }
      } catch (error) {
        console.error('Error fetching product types:', error);
      } finally {
        setIsLoadingProductTypes(false);
      }
    };
    
    fetchProductTypes();
  }, [selectedCategory]);

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
    if (!selectedUnit) {
      Alert.alert('Error', 'Please select a storage unit');
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a product category');
      return;
    }
    
    if (!selectedProductType) {
      Alert.alert('Error', 'Please select a product type');
      return;
    }
    
    if (!quantity) {
      Alert.alert('Error', 'Please enter a quantity');
      return;
    }
    
    if (!user || !user.id) {
      Alert.alert('Error', 'User information is missing. Please try logging in again.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const bookingData = {
        storageUnitId: selectedUnit.id,
        productName: selectedProductType.name,
        quantity: parseFloat(quantity),
        unit: selectedProductType.standardUnit || 'kg',
        startDate,
        endDate,
        category: selectedCategory.name,
        categoryId: selectedCategory.id,
        productTypeId: selectedProductType.id,
        farmerNotes: farmerNotes || 'Submitted from mobile app',
        requestDate: new Date().toISOString(),
        status: 'pending',
        dailyRate: useDailyRate
      };
      
      // Use new booking request API
      const response = await createStorageBooking(user.id, bookingData);
      console.log("Booking response:", response);
      
      // Success - reset form
      setSelectedUnit(null);
      setSelectedCategory(null);
      setSelectedProductType(null);
      setQuantity('');
      setFarmerNotes('');
      
     Alert.alert(
        'Success', 
        'Storage booking request submitted. You will be notified when approved.',
        [
          { 
            text: 'View Requests',
            onPress: () => navigation.navigate('Requests')
          },
          {
            text: 'Book Another',
            onPress: () => {}
          }
        ]
      );
    } catch (error) {
      console.error('Error booking storage:', error);
      Alert.alert('Error', error.message || 'Failed to submit booking request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state for units
  if (isLoadingUnits) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading storage units...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book Cold Storage</Text>
      
      {/* STORAGE UNIT SELECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Storage Unit<Text style={styles.required}>*</Text></Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {storageUnits.map(unit => (
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
                  <Text style={styles.unitDetailText}>{unit.temperature || 0}°C</Text>
                </View>
                <View style={styles.unitDetail}>
                  <Ionicons name="cube-outline" size={16} color="#666" />
                  <Text style={styles.unitDetailText}>
                    {(unit.maxCapacity - unit.capacity) || 0} kg free
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
      
      {/* PRODUCT DETAILS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Details</Text>
        
        {/* Category Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category<Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={selectedCategory ? styles.dropdownText : styles.dropdownPlaceholder}>
              {selectedCategory ? selectedCategory.name : "Select a category"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Product Type Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Type<Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={[styles.dropdown, !selectedCategory && styles.disabledDropdown]}
            onPress={() => selectedCategory && setShowProductModal(true)}
            disabled={!selectedCategory}
          >
            <Text style={selectedProductType ? styles.dropdownText : styles.dropdownPlaceholder}>
              {selectedProductType ? selectedProductType.name : "Select a product type"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Quantity */}
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
        
        {/* Dates */}
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
        
        {/* Daily Rate Pricing Option */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Apply daily rate pricing</Text>
          <TouchableOpacity 
            style={[styles.checkbox, useDailyRate && styles.checkboxChecked]}
            onPress={() => setUseDailyRate(!useDailyRate)}>
            {useDailyRate && <Ionicons name="checkmark" size={16} color="white" />}
          </TouchableOpacity>
        </View>
        
        {/* Notes */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={farmerNotes}
            onChangeText={setFarmerNotes}
            placeholder="Add any special requirements or notes"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
      
      {/* COST ESTIMATE */}
      <View style={styles.costSection}>
        <Text style={styles.costTitle}>Estimated Storage Cost</Text>
        <Text style={styles.costAmount}>
          {calculateCost().toLocaleString()} XAF
        </Text>
        <Text style={styles.costDescription}>
          10 XAF per kg per day
        </Text>
      </View>
      
      {/* SUBMIT BUTTON */}
      <TouchableOpacity 
        style={[
          styles.bookButton,
          (isLoading || !selectedUnit || !selectedCategory || !selectedProductType || !quantity) && styles.disabledButton
        ]}
        onPress={handleBookStorage}
        disabled={isLoading || !selectedUnit || !selectedCategory || !selectedProductType || !quantity}
      >
        {isLoading ? (
          <View style={styles.loadingButton}>
            <ActivityIndicator size="small" color="white" />
            <Text style={[styles.bookButtonText, {marginLeft: 10}]}>Processing...</Text>
          </View>
        ) : (
          <>
            <Ionicons name="add-circle-outline" size={20} color="white" style={{marginRight: 5}} />
            <Text style={styles.bookButtonText}>Submit Booking Request</Text>
          </>
        )}
      </TouchableOpacity>
      
      <Text style={styles.note}>
        Note: By booking storage, you agree to Coldfarms' terms and conditions. Your request will be reviewed by an admin.
      </Text>
      
      {/* CATEGORY SELECTION MODAL */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {isLoadingCategories ? (
              <ActivityIndicator size="large" color="#4CAF50" style={styles.modalLoading} />
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedCategory(item);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.modalItemDescription}>{item.description}</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
      
      {/* PRODUCT TYPE SELECTION MODAL */}
      <Modal
        visible={showProductModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Product Type</Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {isLoadingProductTypes ? (
              <ActivityIndicator size="large" color="#4CAF50" style={styles.modalLoading} />
            ) : (
              <FlatList
                data={productTypes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedProductType(item);
                      setShowProductModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                    <Text style={styles.modalItemDescription}>Unit: {item.standardUnit || 'kg'}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyList}>
                    <Text style={styles.emptyListText}>No product types found for this category</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
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
    backgroundColor: '#fff',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledDropdown: {
    backgroundColor: '#f9f9f9',
    borderColor: '#eee',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#aaa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalLoading: {
    padding: 30,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    marginBottom: 4,
  },
  modalItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyList: {
    padding: 30,
    alignItems: 'center',
  },
  emptyListText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});