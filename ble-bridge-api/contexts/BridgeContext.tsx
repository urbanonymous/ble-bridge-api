import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BridgeService, BridgeStatus, BridgeMessage } from '@/services/BridgeService';
import { BLEDeviceInfo, BLEStatus } from '@/services/BLEService';
import { WebSocketStatus } from '@/services/WebSocketService';

// Extend BridgeService type to include cleanup function
interface ExtendedBridgeService extends BridgeService {
  cleanup?: () => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'websocket' | 'ble' | 'bridge' | 'error';
  direction: 'incoming' | 'outgoing' | 'internal';
  message: string;
  data?: any;
}

interface BridgeContextType {
  // Bridge service instance
  bridgeService: ExtendedBridgeService | null;
  
  // Status
  bridgeStatus: BridgeStatus;
  isConnected: boolean;
  isFullyConnected: boolean;
  
  // Logs
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  
  // WebSocket functions
  connectWebSocket: (url: string) => Promise<void>;
  disconnectWebSocket: () => Promise<void>;
  
  // BLE functions
  bleDevices: BLEDeviceInfo[];
  connectedBLEDevice: BLEDeviceInfo | null;
  isScanning: boolean;
  startBLEScan: () => Promise<void>;
  stopBLEScan: () => void;
  connectBLEDevice: (deviceId: string) => Promise<void>;
  disconnectBLEDevice: () => Promise<void>;
  
  // Bridge functions
  startBridge: () => Promise<void>;
  stopBridge: () => Promise<void>;
}

const BridgeContext = createContext<BridgeContextType | null>(null);

export const useBridge = () => {
  const context = useContext(BridgeContext);
  if (!context) {
    throw new Error('useBridge must be used within a BridgeProvider');
  }
  return context;
};

interface BridgeProviderProps {
  children: ReactNode;
}

export const BridgeProvider: React.FC<BridgeProviderProps> = ({ children }) => {
  const [bridgeService, setBridgeService] = useState<ExtendedBridgeService | null>(null);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>({
    websocket: 'disconnected',
    ble: 'unknown',
    bridgeActive: false,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [bleDevices, setBLEDevices] = useState<BLEDeviceInfo[]>([]);
  const [connectedBLEDevice, setConnectedBLEDevice] = useState<BLEDeviceInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [currentWebSocketUrl, setCurrentWebSocketUrl] = useState('ws://localhost:8080');

  // Create bridge service when needed (not immediately)
  const createBridgeService = async (url: string): Promise<ExtendedBridgeService> => {
    try {
      addLog({
        type: 'bridge',
        direction: 'internal',
        message: 'Initializing bridge service...',
        data: { url },
      });

      const service = new BridgeService({
        websocketUrl: url,
        autoReconnect: true,
        logMessages: true,
      });

      // Listen to bridge status changes
      const unsubscribeStatus = service.addStatusListener((status) => {
        setBridgeStatus(status);
        
        // Add status change log
        addLog({
          type: 'bridge',
          direction: 'internal',
          message: 'Status Update',
          data: status,
        });
      });

      // Listen to bridge messages
      const unsubscribeMessages = service.addMessageListener((message) => {
        addLog({
          type: 'bridge',
          direction: 'internal',
          message: message.type,
          data: message.payload,
        });
      });

      // Listen to BLE device discoveries
      const unsubscribeDevices = service.getBLEService().addDeviceListener((devices) => {
        setBLEDevices(devices);
      });

      // Listen to BLE status changes
      const unsubscribeBLEStatus = service.getBLEService().addStatusListener((status) => {
        setIsScanning(service.getBLEService().isScanning());
        
        if (status === 'connected') {
          const device = service.getBLEService().getConnectedDevice();
          if (device) {
            setConnectedBLEDevice({
              id: device.id,
              name: device.name,
              rssi: null,
              isConnectable: true,
            });
          }
        } else if (status === 'disconnected') {
          setConnectedBLEDevice(null);
        }
      });

      // Listen to WebSocket messages
      const unsubscribeWS = service.getWebSocketService().addMessageListener((message) => {
        addLog({
          type: 'websocket',
          direction: 'incoming',
          message: message.type,
          data: message.data,
        });
      });

      // Listen to BLE messages
      const unsubscribeBLE = service.getBLEService().addMessageListener((message) => {
        addLog({
          type: 'ble',
          direction: 'outgoing',
          message: 'BLE Notification',
          data: {
            deviceId: message.deviceId,
            characteristic: message.characteristicUUID,
            data: message.data,
          },
        });
      });

      addLog({
        type: 'bridge',
        direction: 'internal',
        message: 'Bridge service initialized successfully',
        data: { url },
      });

      // Create extended service with cleanup function
      const extendedService = service as ExtendedBridgeService;
      extendedService.cleanup = () => {
        unsubscribeStatus();
        unsubscribeMessages();
        unsubscribeDevices();
        unsubscribeBLEStatus();
        unsubscribeWS();
        unsubscribeBLE();
      };

      setBridgeService(extendedService);
      return extendedService;
    } catch (error) {
      console.error('Failed to initialize bridge service:', error);
      addLog({
        type: 'error',
        direction: 'internal',
        message: 'Bridge initialization failed - BLE may not be available in Expo Go',
        data: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          solution: 'Use npx expo run:android or npx expo run:ios for full BLE support'
        },
      });
      
      // Set a fallback status
      setBridgeStatus({
        websocket: 'disconnected',
        ble: 'unsupported',
        bridgeActive: false,
      });
      
      throw error;
    }
  };

  // Helper function to add logs
  const addLog = (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...log,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setLogs(prev => [...prev.slice(-99), newLog]); // Keep last 100 logs
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // WebSocket functions
  const connectWebSocket = async (url: string) => {
    console.log('🔍 connectWebSocket called with URL:', url);
    setCurrentWebSocketUrl(url);
    
    // Clean up existing bridge service if it exists
    if (bridgeService) {
      if (bridgeService.cleanup) {
        bridgeService.cleanup();
      }
      await bridgeService.stopBridge();
    }
    
    addLog({
      type: 'websocket',
      direction: 'outgoing',
      message: 'Connecting to WebSocket',
      data: { url, debug: 'URL passed to connectWebSocket' },
    });
    
    // Create new bridge service with the correct URL
    console.log('🔍 Creating bridge service with URL:', url);
    const newService = await createBridgeService(url);
    console.log('🔍 Starting bridge with service URL:', newService.getWebSocketService().getConfig().url);
    await newService.startBridge();
  };

  const disconnectWebSocket = async () => {
    if (!bridgeService) return;
    
    addLog({
      type: 'websocket',
      direction: 'outgoing',
      message: 'Disconnecting WebSocket',
    });
    
    await bridgeService.stopBridge();
  };

  // BLE functions
  const startBLEScan = async () => {
    if (!bridgeService) throw new Error('Bridge service not initialized');
    
    addLog({
      type: 'ble',
      direction: 'outgoing',
      message: 'Starting BLE scan',
    });
    
    setBLEDevices([]);
    await bridgeService.getBLEService().startScanning(15000);
  };

  const stopBLEScan = () => {
    if (!bridgeService) return;
    
    addLog({
      type: 'ble',
      direction: 'outgoing',
      message: 'Stopping BLE scan',
    });
    
    bridgeService.getBLEService().stopScanning();
  };

  const connectBLEDevice = async (deviceId: string) => {
    if (!bridgeService) throw new Error('Bridge service not initialized');
    
    addLog({
      type: 'ble',
      direction: 'outgoing',
      message: 'Connecting to BLE device',
      data: { deviceId },
    });
    
    await bridgeService.getBLEService().connectToDevice(deviceId);
  };

  const disconnectBLEDevice = async () => {
    if (!bridgeService) return;
    
    addLog({
      type: 'ble',
      direction: 'outgoing',
      message: 'Disconnecting BLE device',
    });
    
    await bridgeService.getBLEService().disconnect();
  };

  const startBridge = async () => {
    if (!bridgeService) throw new Error('Bridge service not initialized');
    await bridgeService.startBridge();
  };

  const stopBridge = async () => {
    if (!bridgeService) return;
    await bridgeService.stopBridge();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bridgeService && bridgeService.cleanup) {
        bridgeService.cleanup();
      }
    };
  }, [bridgeService]);

  const value: BridgeContextType = {
    bridgeService,
    bridgeStatus,
    isConnected: bridgeStatus.websocket === 'connected',
    isFullyConnected: bridgeService?.isFullyConnected() || false,
    logs,
    addLog,
    clearLogs,
    connectWebSocket,
    disconnectWebSocket,
    bleDevices,
    connectedBLEDevice,
    isScanning,
    startBLEScan,
    stopBLEScan,
    connectBLEDevice,
    disconnectBLEDevice,
    startBridge,
    stopBridge,
  };

  return (
    <BridgeContext.Provider value={value}>
      {children}
    </BridgeContext.Provider>
  );
};
