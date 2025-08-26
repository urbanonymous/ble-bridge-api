import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Alert, View } from 'react-native';
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

export default function LogsScreen() {
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const { logs, clearLogs, addLog } = useBridge();

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (isAutoScroll && scrollViewRef.current && logs.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [logs, isAutoScroll]);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <ThemedText style={styles.title}>Bridge Logs</ThemedText>
            <ThemedText style={styles.subtitle}>Live Communication Monitor</ThemedText>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.toggleButton, isAutoScroll && styles.toggleButtonActive]}
              onPress={() => setIsAutoScroll(!isAutoScroll)}
            >
              <ThemedText style={[styles.toggleText, isAutoScroll && styles.toggleTextActive]}>
                Auto-scroll
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleClearLogs}>
              <ThemedText style={styles.actionButtonText}>Clear</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{logs.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {logs.filter(l => l.type === 'websocket').length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>WebSocket</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {logs.filter(l => l.type === 'ble').length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>BLE</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {logs.filter(l => l.type === 'error').length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Errors</ThemedText>
          </View>
        </View>

        {/* Test Controls */}
        <View style={styles.testControls}>
          <ThemedText style={styles.testLabel}>Test:</ThemedText>
          <TouchableOpacity
            style={[styles.testBtn, styles.testBtnWs]}
            onPress={() => addTestLog('websocket')}
          >
            <ThemedText style={styles.testBtnText}>WebSocket</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.testBtn, styles.testBtnBle]}
            onPress={() => addTestLog('ble')}
          >
            <ThemedText style={styles.testBtnText}>BLE</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.testBtn, styles.testBtnError]}
            onPress={() => addTestLog('error')}
          >
            <ThemedText style={styles.testBtnText}>Error</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Logs List */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.logsList}
          showsVerticalScrollIndicator={false}
        >
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyIcon}>📡</ThemedText>
              <ThemedText style={styles.emptyText}>No communication yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Bridge messages will appear here in real-time
              </ThemedText>
            </View>
          ) : (
            logs.map((log, index) => (
              <View key={log.id} style={styles.logItem}>
                {/* Log Header */}
                <View style={styles.logItemHeader}>
                  <View style={styles.logTypeSection}>
                    <View style={[styles.logTypeBadge, { backgroundColor: getLogTypeColor(log.type) }]}>
                      <ThemedText style={styles.logTypeBadgeText}>
                        {log.type === 'websocket' ? 'WS' : 
                         log.type === 'ble' ? 'BLE' : 
                         log.type === 'bridge' ? 'BR' : 'ERR'}
                      </ThemedText>
                    </View>
                    <View>
                      <ThemedText style={styles.logItemMessage}>{log.message}</ThemedText>
                      <ThemedText style={styles.logItemDirection}>
                        {getDirectionIcon(log.direction)} {log.direction}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.logItemTime}>{log.timestamp}</ThemedText>
                </View>

                {/* Log Data */}
                {log.data && (
                  <View style={styles.logDataContainer}>
                    <ThemedText style={styles.logDataText}>
                      {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                    </ThemedText>
                  </View>
                )}
              </View>
            ))
          )}
          
          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  toggleButtonActive: {
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
  },
  toggleTextActive: {
    color: 'white',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsBar: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  statLabel: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e9ecef',
    marginHorizontal: 8,
  },
  testControls: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    gap: 12,
  },
  testLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  testBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  testBtnWs: {
    backgroundColor: '#0d6efd',
  },
  testBtnBle: {
    backgroundColor: '#fd7e14',
  },
  testBtnError: {
    backgroundColor: '#dc3545',
  },
  testBtnText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  logsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 20,
  },
  logItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  logTypeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  logTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 36,
    alignItems: 'center',
  },
  logTypeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  logItemMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  logItemDirection: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  logItemTime: {
    fontSize: 11,
    color: '#adb5bd',
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  logDataContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  logDataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#495057',
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 20,
  },
});
