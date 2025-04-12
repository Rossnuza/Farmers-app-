// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, Image, TextInput, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFarmerProfile, updateFarmerProfile } from './api';
import { addMessageHandler } from './websocket';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ route, navigation }) {
  const { user } = route.params || {};
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      if (user?.id) {
        const profileData = await getFarmerProfile(user.id);
        setProfile(profileData || user);
        setEditedProfile(profileData || user);
      } else {
        setProfile(user || {});
        setEditedProfile(user || {});
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to using the user data from props if API call fails
      setProfile(user || {});
      setEditedProfile(user || {});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    
    // Set up WebSocket listener for profile updates
    const removeProfileHandler = addMessageHandler('farmer_profile_updated', (data) => {
      if (data.id === user?.id) {
        setProfile(data);
        setEditedProfile(data);
      }
    });
    
    return () => {
      if (removeProfileHandler) removeProfileHandler();
    };
  }, [user?.id]);

  const handleInputChange = (field, value) => {
    setEditedProfile({...editedProfile, [field]: value});
  };

  const saveChanges = async () => {
    // Validate fields
    if (!editedProfile.name?.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    
    if (!editedProfile.phone?.trim()) {
      Alert.alert("Error", "Phone number cannot be empty");
      return;
    }
    
    try {
      // Save changes to API
      const updatedProfile = await updateFarmerProfile(user.id, editedProfile);
      setProfile(updatedProfile || editedProfile);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const cancelEditing = () => {
    setEditedProfile({...profile});
    setIsEditing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              // Clear stored user data
              await AsyncStorage.removeItem('userData');
              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{uri: profile?.avatar || "https://via.placeholder.com/150x150.png?text=User"}} 
          style={styles.avatar}
        />
        
        {!isEditing ? (
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile?.name || 'Unnamed Farmer'}</Text>
            <Text style={styles.region}>{profile?.region || 'No region specified'}</Text>
            <Text style={styles.joinDate}>Member since {formatDate(profile?.joinDate)}</Text>
          </View>
        ) : (
          <View style={styles.editButtons}>
            <TouchableOpacity 
              style={[styles.editButton, styles.saveButton]} 
              onPress={saveChanges}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.editButtonText}>Save</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.editButton, styles.cancelButton]} 
              onPress={cancelEditing}
            >
              <Ionicons name="close" size={20} color="white" />
              <Text style={styles.editButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!isEditing && (
          <TouchableOpacity 
            style={styles.editIcon}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create" size={24} color="#4CAF50" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Full Name<Text style={styles.required}>*</Text></Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile?.name || ''}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Your full name"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.name || 'Not specified'}</Text>
          )}
        </View>
        
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Region</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile?.region || ''}
              onChangeText={(text) => handleInputChange('region', text)}
              placeholder="Your region"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.region || 'Not specified'}</Text>
          )}
        </View>
        
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Contact Person</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile?.contactPerson || ''}
              onChangeText={(text) => handleInputChange('contactPerson', text)}
              placeholder="Primary contact person"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.contactPerson || 'Not specified'}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Phone Number<Text style={styles.required}>*</Text></Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile?.phone || ''}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder="Your phone number"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.phone || 'Not specified'}</Text>
          )}
        </View>
        
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile?.email || ''}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Your email address"
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.email || 'Not specified'}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.switchFieldGroup}>
          <View style={styles.switchLabel}>
            <Text style={styles.fieldLabel}>Marketplace Participation</Text>
            <Text style={styles.fieldDescription}>Allow your products to be sold on marketplace</Text>
          </View>
          
          <Switch
            value={isEditing ? editedProfile?.marketplaceOptIn : profile?.marketplaceOptIn}
            onValueChange={(value) => isEditing && handleInputChange('marketplaceOptIn', value)}
            trackColor={{ false: "#ddd", true: "#4CAF50" }}
            thumbColor={"#fff"}
            disabled={!isEditing}
          />
        </View>
        
        <View style={styles.switchFieldGroup}>
          <View style={styles.switchLabel}>
            <Text style={styles.fieldLabel}>Storage Agreement</Text>
            <Text style={styles.fieldDescription}>Agree to Coldfarms storage terms and conditions</Text>
          </View>
          
          <Switch
            value={isEditing ? editedProfile?.storageAgreement : profile?.storageAgreement}
            onValueChange={(value) => isEditing && handleInputChange('storageAgreement', value)}
            trackColor={{ false: "#ddd", true: "#4CAF50" }}
            thumbColor={"#fff"}
            disabled={!isEditing}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        
        {isEditing ? (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editedProfile?.notes || ''}
            onChangeText={(text) => handleInputChange('notes', text)}
            placeholder="Add notes about your farm"
            multiline
            numberOfLines={4}
          />
        ) : (
          <Text style={styles.notesText}>{profile?.notes || "No notes added"}</Text>
        )}
      </View>
      
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  region: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  joinDate: {
    fontSize: 14,
    color: '#666',
  },
  editIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  editButtons: {
    marginLeft: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    marginTop: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#4CAF50',
  },
  fieldGroup: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  required: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchFieldGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    flex: 1,
  },
  fieldDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  buttons: {
    margin: 15,
    marginTop: 0,
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#757575',
    borderRadius: 5,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});