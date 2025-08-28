import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, TouchableOpacity, ScrollView, FlatList, View } from 'react-native';
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
      style={[styles.deviceCard, !!connectedBLEDevice && styles.deviceCardDisabled]}
      onPress={() => handleConnectDevice(item.id)}
      disabled={!!connectedBLEDevice}
      activeOpacity={0.7}
    >
      <View style={styles.deviceCardHeader}>
        <View style={styles.deviceInfo}>
          <ThemedText style={styles.deviceName}>
            📱 {item.name || 'Unknown Device'}
          </ThemedText>
          <ThemedText style={styles.deviceId}>
            {item.id}
          </ThemedText>
        </View>
        <View style={styles.deviceMeta}>
          {item.rssi && (
            <View style={styles.signalStrength}>
              <ThemedText style={styles.signalIcon}>
                {item.rssi > -50 ? '📶' : item.rssi > -70 ? '📶' : '📶'}
              </ThemedText>
              <ThemedText style={styles.rssiText}>
                {item.rssi} dBm
              </ThemedText>
            </View>
          )}
        </View>
      </View>
      <View style={styles.deviceCardFooter}>
        <ThemedText style={styles.tapToConnect}>
          Tap to connect
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.title}>BLE Devices</ThemedText>
          </View>
        </View>

        <View style={styles.content}>
          {/* Status Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.cardTitle}>📡 Bluetooth Status</ThemedText>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.statusContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]} />
                <View style={styles.statusInfo}>
                  <ThemedText style={styles.statusLabel}>Current Status</ThemedText>
                  <ThemedText style={styles.statusValue}>{getStatusText(status)}</ThemedText>
                </View>
              </View>
            </View>
          </View>

          {connectedBLEDevice ? (
            /* Connected Device Card */
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardTitle}>🔗 Connected Device</ThemedText>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.connectedDeviceInfo}>
                  <View style={styles.connectedDeviceHeader}>
                    <ThemedText style={styles.connectedDeviceName}>
                      📱 {connectedBLEDevice.name || 'Unknown Device'}
                    </ThemedText>
                    <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
                      <ThemedText style={styles.disconnectButtonText}>🔌 Disconnect</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <ThemedText style={styles.connectedDeviceId}>
                    {connectedBLEDevice.id}
                  </ThemedText>
                </View>
                
                {characteristics.length > 0 && (
                  <View style={styles.characteristicsSection}>
                    <ThemedText style={styles.characteristicsTitle}>⚙️ Device Characteristics</ThemedText>
                    <View style={styles.characteristicsList}>
                      {characteristics.map((char, index) => (
                        <View key={index} style={styles.characteristicCard}>
                          <ThemedText style={styles.characteristicUuid}>
                            {char.uuid}
                          </ThemedText>
                          <View style={styles.characteristicProperties}>
                            <View style={[styles.propertyBadge, char.isReadable && styles.propertyActive]}>
                              <ThemedText style={[styles.propertyText, char.isReadable && styles.propertyTextActive]}>
                                R {char.isReadable ? '✓' : '✗'}
                              </ThemedText>
                            </View>
                            <View style={[styles.propertyBadge, char.isWritable && styles.propertyActive]}>
                              <ThemedText style={[styles.propertyText, char.isWritable && styles.propertyTextActive]}>
                                W {char.isWritable ? '✓' : '✗'}
                              </ThemedText>
                            </View>
                            <View style={[styles.propertyBadge, char.isNotifiable && styles.propertyActive]}>
                              <ThemedText style={[styles.propertyText, char.isNotifiable && styles.propertyTextActive]}>
                                N {char.isNotifiable ? '✓' : '✗'}
                              </ThemedText>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          ) : (
            /* Device Discovery Card */
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.scanHeaderContent}>
                  <ThemedText style={styles.cardTitle}>🔍 Device Discovery</ThemedText>
                  <TouchableOpacity
                    style={[
                      styles.scanButton,
                      canScan ? (isScanning ? styles.scanButtonStop : styles.scanButtonStart) : styles.scanButtonDisabled
                    ]}
                    onPress={isScanning ? handleStopScan : handleStartScan}
                    disabled={!canScan}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.scanButtonText}>
                      {isScanning ? '⏹️ Stop' : '🔍 Scan'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.cardContent}>
                {bleDevices.length === 0 ? (
                  <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyStateIcon}>
                      {isScanning ? '🔄' : '📱'}
                    </ThemedText>
                    <ThemedText style={styles.emptyStateTitle}>
                      {isScanning ? 'Scanning for devices...' : 'No devices found'}
                    </ThemedText>
                    <ThemedText style={styles.emptyStateDescription}>
                      {isScanning ? 'Looking for nearby BLE devices' : 'Start scanning to discover BLE devices'}
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.devicesList}>
                    <ThemedText style={styles.devicesFoundText}>
                      Found {bleDevices.length} device{bleDevices.length !== 1 ? 's' : ''}
                    </ThemedText>
                    <FlatList
                      data={bleDevices}
                      renderItem={renderDevice}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>
                )}
              </View>
            </View>
          )}
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
    backgroundColor: '#8b5cf6',
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
  statusContainer: {
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
  scanHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  scanButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  scanButtonStart: {
    backgroundColor: '#10b981',
  },
  scanButtonStop: {
    backgroundColor: '#f59e0b',
  },
  scanButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  devicesList: {
    marginTop: 8,
  },
  devicesFoundText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  deviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#f9fafb',
  },
  deviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  deviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  deviceMeta: {
    alignItems: 'flex-end',
  },
  signalStrength: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  rssiText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  deviceCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  tapToConnect: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
    textAlign: 'center',
  },
  connectedDeviceInfo: {
    marginBottom: 16,
  },
  connectedDeviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  connectedDeviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  connectedDeviceId: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  characteristicsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  characteristicsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  characteristicsList: {
    gap: 8,
  },
  characteristicCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  characteristicUuid: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#374151',
    marginBottom: 8,
  },
  characteristicProperties: {
    flexDirection: 'row',
    gap: 6,
  },
  propertyBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  propertyActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  propertyText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  propertyTextActive: {
    color: '#1d4ed8',
  },
});
