import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, ScrollView, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useBridge } from '@/contexts/BridgeContext';

export default function WebSocketScreen() {
  const [websocketUrl, setWebsocketUrl] = useState('ws://localhost:8080');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });
  const slideAnim = useState(new Animated.Value(100))[0];

  const {
    bridgeStatus,
    isConnected,
    isFullyConnected,
    connectWebSocket,
    disconnectWebSocket,
    addLog
  } = useBridge();

  // Notification functions
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, visible: true });
    
    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    // Auto hide after 3 seconds
    setTimeout(() => {
      hideNotification();
    }, 3000);
  };

  const hideNotification = () => {
    Animated.spring(slideAnim, {
      toValue: 100,
      useNativeDriver: true,
    }).start(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    });
  };

  const handleConnect = async () => {
    try {
      console.log('🔍 handleConnect called with websocketUrl:', websocketUrl);
      await connectWebSocket(websocketUrl);
      showNotification('Connected to WebSocket API and Bridge Service', 'success');
    } catch (error) {
      showNotification(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWebSocket();
      showNotification('Disconnected from WebSocket API', 'info');
    } catch (error) {
      showNotification(`Failed to disconnect: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#9E9E9E';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Notification Card */}
      {notification.visible && (
        <Animated.View 
          style={[
            styles.notificationCard,
            notification.type === 'success' && styles.notificationSuccess,
            notification.type === 'error' && styles.notificationError,
            notification.type === 'info' && styles.notificationInfo,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.notificationContent}>
            <ThemedText style={styles.notificationIcon}>
              {notification.type === 'success' ? '✅' : 
               notification.type === 'error' ? '❌' : 'ℹ️'}
            </ThemedText>
            <ThemedText style={styles.notificationText}>
              {notification.message}
            </ThemedText>
            <TouchableOpacity onPress={hideNotification} style={styles.notificationClose}>
              <ThemedText style={styles.notificationCloseText}>✕</ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.title}>WebSocket API</ThemedText>
          </View>
        </View>

        <View style={styles.content}>
          {/* API Configuration Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.cardTitle}>⚙️ API Configuration</ThemedText>
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={styles.inputLabel}>WebSocket URL</ThemedText>
              <TextInput
                style={[styles.input, !isConnected ? styles.inputActive : styles.inputDisabled]}
                value={websocketUrl}
                onChangeText={setWebsocketUrl}
                placeholder="ws://localhost:8080"
                placeholderTextColor="#94a3b8"
                editable={!isConnected}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isConnected ? styles.disconnectButton : styles.connectButton
                ]}
                onPress={isConnected ? handleDisconnect : handleConnect}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.primaryButtonText}>
                  {isConnected ? '🔌 Disconnect' : '🚀 Connect to API'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Connection Status Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.cardTitle}>🔗 Connection Status</ThemedText>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.statusGrid}>
                <View style={styles.statusItem}>
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(bridgeStatus.websocket) }]} />
                  <View style={styles.statusInfo}>
                    <ThemedText style={styles.statusLabel}>WebSocket</ThemedText>
                    <ThemedText style={styles.statusValue}>{bridgeStatus.websocket}</ThemedText>
                  </View>
                </View>
                <View style={styles.statusItem}>
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(bridgeStatus.ble) }]} />
                  <View style={styles.statusInfo}>
                    <ThemedText style={styles.statusLabel}>BLE Device</ThemedText>
                    <ThemedText style={styles.statusValue}>{bridgeStatus.ble}</ThemedText>
                  </View>
                </View>
                <View style={styles.statusItem}>
                  <View style={[styles.statusIndicator, { backgroundColor: bridgeStatus.bridgeActive ? '#4CAF50' : '#9E9E9E' }]} />
                  <View style={styles.statusInfo}>
                    <ThemedText style={styles.statusLabel}>Bridge</ThemedText>
                    <ThemedText style={styles.statusValue}>{bridgeStatus.bridgeActive ? 'Active' : 'Inactive'}</ThemedText>
                  </View>
                </View>
                <View style={styles.statusItem}>
                  <View style={[styles.statusIndicator, { backgroundColor: isFullyConnected ? '#4CAF50' : '#9E9E9E' }]} />
                  <View style={styles.statusInfo}>
                    <ThemedText style={styles.statusLabel}>Full Bridge</ThemedText>
                    <ThemedText style={styles.statusValue}>{isFullyConnected ? 'Connected' : 'Inactive'}</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#6366f1',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statusGrid: {
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  inputActive: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#3b82f6',
    color: '#1e293b',
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#64748b',
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  connectButton: {
    backgroundColor: '#10b981',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoIconText: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
    paddingTop: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  // Notification styles
  notificationCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  notificationSuccess: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  notificationError: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  notificationInfo: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  notificationIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  notificationClose: {
    padding: 4,
    marginLeft: 8,
  },
  notificationCloseText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
});
