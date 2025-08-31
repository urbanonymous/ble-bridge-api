import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { LogEntry, getLogTypeColor, getDirectionIcon, formatLogData } from '../utils/logFormatters';
import { logStyles } from '../styles';

interface LogItemProps {
  log: LogEntry;
}

export const LogItem: React.FC<LogItemProps> = ({ log }) => {
  return (
    <View style={logStyles.logItem}>
      <View style={logStyles.logItemContent}>
        <View style={[logStyles.logTypeBadge, { backgroundColor: getLogTypeColor(log.type) }]} />
        <View style={logStyles.logMainContent}>
          <View style={logStyles.logHeader}>
            <ThemedText style={logStyles.logMessage} numberOfLines={1}>
              {log.message}
            </ThemedText>
            <View style={logStyles.logMeta}>
              <ThemedText style={logStyles.logDirection}>
                {getDirectionIcon(log.direction)}
              </ThemedText>
              <ThemedText style={logStyles.logTime}>
                {log.timestamp.split(' ')[1]}
              </ThemedText>
            </View>
          </View>
          {log.data && (
            <ThemedText style={logStyles.logData} numberOfLines={2}>
              {formatLogData(log.data)}
            </ThemedText>
          )}
        </View>
      </View>
    </View>
  );
};
