export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'websocket' | 'ble' | 'bridge' | 'error';
  direction: 'incoming' | 'outgoing' | 'internal';
  message: string;
  data?: any;
}

export const getLogTypeColor = (type: string): string => {
  switch (type) {
    case 'websocket': return '#2196F3';
    case 'ble': return '#FF9800';
    case 'bridge': return '#4CAF50';
    case 'error': return '#F44336';
    default: return '#666';
  }
};

export const getDirectionIcon = (direction: string): string => {
  switch (direction) {
    case 'incoming': return '⬅️';
    case 'outgoing': return '➡️';
    case 'internal': return '🔄';
    default: return '•';
  }
};

export const formatLogData = (data: any): string => {
  if (!data) return '';
  return typeof data === 'string' ? data : JSON.stringify(data);
};

export const exportLogsToText = (logs: LogEntry[]): string => {
  return logs.map(log => 
    `[${log.timestamp}] ${log.type.toUpperCase()} (${log.direction}): ${log.message}${log.data ? ` - ${JSON.stringify(log.data)}` : ''}`
  ).join('\n');
};

export const calculateLogStats = (logs: LogEntry[]) => {
  return {
    total: logs.length,
    websocket: logs.filter(l => l.type === 'websocket').length,
    ble: logs.filter(l => l.type === 'ble').length,
    bridge: logs.filter(l => l.type === 'bridge').length,
    error: logs.filter(l => l.type === 'error').length,
  };
};
