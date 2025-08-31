import { useMemo } from 'react';
import { LogEntry } from '../utils/logFormatters';

const MAX_VISIBLE_LOGS = 500;

export const useLogsData = (logs: LogEntry[]) => {
  // Limit logs for performance and show most recent first
  const displayLogs = useMemo(() => {
    return logs.slice(-MAX_VISIBLE_LOGS).reverse();
  }, [logs]);

  const isNearLimit = useMemo(() => {
    return logs.length > MAX_VISIBLE_LOGS - 50;
  }, [logs.length]);

  return {
    displayLogs,
    isNearLimit,
    maxVisibleLogs: MAX_VISIBLE_LOGS
  };
};
