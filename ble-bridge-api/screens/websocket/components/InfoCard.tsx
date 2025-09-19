import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { styles, infoStyles } from '../styles';

export const InfoCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>ℹ️ How It Works</ThemedText>
      </View>
      <View style={styles.cardContent}>
        <View style={infoStyles.infoGrid}>
          <View style={infoStyles.infoItem}>
            <View style={infoStyles.infoIcon}>
              <ThemedText style={infoStyles.infoIconText}>🌐</ThemedText>
            </View>
            <View style={infoStyles.infoContent}>
              <ThemedText style={infoStyles.infoTitle}>WebSocket Connection</ThemedText>
              <ThemedText style={infoStyles.infoDescription}>Real-time API communication</ThemedText>
            </View>
          </View>
          <View style={infoStyles.infoItem}>
            <View style={infoStyles.infoIcon}>
              <ThemedText style={infoStyles.infoIconText}>🔄</ThemedText>
            </View>
            <View style={infoStyles.infoContent}>
              <ThemedText style={infoStyles.infoTitle}>Auto Bridge Setup</ThemedText>
              <ThemedText style={infoStyles.infoDescription}>Connects to BLE service automatically</ThemedText>
            </View>
          </View>
          <View style={infoStyles.infoItem}>
            <View style={infoStyles.infoIcon}>
              <ThemedText style={infoStyles.infoIconText}>📊</ThemedText>
            </View>
            <View style={infoStyles.infoContent}>
              <ThemedText style={infoStyles.infoTitle}>Live Monitoring</ThemedText>
              <ThemedText style={infoStyles.infoDescription}>View all logs in the Logs tab</ThemedText>
            </View>
          </View>
          <View style={infoStyles.infoItem}>
            <View style={infoStyles.infoIcon}>
              <ThemedText style={infoStyles.infoIconText}>⚡</ThemedText>
            </View>
            <View style={infoStyles.infoContent}>
              <ThemedText style={infoStyles.infoTitle}>Bidirectional Bridge</ThemedText>
              <ThemedText style={infoStyles.infoDescription}>Data flows in both directions</ThemedText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
