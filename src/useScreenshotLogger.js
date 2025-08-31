const { useEffect } = require('react');
const { Platform } = require('react-native');
const { useDevToolsPluginClient } = require('expo/devtools');

/**
 * Screenshot Logger Hook - Call once in your App component
 * Following Expo Apollo Client pattern
 */
function useScreenshotLogger() {
  const client = useDevToolsPluginClient('expo-screenshot-logger');
  
  useEffect(() => {
    if (client) {
      // Set up the global capture function
      const { setCaptureFunction } = require('./index');
      setCaptureFunction(createCaptureFunction(client));
    }
  }, [client]);
  
  // Return nothing - this hook just sets up global functionality
}

/**
 * Create the global capture function that components can call
 */
function createCaptureFunction(client) {
  return async (label = 'Screenshot', options = {}) => {
    if (!__DEV__) {
      return null;
    }

    if (!client) {
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

      // Dynamic import to avoid bundling issues
      const { captureScreen } = require('react-native-view-shot');
      
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
      console.error('[Screenshot Logger] Failed to capture screenshot:', error.message);
      return null;
    }
  };
}

module.exports = { useScreenshotLogger };
exports.useScreenshotLogger = useScreenshotLogger;