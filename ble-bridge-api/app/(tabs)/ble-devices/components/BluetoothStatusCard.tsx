import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { BLEStatus } from '@/services/BLEService';
import { styles, statusStyles } from '../styles';
import { getStatusColor, getStatusText } from '../utils/bleStatusUtils';

interface BluetoothStatusCardProps {
  status: BLEStatus;
}

export const BluetoothStatusCard: React.FC<BluetoothStatusCardProps> = ({ status }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>📶 Bluetooth Status</ThemedText>
      </View>
      <View style={styles.cardContent}>
        <View style={statusStyles.statusContainer}>
          <View style={[statusStyles.statusIndicator, { backgroundColor: getStatusColor(status) }]} />
          <View style={statusStyles.statusInfo}>
            <ThemedText style={statusStyles.statusLabel}>Bluetooth</ThemedText>
            <ThemedText style={statusStyles.statusValue}>{getStatusText(status)}</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
};
