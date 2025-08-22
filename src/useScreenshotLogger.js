import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

/**
 * Screenshot logger hook for Expo dev tools integration
 * 
 * @returns {Object} Screenshot logger utilities
 * @returns {Function} captureAndSend - Function to capture and send screenshots
 * @returns {boolean} isConnected - Whether the dev tools client is connected
 * @returns {string} platform - Current platform (ios/android/web)
 */
export function useScreenshotLogger() {
  let useDevToolsPluginClient, captureScreen;
  
  try {
    ({ useDevToolsPluginClient } = require('expo/devtools'));
    ({ captureScreen } = require('react-native-view-shot'));
  } catch (error) {
    if (__DEV__) {
      console.warn('[Screenshot Logger] Required dependencies not available. Please install: expo react-native-view-shot');
    }
    return {
      captureAndSend: () => {
        if (__DEV__) {
          console.warn('[Screenshot Logger] Dependencies not available');
        }
        return Promise.resolve(null);
      },
      isConnected: false,
      platform: Platform.OS
    };
  }

  const client = useDevToolsPluginClient('expo-screenshot-logger');

  useEffect(() => {
    // Dev tools client connection established
  }, [client]);

  /**
   * Capture a screenshot and send it to the dev tools interface
   * 
   * @param {string} label - Label for the screenshot
   * @param {Object} options - Screenshot options
   * @param {string} options.format - Image format ('jpg' or 'png')
   * @param {number} options.quality - Image quality (0-1)
   * @returns {Promise<string|null>} Screenshot data URI or null if failed
   */
  const captureAndSend = useCallback(async (label = 'Screenshot', options = {}) => {
    if (!__DEV__) {
      return null;
    }

    if (!client) {
      if (__DEV__) {
        console.warn('[Screenshot Logger] Dev tools not connected. Open dev tools and select Screenshot Logger plugin.');
      }
      return null;
    }

    try {
      const { format = 'jpg', quality = 0.8 } = options;
      
      // Validate options
      if (!['jpg', 'png'].includes(format)) {
        throw new Error(`Invalid format: ${format}. Use 'jpg' or 'png'.`);
      }
      
      if (quality < 0 || quality > 1) {
        throw new Error(`Invalid quality: ${quality}. Must be between 0 and 1.`);
      }

      const uri = await captureScreen({
        format,
        quality,
        result: 'data-uri',
      });

      const screenshotData = {
        uri,
        timestamp: Date.now(),
        label: String(label),
        format,
        quality,
        size: uri.length,
      };

      client.sendMessage('screenshot-captured', screenshotData);
      
      return uri;
    } catch (error) {
      if (__DEV__) {
        console.error('[Screenshot Logger] Failed to capture screenshot:', error.message);
      }
      return null;
    }
  }, [client]);

  return {
    captureAndSend,
    isConnected: !!client,
    platform: Platform.OS,
  };
}