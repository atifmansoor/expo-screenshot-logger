import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useScreenshotLogger } from 'expo-screenshot-logger';

function AppContent() {
  // Initialize screenshot logger
  useScreenshotLogger();

  const handleScreenshot = async () => {
    // Import the module dynamically to get the updated function reference
    const { captureScreenshot } = await import('expo-screenshot-logger');
    await captureScreenshot('Example Screenshot');
  };

  const testMultipleFormats = async () => {
    // Import the module dynamically to get the updated function reference
    const { captureScreenshot } = await import('expo-screenshot-logger');
    
    await captureScreenshot('High Quality PNG', { format: 'png', quality: 1.0 });
    
    setTimeout(async () => {
      await captureScreenshot('Standard JPG', { format: 'jpg', quality: 0.8 });
    }, 1000);
    
    setTimeout(async () => {
      await captureScreenshot('Compressed JPG', { format: 'jpg', quality: 0.3 });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screenshot Logger Demo</Text>
      <Text style={styles.subtitle}>
        Capture screenshots and view them in Expo dev tools
      </Text>
      
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
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
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
