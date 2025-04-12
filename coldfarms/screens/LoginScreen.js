import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { sendVerificationCode, loginWithPhone, registerFarmer } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Registration fields
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [email, setEmail] = useState('');
  
  // Store user data function
  const storeUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('@coldfarms_user_data', JSON.stringify(userData));
      console.log('User data stored successfully');
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      Alert.alert('Invalid Input', 'Please enter a valid phone number');
      return;
    }
    
    setIsLoading(true);
    try {
      // Call the API to send verification code
      await sendVerificationCode(phoneNumber);
      setIsCodeSent(true);
      Alert.alert('Success', 'Verification code sent to your phone');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phoneNumber || !verificationCode) {
      Alert.alert('Invalid Input', 'Please enter your phone number and verification code');
      return;
    }
    
    setIsLoading(true);
    try {
      // Call the API to verify the code and login
      const response = await loginWithPhone(phoneNumber, verificationCode);
      
      // Store the user data for future app sessions
      await storeUserData(response.farmer);
      
      // Navigate to the main app
      if (navigation) {
        // If using React Navigation, reset the stack to prevent going back to login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Success', 'Logged in successfully');
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Invalid phone number or code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !phoneNumber || !region) {
      Alert.alert('Invalid Input', 'Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      // Call the API to register the farmer
      const response = await registerFarmer({
        name,
        phone: phoneNumber,
        region,
        email: email || undefined, // Only send if provided
      });
      
      // Store the user data for future app sessions
      await storeUserData(response.farmer);
      
      // Navigate to the main app
      if (navigation) {
        // If using React Navigation, reset the stack to prevent going back to login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Success', 'Account created successfully');
      }
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'Could not create account');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      {!isCodeSent ? (
        <>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+237</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleSendCode}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter verification code"
            keyboardType="number-pad"
            value={verificationCode}
            onChangeText={setVerificationCode}
          />
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setIsCodeSent(false)}
            style={styles.textButton}
          >
            <Text style={styles.textButtonLabel}>Change phone number</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <View style={styles.phoneInputContainer}>
        <View style={styles.countryCode}>
          <Text style={styles.countryCodeText}>+237</Text>
        </View>
        <TextInput
          style={styles.phoneInput}
          placeholder="Phone number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Region"
        value={region}
        onChangeText={setRegion}
      />
      <TextInput
        style={styles.input}
        placeholder="Email (optional)"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Coldfarms</Text>
            <Text style={styles.subtitle}>Farmer App</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, isLoginMode ? styles.activeTab : null]} 
                onPress={() => setIsLoginMode(true)}
              >
                <Text style={[styles.tabText, isLoginMode ? styles.activeTabText : null]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, !isLoginMode ? styles.activeTab : null]} 
                onPress={() => setIsLoginMode(false)}
              >
                <Text style={[styles.tabText, !isLoginMode ? styles.activeTabText : null]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>
            
            {isLoginMode ? renderLoginForm() : renderRegisterForm()}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#37B34A', // Green color for Coldfarms
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginTop: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#37B34A',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#37B34A',
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    height: 50,
    marginBottom: 15,
  },
  countryCode: {
    width: 70,
    height: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#37B34A',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  buttonDisabled: {
    backgroundColor: '#a0d1a4',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textButton: {
    padding: 10,
    alignItems: 'center',
  },
  textButtonLabel: {
    color: '#37B34A',
    fontSize: 14,
  },
});

export default LoginScreen;