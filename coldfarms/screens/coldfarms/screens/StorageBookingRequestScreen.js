// screens/StorageBookingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFarmerBookingRequests, cancelBookingRequest } from './api';
import { addMessageHandler } from './websocket';

export default function StorageBookingsScreen({ route, navigation }) {
  const { user } = route.params || {};
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await getFarmerBookingRequests(user.id);
      setBookings(response || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load booking requests');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBookings();
  };

  // Cancel booking
  const handleCancelBooking = async (booking) => {
    try {
      await cancelBookingRequest(booking.id);
      // Remove from state
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      Alert.alert('Success', 'Booking request cancelled');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking request');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Booking status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f57c00';
      case 'approved': return '#4caf50';
      case 'rejected': return '#d32f2f';
      case 'cancelled': return '#757575';
      default: return '#757575';
    }
  };

  // Set up WebSocket listeners
  useEffect(() => {
    fetchBookings();
    
    // Listen for booking updates
    const removeBookingCreatedHandler = addMessageHandler('booking_request_created', (data) => {
      if (data.farmerId === user.id) {
        setBookings(prev => [...prev, data]);
      }
    });
    
    const removeBookingUpdatedHandler = addMessageHandler('booking_request_updated', (data) => {
      if (data.farmerId === user.id) {
        setBookings(prev => prev.map(b => b.id === data.id ? data : b));
        
        // Notification for status changes
        if (data.status === 'approved') {
          Alert.alert('Booking Approved', `Your ${data.productName} booking has been approved!`);
        } else if (data.status === 'rejected') {
          Alert.alert('Booking Rejected', `Your booking was rejected. Reason: ${data.adminNotes || 'None provided'}`);
        }
      }
    });
    
    // Clean up
    return () => {
      removeBookingCreatedHandler();
      removeBookingUpdatedHandler();
    };
  }, [user?.id]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading booking requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Booking Requests</Text>
      
      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#aaa" />
          <Text style={styles.emptyStateText}>No booking requests</Text>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('Book Storage')}
          >
            <Text style={styles.bookButtonText}>Book Storage</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.productName}>{item.productName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              
              <View style={styles.cardContent}>
                <View style={styles.cardDetail}>
                  <Text style={styles.detailLabel}>Quantity:</Text>
                  <Text style={styles.detailValue}>{item.quantity} {item.unit}</Text>
                </View>
                
                <View style={styles.cardDetail}>
                  <Text style={styles.detailLabel}>Request Date:</Text>
                  <Text style={styles.detailValue}>{formatDate(item.requestDate)}</Text>
                </View>
                
                <View style={styles.cardDetail}>
                  <Text style={styles.detailLabel}>Storage Period:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(item.startDate)} - {formatDate(item.endDate)}
                  </Text>
                </View>
                
                {item.adminNotes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Admin Notes:</Text>
                    <Text style={styles.notesText}>{item.adminNotes}</Text>
                  </View>
                )}
              </View>
              
              {item.status === 'pending' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    Alert.alert(
                      'Cancel Booking',
                      'Are you sure you want to cancel this booking request?',
                      [
                        { text: 'No', style: 'cancel' },
                        { text: 'Yes', onPress: () => handleCancelBooking(item) }
                      ]
                    );
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel Request</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
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
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
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
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
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
    marginBottom: 5,
  },
  detailLabel: {
    width: 100,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontWeight: '500',
  },
  notesContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  notesLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notesText: {
    color: '#555',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});