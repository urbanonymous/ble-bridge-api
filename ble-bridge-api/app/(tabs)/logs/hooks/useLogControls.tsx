import { useState, useRef, useEffect } from 'react';
import { FlatList, Alert } from 'react-native';
import { LogEntry, exportLogsToText } from '../utils/logFormatters';

export const useLogControls = (displayLogs: LogEntry[], logs: LogEntry[], clearLogs: () => void) => {
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const flatListRef = useRef<FlatList>(null);

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
    const logText = exportLogsToText(logs);
    
    // In a real app, you'd implement proper export functionality
    console.log('EXPORTED LOGS:', logText);
    Alert.alert('Export', 'Logs exported to console (in a real app, this would save to file)');
  };

  const toggleAutoScroll = () => {
    setIsAutoScroll(!isAutoScroll);
  };

  return {
    isAutoScroll,
    flatListRef,
    handleClearLogs,
    exportLogs,
    toggleAutoScroll
  };
};
