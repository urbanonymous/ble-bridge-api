import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { BLEStatus } from '@/services/BLEService';
import { useBridge } from '@/contexts/BridgeContext';

// Reuse notification hook from WebSocket
import { useNotifications } from '../websocket/hooks/useNotifications';
import { NotificationCard } from '../websocket/components/NotificationCard';

// BLE-specific hooks and components
import { useBLECharacteristics } from './hooks/useBLECharacteristics';
import { BluetoothStatusCard } from './components/BluetoothStatusCard';
import { DeviceDiscoveryCard } from './components/DeviceDiscoveryCard';
import { ConnectedDeviceCard } from './components/ConnectedDeviceCard';
import { styles } from './styles';
import { canStartScan } from './utils/bleStatusUtils';

export default function BLEScreen() {
  const {
    bridgeStatus,
    bleDevices,
    connectedBLEDevice,
    isScanning,
    startBLEScan,
    stopBLEScan,
    connectBLEDevice,
    disconnectBLEDevice,
    bridgeService
  } = useBridge();

  const status = bridgeStatus.ble as BLEStatus;
  const { notification, slideAnim, showNotification, hideNotification } = useNotifications();
  const { characteristics } = useBLECharacteristics(connectedBLEDevice, bridgeService);

  const handleStartScan = async () => {
    try {
      console.log('🔍 Current BLE status:', status);
      
      // Only block if Bluetooth is definitely off or unauthorized
      if (status === 'powered_off') {
        showNotification('Please turn on Bluetooth to scan for devices', 'error');
        return;
      }
      if (status === 'unauthorized') {
        showNotification('Bluetooth permission required. Please enable in settings.', 'error');
        return;
      }
      if (status === 'unsupported') {
        showNotification('BLE is not supported on this device', 'error');
        return;
      }
      
      // Try to scan regardless of other statuses (unknown, connecting, etc.)
      console.log('🔍 Starting BLE scan...');
      await startBLEScan();
      showNotification('Scanning for BLE devices...', 'info');
    } catch (error) {
      console.error('🔍 BLE scan error:', error);
      showNotification(`Failed to start scanning: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleStopScan = () => {
    stopBLEScan();
    showNotification('Stopped BLE scan', 'info');
  };

  const handleConnectDevice = async (deviceId: string) => {
    try {
      await connectBLEDevice(deviceId);
      showNotification('Connected to BLE device', 'success');
    } catch (error) {
      showNotification(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectBLEDevice();
      showNotification('Disconnected from BLE device', 'info');
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
            <ThemedText style={styles.title}>BLE Devices</ThemedText>
            <ThemedText style={styles.subtitle}>Connect to Bluetooth devices</ThemedText>
          </View>
        </View>

        <View style={styles.content}>
          <BluetoothStatusCard status={status} />

          {connectedBLEDevice ? (
            <ConnectedDeviceCard
              device={connectedBLEDevice}
              characteristics={characteristics}
              onDisconnect={handleDisconnect}
            />
          ) : (
            <DeviceDiscoveryCard
              status={status}
              devices={bleDevices}
              isScanning={isScanning}
              connectedDevice={connectedBLEDevice}
              onStartScan={handleStartScan}
              onStopScan={handleStopScan}
              onConnectDevice={handleConnectDevice}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
