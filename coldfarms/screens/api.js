// api.js - Complete file for Coldfarms farmer mobile app

const API_URL = "https://cold-farm-dashboard-rosnuza.replit.app/api";

// Helper function for API requests
async function apiRequest(endpoint, method = 'GET', data = null) {
  const url = `${API_URL}${endpoint}`;
  
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }
    
    return result;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Send verification code to phone number
export const sendVerificationCode = async (phone) => {
  try {
    // Format phone number: remove "+", spaces, and ensure country code
    let formattedPhone = phone.replace(/\+/g, '').replace(/\s/g, '');
    
    // If the phone doesn't start with the country code, the UI already separated it
    if (!formattedPhone.startsWith('237') && formattedPhone.length === 9) {
      formattedPhone = '237' + formattedPhone;
    }
    
    console.log('Sending verification code to:', formattedPhone);
    
    return apiRequest('/mobile/farmer-send-code', 'POST', { 
      phone: formattedPhone 
    });
  } catch (error) {
    console.error('Send verification code error:', error);
    throw error;
  }
};

// Authentication with phone number formatting fix
export const loginWithPhone = async (phone, code) => {
  try {
    // Format phone number: remove "+", spaces, and ensure country code
    let formattedPhone = phone.replace(/\+/g, '').replace(/\s/g, '');
    
    // If the phone doesn't start with the country code, the UI already separated it
    if (!formattedPhone.startsWith('237') && formattedPhone.length === 9) {
      formattedPhone = '237' + formattedPhone;
    }
    
    console.log('Sending formatted phone:', formattedPhone);
    
    return apiRequest('/mobile/farmer-login', 'POST', { 
      phone: formattedPhone, 
      code 
    });
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerFarmer = async (farmerData) => {
  try {
    // Format phone number if present
    if (farmerData.phone) {
      let formattedPhone = farmerData.phone.replace(/\+/g, '').replace(/\s/g, '');
      
      if (!formattedPhone.startsWith('237') && formattedPhone.length === 9) {
        formattedPhone = '237' + formattedPhone;
      }
      
      farmerData.phone = formattedPhone;
    }
    
    return apiRequest('/mobile/farmer-register', 'POST', farmerData);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Farmer inventory
export const getFarmerInventory = async (farmerId) => {
  return apiRequest(`/farmers/${farmerId}/inventory`);
};

// Book storage
export const bookStorage = async (farmerId, data) => {
  return apiRequest(`/farmers/${farmerId}/inventory`, 'POST', data);
};

// Toggle marketplace listing
export const toggleMarketplaceListing = async (farmerId, inventoryItemId, isListed) => {
  return apiRequest(`/farmers/${farmerId}/inventory/${inventoryItemId}`, 'PATCH', { 
    listedOnMarketplace: isListed 
  });
};

// Farmer profile
export const getFarmerProfile = async (farmerId) => {
  return apiRequest(`/farmers/${farmerId}`);
};

// Update farmer profile
export const updateFarmerProfile = async (farmerId, data) => {
  return apiRequest(`/farmers/${farmerId}`, 'PUT', data);
};

// Get storage units
export const getStorageUnits = async () => {
  return apiRequest('/storage-units');
};

// Get marketplace listings
export const getMarketplaceListings = async (farmerId) => {
  return apiRequest(`/farmers/${farmerId}/marketplace`);
};

// Get financial transactions
export const getFinancialTransactions = async (farmerId) => {
  return apiRequest(`/farmers/${farmerId}/finances`);
};

export default {
  sendVerificationCode,
  loginWithPhone,
  registerFarmer,
  getFarmerInventory,
  bookStorage,
  toggleMarketplaceListing,
  getFarmerProfile,
  updateFarmerProfile,
  getStorageUnits,
  getMarketplaceListings,
  getFinancialTransactions
};