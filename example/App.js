import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useScreenshotLogger } from './useScreenshotLogger';

function AppContent() {
  const { captureAndSend, isConnected, platform } = useScreenshotLogger();

  const handleScreenshot = async () => {
    await captureAndSend('Example Screenshot');
  };

  const testMultipleFormats = async () => {
    await captureAndSend('High Quality PNG', { format: 'png', quality: 1.0 });
    
    setTimeout(async () => {
      await captureAndSend('Standard JPG', { format: 'jpg', quality: 0.8 });
    }, 1000);
    
    setTimeout(async () => {
      await captureAndSend('Compressed JPG', { format: 'jpg', quality: 0.3 });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screenshot Logger Demo</Text>
      <Text style={styles.status}>
        Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}
      </Text>
      <Text style={styles.platform}>Platform: {platform}</Text>
      
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={handleScreenshot}>
          <Text style={styles.buttonText}>📸 Capture Screenshot</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testMultipleFormats}
        >
          <Text style={styles.buttonText}>📸 Test Formats</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.instructions}>
        1. Open dev tools (shift+m){'\n'}
        2. Select "Screenshot Logger"{'\n'}
        3. Capture screenshots using buttons above{'\n'}
        4. View and copy screenshots in the web interface
      </Text>
      
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
      <AppContent />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  platform: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 20,
  },
});
