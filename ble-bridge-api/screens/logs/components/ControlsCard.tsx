import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { styles, controlStyles } from '../styles';

interface ControlsCardProps {
  isAutoScroll: boolean;
  onToggleAutoScroll: () => void;
  onClearLogs: () => void;
}

export const ControlsCard: React.FC<ControlsCardProps> = ({
  isAutoScroll,
  onToggleAutoScroll,
  onClearLogs
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>⚙️ Controls</ThemedText>
      </View>
      <View style={styles.cardContent}>
        <View style={controlStyles.controlsGrid}>
          <TouchableOpacity
            style={[controlStyles.controlButton, isAutoScroll && controlStyles.controlButtonActive]}
            onPress={onToggleAutoScroll}
            activeOpacity={0.8}
          >
            <ThemedText style={[
              controlStyles.controlButtonText, 
              isAutoScroll && controlStyles.controlButtonTextActive
            ]}>
              📜 {isAutoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={controlStyles.clearButton} 
            onPress={onClearLogs}
            activeOpacity={0.8}
          >
            <ThemedText style={controlStyles.clearButtonText}>🗑️ Clear Logs</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
