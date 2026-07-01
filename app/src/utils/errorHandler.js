/**
 * Standardized error handling utilities
 */

import { Alert } from 'react-native';
import { captureException } from './errorReporting';

// Standard error handler for async operations
export async function handleAsyncError(operation, errorMessage, options = {}) {
  const { showAlert = true, rethrow = false } = options;
  
  try {
    return await operation();
  } catch (error) {
    captureException(error, { message: errorMessage });
    
    if (showAlert) {
      Alert.alert('Error', errorMessage);
    }
    
    if (rethrow) {
      throw error;
    }
    
    return null;
  }
}

/**
 * Retry an async operation with exponential backoff.
 * Optimal for transient failures (network, timing issues).
 * 
 * @param {Function} operation - Async function to retry
 * @param {Object} options - Configuration
 * @param {number} options.maxAttempts - Max retry attempts (default: 3)
 * @param {number} options.baseDelayMs - Initial delay in ms (default: 200)
 * @param {string} options.context - Context for error reporting
 * @param {boolean} options.silent - If true, don't capture to Sentry on intermediate failures
 * @returns {Promise<{success: boolean, result?: any, error?: Error}>}
 */
export async function withRetry(operation, options = {}) {
  const {
    maxAttempts = 3,
    baseDelayMs = 200,
    context = 'withRetry',
    silent = false,
  } = options;
  
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();
      return { success: true, result };
    } catch (error) {
      lastError = error;
      
      // Only log intermediate failures in dev, or final failure to Sentry
      if (attempt === maxAttempts) {
        captureException(error, { context, attempt, maxAttempts });
      } else if (__DEV__ && !silent) {
        console.warn(`[${context}] Attempt ${attempt}/${maxAttempts} failed:`, error.message);
      }
      
      // Don't delay after last attempt
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1); // 200, 400, 800...
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return { success: false, error: lastError };
}

// User-friendly error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Unable to connect. Please check your internet connection.',
  LOCATION: 'Unable to get your location. Please enable location services.',
  STORAGE: 'Unable to save data. Please try again.',
  PERMISSION: 'Permission required. Please enable in Settings.',
  MONITORING: 'Unable to start prayer monitoring. App blocking may not work correctly.',
  SYNC: 'Unable to sync prayer data. Your progress is saved locally.',
  UNKNOWN: 'Something went wrong. Please try again.',
};

// Map technical errors to user-friendly messages
export function getUserFriendlyMessage(error) {
  if (!error) return ERROR_MESSAGES.UNKNOWN;
  
  const message = error.message || '';
  
  if (message.includes('network') || message.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK;
  }
  if (message.includes('location') || message.includes('position')) {
    return ERROR_MESSAGES.LOCATION;
  }
  if (message.includes('storage') || message.includes('AsyncStorage')) {
    return ERROR_MESSAGES.STORAGE;
  }
  if (message.includes('permission') || message.includes('denied')) {
    return ERROR_MESSAGES.PERMISSION;
  }
  
  return ERROR_MESSAGES.UNKNOWN;
}

