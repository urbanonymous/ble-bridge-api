import React, { useState, useRef, useEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Alert, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useBridge } from '@/contexts/BridgeContext';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'websocket' | 'ble' | 'bridge' | 'error';
  direction: 'incoming' | 'outgoing' | 'internal';
  message: string;
  data?: any;
}

const MAX_VISIBLE_LOGS = 500; // Limit logs for performance

export default function LogsScreen() {
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const { logs, clearLogs, addLog } = useBridge();

  // Limit logs for performance and show most recent first
  const displayLogs = useMemo(() => {
    return logs.slice(-MAX_VISIBLE_LOGS).reverse();
  }, [logs]);

  // Auto-scroll to top when new logs arrive (since we show newest first)
  useEffect(() => {
    if (isAutoScroll && flatListRef.current && displayLogs.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [displayLogs, isAutoScroll]);

  const handleClearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearLogs,
        },
      ]
    );
  };

  const exportLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()} (${log.direction}): ${log.message}${log.data ? ` - ${JSON.stringify(log.data)}` : ''}`
    ).join('\n');
    
    // In a real app, you'd implement proper export functionality
    console.log('EXPORTED LOGS:', logText);
    Alert.alert('Export', 'Logs exported to console (in a real app, this would save to file)');
  };

  const getLogTypeColor = (type: string): string => {
    switch (type) {
      case 'websocket': return '#2196F3';
      case 'ble': return '#FF9800';
      case 'bridge': return '#4CAF50';
      case 'error': return '#F44336';
      default: return '#666';
    }
  };

  const getDirectionIcon = (direction: string): string => {
    switch (direction) {
      case 'incoming': return '⬅️';
      case 'outgoing': return '➡️';
      case 'internal': return '🔄';
      default: return '•';
    }
  };

  const addTestLog = (type: 'websocket' | 'ble' | 'error') => {
    const testLogs = {
      websocket: {
        message: 'WebSocket message received',
        data: { type: 'device_scan_start', payload: { duration: 10000 } }
      },
      ble: {
        message: 'BLE device discovered',
        data: { deviceId: 'test-device-123', name: 'Test BLE Device', rssi: -45 }
      },
      error: {
        message: 'Connection error',
        data: { error: 'Failed to connect to device', code: 'BLE_CONNECTION_FAILED' }
      }
    };

    const testLog = testLogs[type];
    addLog({
      type,
      direction: type === 'websocket' ? 'incoming' : 'outgoing',
      message: testLog.message,
      data: testLog.data,
    });
  };

  const renderLogItem = ({ item: log }: { item: LogEntry }) => (
    <View style={styles.logItem}>
      <View style={styles.logItemContent}>
        <View style={[styles.logTypeBadge, { backgroundColor: getLogTypeColor(log.type) }]} />
        <View style={styles.logMainContent}>
          <View style={styles.logHeader}>
            <ThemedText style={styles.logMessage} numberOfLines={1}>
              {log.message}
            </ThemedText>
            <View style={styles.logMeta}>
              <ThemedText style={styles.logDirection}>
                {getDirectionIcon(log.direction)}
              </ThemedText>
              <ThemedText style={styles.logTime}>{log.timestamp.split(' ')[1]}</ThemedText>
            </View>
          </View>
          {log.data && (
            <ThemedText style={styles.logData} numberOfLines={2}>
              {typeof log.data === 'string' ? log.data : JSON.stringify(log.data)}
            </ThemedText>
          )}
        </View>
      </View>
    </View>
  );

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
          {/* Controls Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.cardTitle}>⚙️ Controls</ThemedText>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.controlsGrid}>
                <TouchableOpacity
                  style={[styles.controlButton, isAutoScroll && styles.controlButtonActive]}
                  onPress={() => setIsAutoScroll(!isAutoScroll)}
                  activeOpacity={0.8}
                >
                  <ThemedText style={[styles.controlButtonText, isAutoScroll && styles.controlButtonTextActive]}>
                    📜 {isAutoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={handleClearLogs}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.clearButtonText}>🗑️ Clear Logs</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Stats Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.cardTitle}>📊 Statistics</ThemedText>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <ThemedText style={styles.statNumber}>{logs.length}</ThemedText>
                  <ThemedText style={styles.statLabel}>Total Messages</ThemedText>
                </View>
                <View style={styles.statCard}>
                  <ThemedText style={[styles.statNumber, { color: '#2196F3' }]}>
                    {logs.filter(l => l.type === 'websocket').length}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>WebSocket</ThemedText>
                </View>
                <View style={styles.statCard}>
                  <ThemedText style={[styles.statNumber, { color: '#FF9800' }]}>
                    {logs.filter(l => l.type === 'ble').length}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>BLE</ThemedText>
                </View>
                <View style={styles.statCard}>
                  <ThemedText style={[styles.statNumber, { color: '#F44336' }]}>
                    {logs.filter(l => l.type === 'error').length}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Errors</ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Logs Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.cardTitle}>📝 Live Messages</ThemedText>
            </View>
            <View style={styles.cardContent}>
              {displayLogs.length === 0 ? (
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyIcon}>📡</ThemedText>
                  <ThemedText style={styles.emptyTitle}>No communication yet</ThemedText>
                  <ThemedText style={styles.emptyDescription}>
                    Bridge messages will appear here in real-time
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.logsContainer}>
                  {displayLogs.length > MAX_VISIBLE_LOGS - 50 && (
                    <View style={styles.logsWarning}>
                      <ThemedText style={styles.logsWarningText}>
                        ⚡ Showing last {MAX_VISIBLE_LOGS} messages for performance
                      </ThemedText>
                    </View>
                  )}
                  <FlatList 
                    ref={flatListRef}
                    data={displayLogs}
                    renderItem={renderLogItem}
                    keyExtractor={(item) => item.id}
                    style={styles.logsList}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={50}
                    windowSize={10}
                    initialNumToRender={20}
                    getItemLayout={(data, index) => ({
                      length: 40, // Approximate item height
                      offset: 40 * index,
                      index,
                    })}
                  />
                </View>
              )}
            </View>
          </View>
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
    backgroundColor: '#0891b2',
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
  controlsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  controlButtonTextActive: {
    color: '#ffffff',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },

  logsContainer: {
    height: 500,
  },
  logsWarning: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  logsWarningText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '500',
    textAlign: 'center',
  },
  logsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  logItem: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    marginBottom: 2,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  logItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  logTypeBadge: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    marginRight: 8,
    minHeight: 20,
  },
  logMainContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 60,
  },
  logDirection: {
    fontSize: 12,
  },
  logTime: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  logData: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#475569',
    marginTop: 4,
    lineHeight: 16,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
