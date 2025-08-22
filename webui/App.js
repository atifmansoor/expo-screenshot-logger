import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Modal, Pressable } from 'react-native';
import { useDevToolsPluginClient } from 'expo/devtools';

export default function App() {
  const [screenshots, setScreenshots] = useState([]);
  const [copiedStates, setCopiedStates] = useState({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({});
  const client = useDevToolsPluginClient('expo-screenshot-logger');

  useEffect(() => {
    if (!client) {
      return;
    }

    const subscription = client.addMessageListener('screenshot-captured', (data) => {
      setScreenshots(prev => [data, ...prev]);
    });

    return () => {
      subscription?.remove();
    };
  }, [client]);


  const copyToClipboard = async (uri, buttonId) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(uri);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = uri;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopiedStates(prev => ({ ...prev, [buttonId]: true }));
      
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [buttonId]: false }));
      }, 2000);
      
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const clearAllScreenshots = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    setScreenshots([]);
    setShowClearConfirm(false);
  };

  const cancelClearAll = () => {
    setShowClearConfirm(false);
  };

  const enlargeImage = (screenshot) => {
    setEnlargedImage(screenshot);
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };

  const handleImageLoad = (screenshot, index) => {
    const key = `${screenshot.timestamp}-${index}`;
    
    if (imageDimensions[key]) {
      return;
    }
    
    if (typeof Image !== 'undefined' && typeof document !== 'undefined') {
      const img = new window.Image();
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        
        setImageDimensions(prev => ({
          ...prev,
          [key]: {
            aspectRatio,
            isPortrait: aspectRatio < 0.8,
            isLandscape: aspectRatio > 1.3,
            isSquare: aspectRatio >= 0.8 && aspectRatio <= 1.3
          }
        }));
      };
      img.src = screenshot.uri;
    }
  };

  const getCardStyle = (screenshot, index) => {
    const key = `${screenshot.timestamp}-${index}`;
    const dimensions = imageDimensions[key];
    
    if (!dimensions) {
      return styles.screenshotCard;
    }
    
    if (dimensions.isPortrait) {
      return [styles.screenshotCard, styles.portraitCard];
    } else if (dimensions.isLandscape) {
      return [styles.screenshotCard, styles.landscapeCard];
    } else {
      return [styles.screenshotCard, styles.squareCard];
    }
  };

  const getImageStyle = (screenshot, index) => {
    const key = `${screenshot.timestamp}-${index}`;
    const dimensions = imageDimensions[key];
    
    if (!dimensions) return styles.screenshotImage;
    
    if (dimensions.isPortrait) {
      return [styles.screenshotImage, styles.portraitImage];
    } else if (dimensions.isLandscape) {
      return [styles.screenshotImage, styles.landscapeImage];
    } else {
      return [styles.screenshotImage, styles.squareImage];
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Screenshot Logger</Text>
        <Text style={styles.headerSubtitle}>
          Expo Dev Tools Plugin for Screenshot Debugging
        </Text>
      </View>

      <View style={styles.controls}>
        <Text style={styles.statusText}>
          {screenshots.length} screenshot{screenshots.length !== 1 ? 's' : ''} captured
        </Text>
        <View style={styles.buttonGroup}>
          {screenshots.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearAllScreenshots}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {screenshots.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No screenshots captured yet.{'\n\n'}
            Use captureAndSend() in your app to capture screenshots.{'\n\n'}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.screenshotGrid}>
            {screenshots.map((screenshot, index) => (
              <View key={`${screenshot.timestamp}-${index}`} style={getCardStyle(screenshot, index)}>
                <TouchableOpacity onPress={() => enlargeImage(screenshot)}>
                  <Image
                    source={{ uri: screenshot.uri }}
                    style={getImageStyle(screenshot, index)}
                    resizeMode="contain"
                    onLoad={() => handleImageLoad(screenshot, index)}
                  />
                </TouchableOpacity>
                <View style={styles.screenshotInfo}>
                  <Text style={styles.screenshotLabel}>{screenshot.label}</Text>
                  <Text style={styles.screenshotTime}>
                    {new Date(screenshot.timestamp).toLocaleTimeString()}
                  </Text>
                  {screenshot.format && (
                    <Text style={styles.screenshotMeta}>
                      {screenshot.format.toUpperCase()} • {Math.round((screenshot.quality || 0.8) * 100)}% • {Math.round((screenshot.size || 0) / 1024)}KB
                    </Text>
                  )}
                  <TouchableOpacity 
                    style={styles.copyButton} 
                    onPress={() => copyToClipboard(screenshot.uri, `grid-${screenshot.timestamp}-${index}`)}
                  >
                    <Text style={styles.copyButtonText}>
                      {copiedStates[`grid-${screenshot.timestamp}-${index}`] ? '✓ Copied!' : '📋 Copy Data URL'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {enlargedImage && (
        <Modal visible={true} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={closeEnlargedImage}>
            <View style={styles.enlargedContainer}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: enlargedImage.uri }}
                  style={styles.enlargedImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.enlargedControls}>
                <TouchableOpacity
                  style={styles.enlargedCopyButton}
                  onPress={() => copyToClipboard(enlargedImage.uri, 'enlarged')}
                >
                  <Text style={styles.enlargedButtonText}>
                    {copiedStates['enlarged'] ? '✓ Copied!' : '📋 Copy Data URL'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.enlargedCloseButton}
                  onPress={closeEnlargedImage}
                >
                  <Text style={styles.enlargedButtonText}>✕ Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}

      {showClearConfirm && (
        <Modal visible={true} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={cancelClearAll}>
            <View style={styles.confirmModal}>
              <Text style={styles.confirmTitle}>Clear All Screenshots?</Text>
              <Text style={styles.confirmMessage}>
                This action cannot be undone. All captured screenshots will be permanently removed.
              </Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={cancelClearAll}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={confirmClearAll}>
                  <Text style={styles.confirmButtonText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  clearButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  screenshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 16,
  },
  screenshotCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    width: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  portraitCard: {
    width: 250,
    minWidth: 250,
  },
  landscapeCard: {
    width: 450,
    minWidth: 450,
  },
  squareCard: {
    width: 320,
    minWidth: 320,
  },
  screenshotImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  portraitImage: {
    height: 240,
  },
  landscapeImage: {
    height: 120,
  },
  squareImage: {
    height: 180,
  },
  screenshotInfo: {
    marginTop: 8,
  },
  screenshotLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  screenshotTime: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  screenshotMeta: {
    fontSize: 10,
    color: '#999',
    marginBottom: 8,
  },
  copyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  copyButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    width: '90vw',
    height: '80vh',
    maxWidth: 1400,
    maxHeight: 1000,
    minWidth: 600,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  enlargedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  enlargedControls: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  enlargedCopyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  enlargedCloseButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  enlargedButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  confirmModal: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    minWidth: 300,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});