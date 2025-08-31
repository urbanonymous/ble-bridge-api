import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { BridgeStatus } from '@/services/BridgeService';
import { styles, statusStyles } from '../styles';

interface StatusCardProps {
  bridgeStatus: BridgeStatus;
  isFullyConnected: boolean;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'connected': return '#4CAF50';
    case 'connecting': return '#FF9800';
    case 'disconnected': return '#9E9E9E';
    case 'error': return '#F44336';
    default: return '#9E9E9E';
  }
};

export const StatusCard: React.FC<StatusCardProps> = ({
  bridgeStatus,
  isFullyConnected
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>🔗 Connection Status</ThemedText>
      </View>
      <View style={styles.cardContent}>
        <View style={statusStyles.statusGrid}>
          <View style={statusStyles.statusItem}>
            <View style={[statusStyles.statusIndicator, { backgroundColor: getStatusColor(bridgeStatus.websocket) }]} />
            <View style={statusStyles.statusInfo}>
              <ThemedText style={statusStyles.statusLabel}>WebSocket</ThemedText>
              <ThemedText style={statusStyles.statusValue}>{bridgeStatus.websocket}</ThemedText>
            </View>
          </View>
          <View style={statusStyles.statusItem}>
            <View style={[statusStyles.statusIndicator, { backgroundColor: getStatusColor(bridgeStatus.ble) }]} />
            <View style={statusStyles.statusInfo}>
              <ThemedText style={statusStyles.statusLabel}>BLE Device</ThemedText>
              <ThemedText style={statusStyles.statusValue}>{bridgeStatus.ble}</ThemedText>
            </View>
          </View>
          <View style={statusStyles.statusItem}>
            <View style={[statusStyles.statusIndicator, { backgroundColor: bridgeStatus.bridgeActive ? '#4CAF50' : '#9E9E9E' }]} />
            <View style={statusStyles.statusInfo}>
              <ThemedText style={statusStyles.statusLabel}>Bridge</ThemedText>
              <ThemedText style={statusStyles.statusValue}>{bridgeStatus.bridgeActive ? 'Active' : 'Inactive'}</ThemedText>
            </View>
          </View>
          <View style={statusStyles.statusItem}>
            <View style={[statusStyles.statusIndicator, { backgroundColor: isFullyConnected ? '#4CAF50' : '#9E9E9E' }]} />
            <View style={statusStyles.statusInfo}>
              <ThemedText style={statusStyles.statusLabel}>Full Bridge</ThemedText>
              <ThemedText style={statusStyles.statusValue}>{isFullyConnected ? 'Connected' : 'Inactive'}</ThemedText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
