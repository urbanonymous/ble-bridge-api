import React from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { BLEDeviceInfo, BLEStatus } from '@/services/BLEService';
import { DeviceListItem } from './DeviceListItem';
import { styles, scanStyles } from '../styles';
import { canStartScan } from '../utils/bleStatusUtils';

interface DeviceDiscoveryCardProps {
  status: BLEStatus;
  devices: BLEDeviceInfo[];
  isScanning: boolean;
  connectedDevice: BLEDeviceInfo | null;
  onStartScan: () => void;
  onStopScan: () => void;
  onConnectDevice: (deviceId: string) => void;
}

export const DeviceDiscoveryCard: React.FC<DeviceDiscoveryCardProps> = ({
  status,
  devices,
  isScanning,
  connectedDevice,
  onStartScan,
  onStopScan,
  onConnectDevice
}) => {
  const canScan = canStartScan(status) && !connectedDevice;

  const renderEmptyState = () => (
    <View style={scanStyles.emptyState}>
      <ThemedText style={scanStyles.emptyStateIcon}>🔍</ThemedText>
      <ThemedText style={scanStyles.emptyStateTitle}>
        {isScanning ? 'Scanning for devices...' : 'No devices found'}
      </ThemedText>
      <ThemedText style={scanStyles.emptyStateDescription}>
        {isScanning 
          ? 'Looking for BLE devices in range' 
          : canScan 
            ? 'Tap "Start Scan" to discover BLE devices'
            : 'Connect to a WebSocket first or check Bluetooth status'
        }
      </ThemedText>
    </View>
  );

  const renderDevicesList = () => (
    <View style={scanStyles.devicesList}>
      <ThemedText style={scanStyles.devicesFoundText}>
        {devices.length} device{devices.length !== 1 ? 's' : ''} found
      </ThemedText>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DeviceListItem
            device={item}
            onConnect={onConnectDevice}
            disabled={!!connectedDevice}
          />
        )}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={scanStyles.scanHeaderContent}>
          <ThemedText style={styles.cardTitle}>🔍 Device Discovery</ThemedText>
          <TouchableOpacity
            style={[
              scanStyles.scanButton,
              isScanning ? scanStyles.scanButtonStop : 
              canScan ? scanStyles.scanButtonStart : scanStyles.scanButtonDisabled
            ]}
            onPress={isScanning ? onStopScan : onStartScan}
            disabled={!canScan && !isScanning}
            activeOpacity={0.8}
          >
            <ThemedText style={scanStyles.scanButtonText}>
              {isScanning ? 'Stop' : 'Scan'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardContent}>
        {devices.length === 0 ? renderEmptyState() : renderDevicesList()}
      </View>
    </View>
  );
};
