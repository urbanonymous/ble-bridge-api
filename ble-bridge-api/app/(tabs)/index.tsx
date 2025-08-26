import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useBridge } from '@/contexts/BridgeContext';

export default function WebSocketScreen() {
  const [websocketUrl, setWebsocketUrl] = useState('ws://localhost:8080');
  const { 
    bridgeStatus, 
    isConnected, 
    isFullyConnected,
    connectWebSocket, 
    disconnectWebSocket,
    addLog 
  } = useBridge();

  const handleConnect = async () => {
    try {
      await connectWebSocket(websocketUrl);
      Alert.alert('Success', 'Connected to WebSocket API and Bridge Service');
    } catch (error) {
      Alert.alert('Error', `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWebSocket();
      Alert.alert('Info', 'Disconnected from WebSocket API');
    } catch (error) {
      Alert.alert('Error', `Failed to disconnect: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      <ScrollView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">WebSocket Connection</ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">API Endpoint</ThemedText>
            <TextInput
              style={styles.input}
              value={websocketUrl}
              onChangeText={setWebsocketUrl}
              placeholder="Enter WebSocket URL"
              placeholderTextColor="#999"
              editable={!isConnected}
            />
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Connection Status</ThemedText>
            <ThemedView style={styles.statusContainer}>
              <ThemedView style={[styles.statusDot, { backgroundColor: getStatusColor(bridgeStatus.websocket) }]} />
              <ThemedText style={styles.statusText}>
                WebSocket: {bridgeStatus.websocket}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.statusContainer}>
              <ThemedView style={[styles.statusDot, { backgroundColor: getStatusColor(bridgeStatus.ble) }]} />
              <ThemedText style={styles.statusText}>
                BLE: {bridgeStatus.ble}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.statusContainer}>
              <ThemedView style={[styles.statusDot, { backgroundColor: bridgeStatus.bridgeActive ? '#4CAF50' : '#9E9E9E' }]} />
              <ThemedText style={styles.statusText}>
                Bridge: {bridgeStatus.bridgeActive ? 'Active' : 'Inactive'}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.statusContainer}>
              <ThemedView style={[styles.statusDot, { backgroundColor: isFullyConnected ? '#4CAF50' : '#9E9E9E' }]} />
              <ThemedText style={styles.statusText}>
                Full Bridge: {isFullyConnected ? 'Connected' : 'Inactive'}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, isConnected ? styles.buttonDisconnect : styles.buttonConnect]}
              onPress={isConnected ? handleDisconnect : handleConnect}
            >
              <ThemedText style={styles.buttonText}>
                {isConnected ? 'Disconnect' : 'Connect'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Bridge Information</ThemedText>
            <ThemedView style={styles.infoContainer}>
              <ThemedText style={styles.infoText}>
                • WebSocket connection for API communication
              </ThemedText>
              <ThemedText style={styles.infoText}>
                • Bridge automatically connects to BLE service
              </ThemedText>
              <ThemedText style={styles.infoText}>
                • View all communication logs in the "Logs" tab
              </ThemedText>
              <ThemedText style={styles.infoText}>
                • Real-time bidirectional data bridging
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    backgroundColor: 'white',
    color: 'black',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonConnect: {
    backgroundColor: '#4CAF50',
  },
  buttonDisconnect: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f0ff',
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
});
