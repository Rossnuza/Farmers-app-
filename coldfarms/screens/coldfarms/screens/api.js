// screens/api.js
// Complete file for Coldfarms farmer mobile app with new endpoints

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
    
    return apiRequest('/mobile/farmer-register', 'POST', {
      ...farmerData,
      withDemoData: false // Explicitly set to false to avoid demo data
    });
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// NEW ENDPOINTS FOR STORAGE BOOKING

// Get available storage units
export const getAvailableStorageUnits = async () => {
  return apiRequest('/mobile/farmer/storage-units');
};

// Get categories - NEW
export const getCategories = async () => {
  return apiRequest('/api/categories');
};

// Get product types - FIXED to use categoryId parameter
export const getProductTypes = async (categoryId) => {
  const url = categoryId 
    ? `/api/product-types?categoryId=${categoryId}` 
    : '/api/product-types';
  console.log("Calling product types URL:", url);
  return apiRequest(url);
};

// Create storage booking request - UPDATED to match admin panel format
export const createStorageBooking = async (farmerId, bookingData) => {
  return apiRequest('/api/booking-requests', 'POST', {
    farmerId,
    storageUnitId: bookingData.storageUnitId,
    productName: bookingData.productName,
    quantity: bookingData.quantity,
    unit: bookingData.unit || 'kg',
    startDate: bookingData.startDate,
    endDate: bookingData.endDate,
    categoryId: bookingData.categoryId,
    productTypeId: bookingData.productTypeId,
    farmerNotes: bookingData.farmerNotes || '',
    status: 'pending',
    requestDate: new Date().toISOString(),
    dailyRate: bookingData.dailyRate
  });
};

// Get farmer's booking requests
export const getFarmerBookingRequests = async (farmerId) => {
  return apiRequest(`/mobile/farmer/storage-bookings?farmerId=${farmerId}`);
};

// Get specific booking request details
export const getBookingRequestDetails = async (bookingId) => {
  return apiRequest(`/mobile/farmer/storage-bookings/${bookingId}`);
};

// Cancel booking request
export const cancelBookingRequest = async (bookingId) => {
  return apiRequest(`/mobile/farmer/storage-bookings/${bookingId}/cancel`, 'PUT');
};

// Get farmer's current inventory
export const getFarmerInventory = async (farmerId) => {
  return apiRequest(`/mobile/farmer/inventory?farmerId=${farmerId}`);
};

// Farmer inventory (legacy function - updated to use new endpoint)
export const getFarmerInventoryLegacy = async (farmerId) => {
  return apiRequest(`/farmers/${farmerId}/inventory`);
};

// Book storage (legacy function - updated to use booking request)
export const bookStorage = async (farmerId, data) => {
  // This now creates a booking request instead of directly adding inventory
  return createStorageBooking(farmerId, data);
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
  getAvailableStorageUnits,
  createStorageBooking,
  getFarmerBookingRequests,
  getBookingRequestDetails,
  cancelBookingRequest,
  getMarketplaceListings,
  getFinancialTransactions,
  getCategories,
  getProductTypes
};