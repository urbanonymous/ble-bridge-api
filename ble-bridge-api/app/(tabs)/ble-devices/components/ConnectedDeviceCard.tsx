import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { BLEDeviceInfo } from '@/services/BLEService';
import { CharacteristicsList } from './CharacteristicsList';
import { styles, connectedDeviceStyles } from '../styles';

interface ConnectedDeviceCardProps {
  device: BLEDeviceInfo;
  characteristics: any[];
  onDisconnect: () => void;
}

export const ConnectedDeviceCard: React.FC<ConnectedDeviceCardProps> = ({
  device,
  characteristics,
  onDisconnect
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>🔗 Connected Device</ThemedText>
      </View>
      <View style={styles.cardContent}>
        <View style={connectedDeviceStyles.connectedDeviceInfo}>
          <View style={connectedDeviceStyles.connectedDeviceHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText style={connectedDeviceStyles.connectedDeviceName}>
                📱 {device.name || 'Unknown Device'}
              </ThemedText>
              <ThemedText style={connectedDeviceStyles.connectedDeviceId}>
                {device.id}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={connectedDeviceStyles.disconnectButton}
              onPress={onDisconnect}
              activeOpacity={0.8}
            >
              <ThemedText style={connectedDeviceStyles.disconnectButtonText}>
                Disconnect
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <CharacteristicsList characteristics={characteristics} />
      </View>
    </View>
  );
};
