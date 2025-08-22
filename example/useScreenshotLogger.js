import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

export function useScreenshotLogger() {
  // Dynamic imports for peer dependencies
  let useDevToolsPluginClient, captureScreen, Constants;
  
  try {
    ({ useDevToolsPluginClient } = require('expo/devtools'));
    ({ captureScreen } = require('react-native-view-shot'));
    Constants = require('expo-constants').default;
  } catch (error) {
    console.warn('[Screenshot Logger] Peer dependencies not available:', error.message);
    return {
      captureAndSend: () => null,
      isConnected: false,
      platform: Platform.OS
    };
  }

  const client = useDevToolsPluginClient('expo-screenshot-logger');

  useEffect(() => {
    if (__DEV__ && client) {
      console.log('[Screenshot Logger] Plugin connected');
    }
  }, [client]);

  const captureAndSend = useCallback(async (label, options = {}) => {
    if (!__DEV__) {
      console.warn('[Screenshot Logger] Not in development mode');
      return null;
    }

    if (!client) {
      console.warn('[Screenshot Logger] Plugin client not available - make sure the webui is open');
      return null;
    }

    try {
      const { format = 'jpg', quality = 0.8 } = options;
      const uri = await captureScreen({
        format,
        quality,
        result: 'data-uri',
      });

      const screenshotData = {
        uri,
        timestamp: Date.now(),
        label: label || 'Screenshot',
        format,
        quality,
        size: uri.length,
      };

      client.sendMessage('screenshot-captured', screenshotData);
      console.log(`[Screenshot Logger] ✅ Screenshot captured: "${label}"`);
      return uri;
    } catch (error) {
      console.error('[Screenshot Logger] ❌ Failed to capture screenshot:', error);
      
      if (error.message.includes('react-native-view-shot')) {
        console.error('[Screenshot Logger] Make sure react-native-view-shot is installed: npm install react-native-view-shot');
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