import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { LogEntry, calculateLogStats } from '../utils/logFormatters';
import { styles, statsStyles } from '../styles';

interface StatsCardProps {
  logs: LogEntry[];
}

export const StatsCard: React.FC<StatsCardProps> = ({ logs }) => {
  const stats = calculateLogStats(logs);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>📊 Statistics</ThemedText>
      </View>
      <View style={styles.cardContent}>
        <View style={statsStyles.statsGrid}>
          <View style={statsStyles.statCard}>
            <ThemedText style={statsStyles.statNumber}>{stats.total}</ThemedText>
            <ThemedText style={statsStyles.statLabel}>Total Messages</ThemedText>
          </View>
          <View style={statsStyles.statCard}>
            <ThemedText style={[statsStyles.statNumber, { color: '#2196F3' }]}>
              {stats.websocket}
            </ThemedText>
            <ThemedText style={statsStyles.statLabel}>WebSocket</ThemedText>
          </View>
          <View style={statsStyles.statCard}>
            <ThemedText style={[statsStyles.statNumber, { color: '#FF9800' }]}>
              {stats.ble}
            </ThemedText>
            <ThemedText style={statsStyles.statLabel}>BLE</ThemedText>
          </View>
          <View style={statsStyles.statCard}>
            <ThemedText style={[statsStyles.statNumber, { color: '#F44336' }]}>
              {stats.error}
            </ThemedText>
            <ThemedText style={statsStyles.statLabel}>Errors</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
};
