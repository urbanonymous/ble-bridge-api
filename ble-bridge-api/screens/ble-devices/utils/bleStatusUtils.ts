import { BLEStatus } from '@/services/BLEService';

export const getStatusColor = (status: BLEStatus): string => {
  switch (status) {
    case 'powered_on': return '#4CAF50';
    case 'connected': return '#2196F3';
    case 'scanning': return '#FF9800';
    case 'connecting': return '#FF9800';
    case 'powered_off': return '#F44336';
    case 'unauthorized': return '#FF5722';
    case 'unsupported': return '#9E9E9E';
    default: return '#9E9E9E';
  }
};

export const getStatusText = (status: BLEStatus): string => {
  switch (status) {
    case 'powered_on': return 'Ready';
    case 'connected': return 'Connected';
    case 'scanning': return 'Scanning...';
    case 'connecting': return 'Connecting...';
    case 'powered_off': return 'Bluetooth Off';
    case 'unauthorized': return 'No Permission';
    case 'unsupported': return 'Not Supported';
    default: return 'Unknown';
  }
};

export const canStartScan = (status: BLEStatus): boolean => {
  return !['powered_off', 'unauthorized', 'unsupported'].includes(status);
};
