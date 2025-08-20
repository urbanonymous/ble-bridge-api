import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView, Platform, AppState } from 'react-native';
import proxyServiceInstance from '../services/ProxyService';
import { startBackgroundActions, stopBackgroundActions } from '../tasks/BackgroundActionsTask';
// Import BleManager to potentially show device name or more details later
// import bleManagerInstance from '../services/BleManager';

// Interface for the status object from ProxyService
interface ServiceStatus {
  service: string;
  ble: string;
  ws: string;
  error?: string | null;
}

export default function IndexScreen() {
  const [status, setStatus] = useState<ServiceStatus>({
    service: 'stopped',
    ble: '-',
    ws: 'disconnected',
    error: null,
  });
  const [logMessages, setLogMessages] = useState<string[]>([]); // State for logs
  const [appState, setAppState] = useState(AppState.currentState);

  // Effect to subscribe to ProxyService status updates
  useEffect(() => {
    const handleStatusUpdate = (newStatus: ServiceStatus) => {
      setStatus(newStatus);
    };

    proxyServiceInstance.onStatusUpdate(handleStatusUpdate);

    // TODO: Implement cleanup function to unregister listener in ProxyService
    // return () => { proxyServiceInstance.removeStatusListener(handleStatusUpdate); };
  }, []);

  // Effect to detect app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: any) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        // Optionally refresh UI or check service status
      }
      setAppState(nextAppState);
      console.log('AppState changed to', nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [appState]);

  // --- Placeholder for logging --- 
  // Ideally, ProxyService would emit log messages too
  useEffect(() => {
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;
      const MAX_LOGS = 50;

      const addLog = (level: string, ...args: any[]) => {
          const message = args.map(arg => {
              try {
                  return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
              } catch (e) { return '[Unstringifiable Object]'; }
          }).join(' ');
          const timestamp = new Date().toLocaleTimeString();
          setLogMessages(prevLogs => [
              `${timestamp} [${level}] ${message}`,
              ...prevLogs.slice(0, MAX_LOGS - 1)
          ]);
      };

      console.log = (...args) => {
          originalLog.apply(console, args);
          addLog('INFO', ...args);
      };
      console.warn = (...args) => {
          originalWarn.apply(console, args);
          addLog('WARN', ...args);
      };
      console.error = (...args) => {
          originalError.apply(console, args);
          addLog('ERROR', ...args);
      };

      // Cleanup function to restore original console methods
      return () => {
          console.log = originalLog;
          console.warn = originalWarn;
          console.error = originalError;
      };
  }, []);
  // --- End Placeholder --- 

  const handleStartService = async () => {
    setLogMessages(prev => ['--- Attempting to Start Background Service ---', ...prev.slice(0, 49)]);
    try {
      await startBackgroundActions();
      // Note: Starting background action doesn't immediately mean BLE/WS are connected.
      // Rely on status updates from ProxyService, which *should* be running within the task.
      // We might need a way for the task to report its own status (e.g., 'task_running').
      setStatus(prev => ({ ...prev, service: 'background_starting' })); // Tentative status
    } catch (error: any) {
      console.error('Failed to start background service:', error);
      setStatus(prev => ({ ...prev, service: 'error', error: error.message || 'Failed to start background task' }));
    }
  };

  const handleStopService = async () => {
    setLogMessages(prev => ['--- Attempting to Stop Background Service ---', ...prev.slice(0, 49)]);
    setStatus(prev => ({ ...prev, service: 'background_stopping' })); // Tentative status
    await stopBackgroundActions();
    // Also stop the proxy service instance directly for now, as the task might not fully manage it yet
    await proxyServiceInstance.stop();
    setStatus(prev => ({ ...prev, service: 'stopped', ble: '-', ws: 'disconnected', error: null })); // Force UI to stopped state
  };

  const isStarting = status.service === 'starting' || status.service === 'background_starting';
  const isStopping = status.service === 'stopping' || status.service === 'background_stopping';
  const isRunning = status.service === 'running'; // This might need adjustment
  const isStopped = !isStarting && !isStopping && !isRunning; // Simplified logic
  const isBusy = isStarting || isStopping;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Bridge App</Text>
      <Text style={styles.appState}>App State: {appState}</Text>

      <View style={styles.statusSection}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Service:</Text>
          <Text style={styles.statusValue}>{status.service}</Text>
          {isBusy && <ActivityIndicator size="small" style={styles.activityIndicator} />}
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>BLE:</Text>
          <Text style={styles.statusValue}>{status.ble}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>WebSocket:</Text>
          <Text style={styles.statusValue}>{status.ws}</Text>
        </View>

        {status.error && (
          <Text style={styles.errorText}>Error: {status.error}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Start Background Service"
          onPress={handleStartService}
          disabled={isBusy || isRunning}
        />
        <Button
          title="Stop Background Service"
          onPress={handleStopService}
          disabled={isBusy || isStopped}
        />
      </View>

      {/* Log View */}
      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Logs</Text>
        <ScrollView style={styles.logScrollView} contentContainerStyle={styles.logContentContainer}>
          {logMessages.map((msg, index) => (
            <Text key={index} style={styles.logText}>{msg}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  appState: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  statusSection: {
    width: '95%',
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    minWidth: 90,
  },
  statusValue: {
    fontSize: 16,
    flexShrink: 1,
  },
  activityIndicator: {
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginBottom: 20,
  },
  logContainer: {
    flex: 1,
    width: '95%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  logScrollView: {
    flex: 1,
  },
  logContentContainer: {
    paddingHorizontal: 10,
  },
  logText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginBottom: 4,
  },
}); 