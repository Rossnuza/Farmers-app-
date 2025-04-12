// screens/websocket.js
import AsyncStorage from '@react-native-async-storage/async-storage';

let ws = null;
let reconnectTimer = null;
let messageHandlers = {};
let isConnecting = false;

// Get your Replit URL - make sure this matches your actual server
const BASE_WS_URL = 'wss://cold-farm-dashboard-rosnuza.replit.app/ws';

// Add message handlers for different event types
export function addMessageHandler(type, handler) {
  if (!messageHandlers[type]) {
    messageHandlers[type] = [];
  }
  messageHandlers[type].push(handler);
  return () => removeMessageHandler(type, handler); // Return function to unsubscribe
}

export function removeMessageHandler(type, handler) {
  if (!messageHandlers[type]) return;
  messageHandlers[type] = messageHandlers[type].filter(h => h !== handler);
}

// Connect WebSocket with retry logic
export async function connectWebSocket(farmerId) {
  // Prevent multiple connection attempts
  if (isConnecting) return;
  isConnecting = true;
  
  try {
    // Close existing connection if any
    await disconnectWebSocket();
    
    console.log(`Connecting to WebSocket: ${BASE_WS_URL}`);
    ws = new WebSocket(BASE_WS_URL);
    
    ws.onopen = () => {
      console.log('WebSocket connected successfully');
      isConnecting = false;
      
      // Send authentication message
      if (farmerId) {
        sendMessage({
          type: 'auth',
          farmerId: farmerId
        });
        console.log(`Authenticated as farmer ${farmerId}`);
      }
      
      // Clear reconnection timer if it exists
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('🔵 WebSocket message received:', JSON.stringify(message));
        
        // Call appropriate handlers based on message type
        if (messageHandlers[message.type]) {
          messageHandlers[message.type].forEach(handler => {
            try {
              handler(message.data);
            } catch (handlerError) {
              console.error('Error in message handler:', handlerError);
            }
          });
        }
        
        // Handle specific farmer-related events
        switch(message.type) {
          case 'booking_request_created':
          case 'booking_request_updated':
            console.log('📨 Booking request update:', message.data);
            break;
          case 'farmer_inventory_created':
          case 'farmer_inventory_updated':
          case 'farmer_inventory_removed':
            console.log('📦 Inventory update:', message.data);
            break;
        }
        
        // Also call general message handlers
        if (messageHandlers['*']) {
          messageHandlers['*'].forEach(handler => {
            try {
              handler(message);
            } catch (handlerError) {
              console.error('Error in general message handler:', handlerError);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = (event) => {
      console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
      ws = null;
      isConnecting = false;
      
      // Reconnect after delay (5 seconds)
      reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        connectWebSocket(farmerId);
      }, 5000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnecting = false;
    };
  } catch (error) {
    console.error('Error establishing WebSocket connection:', error);
    isConnecting = false;
    
    // Retry connection after delay
    reconnectTimer = setTimeout(() => {
      connectWebSocket(farmerId);
    }, 5000);
  }
}

// Disconnect WebSocket
export async function disconnectWebSocket() {
  // Clear reconnection timer
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  // Close connection if it exists
  if (ws) {
    try {
      ws.close();
    } catch (error) {
      console.error('Error closing WebSocket:', error);
    }
    ws = null;
  }
}

// Send a message through WebSocket
export function sendMessage(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  } else {
    console.warn('WebSocket not connected. Message not sent:', message);
    return false;
  }
}

// Check if WebSocket is connected
export function isWebSocketConnected() {
  return ws && ws.readyState === WebSocket.OPEN;
}