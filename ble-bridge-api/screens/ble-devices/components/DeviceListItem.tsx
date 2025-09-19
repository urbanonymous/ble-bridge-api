import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { BLEDeviceInfo } from '@/services/BLEService';
import { deviceStyles } from '../styles';

interface DeviceListItemProps {
  device: BLEDeviceInfo;
  onConnect: (deviceId: string) => void;
  disabled: boolean;
}

export const DeviceListItem: React.FC<DeviceListItemProps> = ({
  device,
  onConnect,
  disabled
}) => {
  const getSignalIcon = (rssi: number) => {
    if (rssi > -50) return '📶';
    if (rssi > -70) return '📶';
    if (rssi > -80) return '📶';
    return '📶';
  };

  return (
    <TouchableOpacity
      style={[deviceStyles.deviceCard, disabled && deviceStyles.deviceCardDisabled]}
      onPress={() => onConnect(device.id)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={deviceStyles.deviceCardHeader}>
        <View style={deviceStyles.deviceInfo}>
          <ThemedText style={deviceStyles.deviceName}>
            📱 {device.name || 'Unknown Device'}
          </ThemedText>
          <ThemedText style={deviceStyles.deviceId}>
            {device.id}
          </ThemedText>
        </View>
        <View style={deviceStyles.deviceMeta}>
          {device.rssi && (
            <View style={deviceStyles.signalStrength}>
              <ThemedText style={deviceStyles.signalIcon}>
                {getSignalIcon(device.rssi)}
              </ThemedText>
              <ThemedText style={deviceStyles.rssiText}>
                {device.rssi} dBm
              </ThemedText>
            </View>
          )}
        </View>
      </View>
      <View style={deviceStyles.deviceCardFooter}>
        <ThemedText style={deviceStyles.tapToConnect}>
          Tap to connect
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};
