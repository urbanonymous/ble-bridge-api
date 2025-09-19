import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { styles, configStyles } from '../styles';

interface ConfigurationCardProps {
  websocketUrl: string;
  onUrlChange: (url: string) => void;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const ConfigurationCard: React.FC<ConfigurationCardProps> = ({
  websocketUrl,
  onUrlChange,
  isConnected,
  onConnect,
  onDisconnect
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>⚙️ API Configuration</ThemedText>
      </View>
      <View style={styles.cardContent}>
        <ThemedText style={configStyles.inputLabel}>WebSocket URL</ThemedText>
        <TextInput
          style={[configStyles.input, !isConnected ? configStyles.inputActive : configStyles.inputDisabled]}
          value={websocketUrl}
          onChangeText={onUrlChange}
          placeholder="ws://localhost:8080"
          placeholderTextColor="#94a3b8"
          editable={!isConnected}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TouchableOpacity
          style={[
            configStyles.primaryButton,
            isConnected ? configStyles.disconnectButton : configStyles.connectButton
          ]}
          onPress={isConnected ? onDisconnect : onConnect}
          activeOpacity={0.8}
        >
          <ThemedText style={configStyles.primaryButtonText}>
            {isConnected ? '🔌 Disconnect' : '🚀 Connect to API'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
