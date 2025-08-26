import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BLEDeviceInfo, BLEStatus } from '@/services/BLEService';
import { useBridge } from '@/contexts/BridgeContext';

export default function BLEScreen() {
  const [characteristics, setCharacteristics] = useState<any[]>([]);
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

  // Update characteristics when device connects
  useEffect(() => {
    const loadCharacteristics = async () => {
      if (connectedBLEDevice && bridgeService) {
        try {
          const services = await bridgeService.getBLEService().getServices();
          if (services.length > 0) {
            const chars = await bridgeService.getBLEService().getCharacteristics(services[0].uuid);
            setCharacteristics(chars);
          }
        } catch (error) {
          console.warn('Could not fetch services/characteristics:', error);
          setCharacteristics([]);
        }
      } else {
        setCharacteristics([]);
      }
    };

    loadCharacteristics();
  }, [connectedBLEDevice, bridgeService]);

  const handleStartScan = async () => {
    try {
      await startBLEScan();
    } catch (error) {
      Alert.alert('Error', `Failed to start scanning: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleStopScan = () => {
    stopBLEScan();
  };

  const handleConnectDevice = async (deviceId: string) => {
    try {
      await connectBLEDevice(deviceId);
      Alert.alert('Success', 'Connected to BLE device');
    } catch (error) {
      Alert.alert('Error', `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectBLEDevice();
      Alert.alert('Info', 'Disconnected from BLE device');
    } catch (error) {
      Alert.alert('Error', `Failed to disconnect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusColor = (status: BLEStatus): string => {
    switch (status) {
      case 'powered_on': return '#4CAF50';
      case 'connected': return '#2196F3';
      case 'scanning': return '#FF9800';
      case 'connecting': return '#FF9800';
      case 'powered_off': return '#F44336';
      case 'unauthorized': return '#FF5722';
      case 'unsupported': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: BLEStatus): string => {
    switch (status) {
      case 'powered_on': return 'Ready';
      case 'connected': return 'Connected';
      case 'scanning': return 'Scanning...';
      case 'connecting': return 'Connecting...';
      case 'powered_off': return 'Bluetooth Off';
      case 'unauthorized': return 'No Permission';
      case 'unsupported': return 'Not Supported';
      default: return 'Unknown';
    }
  };

  const canScan = status === 'powered_on' && !connectedBLEDevice;
  const isConnected = status === 'connected' && connectedBLEDevice;

  const renderDevice = ({ item }: { item: BLEDeviceInfo }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => handleConnectDevice(item.id)}
      disabled={!!connectedBLEDevice}
    >
      <ThemedView style={styles.deviceInfo}>
        <ThemedText style={styles.deviceName}>
          {item.name || 'Unknown Device'}
        </ThemedText>
        <ThemedText style={styles.deviceId}>
          {item.id}
        </ThemedText>
        {item.rssi && (
          <ThemedText style={styles.deviceRssi}>
            RSSI: {item.rssi} dBm
          </ThemedText>
        )}
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <ThemedView style={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">BLE Connection</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Bluetooth Status</ThemedText>
          <ThemedView style={styles.statusContainer}>
            <ThemedView style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
            <ThemedText style={styles.statusText}>
              {getStatusText(status)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {connectedBLEDevice ? (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Connected Device</ThemedText>
            <ThemedView style={styles.connectedDevice}>
              <ThemedText style={styles.deviceName}>
                {connectedBLEDevice.name || 'Unknown Device'}
              </ThemedText>
              <ThemedText style={styles.deviceId}>
                {connectedBLEDevice.id}
              </ThemedText>
              <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
                <ThemedText style={styles.buttonText}>Disconnect</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            
            {characteristics.length > 0 && (
              <ThemedView style={styles.characteristicsContainer}>
                <ThemedText type="subtitle">Characteristics</ThemedText>
                {characteristics.map((char, index) => (
                  <ThemedView key={index} style={styles.characteristicItem}>
                    <ThemedText style={styles.characteristicUuid}>
                      {char.uuid}
                    </ThemedText>
                    <ThemedText style={styles.characteristicProperties}>
                      R: {char.isReadable ? '✓' : '✗'} | 
                      W: {char.isWritable ? '✓' : '✗'} | 
                      N: {char.isNotifiable ? '✓' : '✗'}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            )}
          </ThemedView>
        ) : (
          <ThemedView style={styles.section}>
            <ThemedView style={styles.scanHeader}>
              <ThemedText type="subtitle">Scan for Devices</ThemedText>
              <TouchableOpacity
                style={[styles.scanButton, canScan ? styles.scanButtonActive : styles.scanButtonDisabled]}
                onPress={isScanning ? handleStopScan : handleStartScan}
                disabled={!canScan}
              >
                <ThemedText style={styles.buttonText}>
                  {isScanning ? 'Stop Scan' : 'Start Scan'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.devicesList}>
              {bleDevices.length === 0 ? (
                <ThemedText style={styles.noDevices}>
                  {isScanning ? 'Scanning for devices...' : 'No devices found'}
                </ThemedText>
              ) : (
                <FlatList
                  data={bleDevices}
                  renderItem={renderDevice}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </ThemedView>
          </ThemedView>
        )}
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
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  scanButton: {
    padding: 10,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  scanButtonActive: {
    backgroundColor: '#4CAF50',
  },
  scanButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  devicesList: {
    minHeight: 200,
  },
  noDevices: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 50,
  },
  deviceItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#888',
  },
  connectedDevice: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  characteristicsContainer: {
    marginTop: 15,
  },
  characteristicItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  characteristicUuid: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  characteristicProperties: {
    fontSize: 11,
    color: '#666',
  },
});
