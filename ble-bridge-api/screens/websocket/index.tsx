import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useBridge } from '@/contexts/BridgeContext';
import { DEFAULT_WS_URL } from '@/constants/config';

import { useNotifications } from './hooks/useNotifications';
import { NotificationCard } from './components/NotificationCard';
import { StatusCard } from './components/StatusCard';
import { ConfigurationCard } from './components/ConfigurationCard';
import { styles } from './styles';

export default function WebSocketScreen() {
  const [websocketUrl, setWebsocketUrl] = useState(DEFAULT_WS_URL);
  
  const {
    bridgeStatus,
    isConnected,
    isFullyConnected,
    connectWebSocket,
    disconnectWebSocket,
    addLog
  } = useBridge();

  const { notification, slideAnim, showNotification, hideNotification } = useNotifications();

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <NotificationCard
        notification={notification}
        slideAnim={slideAnim}
        onClose={hideNotification}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.title}>WebSocket API</ThemedText>
            <ThemedText style={styles.subtitle}>Connect to your backend API</ThemedText>
          </View>
        </View>

        <View style={styles.content}>

          <ConfigurationCard
            websocketUrl={websocketUrl}
            onUrlChange={setWebsocketUrl}
            isConnected={isConnected}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
          <StatusCard
            bridgeStatus={bridgeStatus}
            isFullyConnected={isFullyConnected}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
