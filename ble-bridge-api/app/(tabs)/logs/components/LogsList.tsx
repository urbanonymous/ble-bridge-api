import React from 'react';
import { View, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { LogEntry } from '../utils/logFormatters';
import { LogItem } from './LogItem';
import { EmptyState } from './EmptyState';
import { styles, logStyles } from '../styles';

interface LogsListProps {
  displayLogs: LogEntry[];
  isNearLimit: boolean;
  maxVisibleLogs: number;
  flatListRef: React.RefObject<FlatList>;
}

export const LogsList: React.FC<LogsListProps> = ({
  displayLogs,
  isNearLimit,
  maxVisibleLogs,
  flatListRef
}) => {
  const renderLogItem = ({ item }: { item: LogEntry }) => (
    <LogItem log={item} />
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>📝 Live Messages</ThemedText>
      </View>
      <View style={styles.cardContent}>
        {displayLogs.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={logStyles.logsContainer}>
            {isNearLimit && (
              <View style={logStyles.logsWarning}>
                <ThemedText style={logStyles.logsWarningText}>
                  ⚡ Showing last {maxVisibleLogs} messages for performance
                </ThemedText>
              </View>
            )}
            <FlatList 
              ref={flatListRef}
              data={displayLogs}
              renderItem={renderLogItem}
              keyExtractor={(item) => item.id}
              style={logStyles.logsList}
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
  );
};
