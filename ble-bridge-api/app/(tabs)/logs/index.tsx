import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useBridge } from '@/contexts/BridgeContext';

import { useLogsData } from './hooks/useLogsData';
import { useLogControls } from './hooks/useLogControls';
import { ControlsCard } from './components/ControlsCard';
import { StatsCard } from './components/StatsCard';
import { LogsList } from './components/LogsList';
import { styles } from './styles';

export default function LogsScreen() {
  const { logs, clearLogs } = useBridge();
  
  const { displayLogs, isNearLimit, maxVisibleLogs } = useLogsData(logs);
  const { 
    isAutoScroll, 
    flatListRef, 
    handleClearLogs, 
    toggleAutoScroll 
  } = useLogControls(displayLogs, logs, clearLogs);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.title}>Bridge Logs</ThemedText>
          </View>
        </View>

        <View style={styles.content}>
          <ControlsCard
            isAutoScroll={isAutoScroll}
            onToggleAutoScroll={toggleAutoScroll}
            onClearLogs={handleClearLogs}
          />

          <StatsCard logs={logs} />

          <LogsList
            displayLogs={displayLogs}
            isNearLimit={isNearLimit}
            maxVisibleLogs={maxVisibleLogs}
            flatListRef={flatListRef}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
