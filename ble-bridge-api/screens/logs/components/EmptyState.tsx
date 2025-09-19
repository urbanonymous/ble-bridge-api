import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { logStyles } from '../styles';

export const EmptyState: React.FC = () => {
  return (
    <View style={logStyles.emptyState}>
      <ThemedText style={logStyles.emptyIcon}>📡</ThemedText>
      <ThemedText style={logStyles.emptyTitle}>No communication yet</ThemedText>
      <ThemedText style={logStyles.emptyDescription}>
        Bridge messages will appear here in real-time
      </ThemedText>
    </View>
  );
};
