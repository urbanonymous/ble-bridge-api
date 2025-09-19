import { WebSocketService, WebSocketMessage, WebSocketRawMessage } from './WebSocketService';
import { BLEService, BLEMessage, BLEDeviceInfo } from './BLEService';

export interface BridgeConfig {
  websocketUrl: string;
  autoReconnect?: boolean;
  logMessages?: boolean;
}

export interface BridgeStatus {
  websocket: 'disconnected' | 'connecting' | 'connected' | 'error';
  ble: 'unknown' | 'unsupported' | 'unauthorized' | 'powered_off' | 'powered_on' | 'scanning' | 'connecting' | 'connected' | 'disconnected';
  bridgeActive: boolean;
}

export type BridgeMessageType = 
  | 'device_scan_start'
  | 'device_scan_stop'
  | 'device_connect'
  | 'device_disconnect'
  | 'device_discovered'
  | 'device_connected'
  | 'device_disconnected'
  | 'characteristic_read'
  | 'characteristic_write'
  | 'characteristic_subscribe'
  | 'characteristic_unsubscribe'
  | 'characteristic_notification'
  | 'status_update'
  | 'error';

export interface BridgeMessage {
  type: BridgeMessageType;
  payload: any;
  timestamp: number;
  source: 'websocket' | 'ble' | 'bridge';
}

export class BridgeService {
  private websocketService: WebSocketService;
  private bleService: BLEService;
  private config: BridgeConfig;
  private bridgeActive = false;
  private statusListeners: ((status: BridgeStatus) => void)[] = [];
  private messageListeners: ((message: BridgeMessage) => void)[] = [];
  private subscriptions: (() => void)[] = [];

  constructor(config: BridgeConfig) {
    this.config = {
      autoReconnect: true,
      logMessages: true,
      ...config,
    };

    this.websocketService = new WebSocketService({
      url: config.websocketUrl,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
    });

    try {
      this.bleService = new BLEService();
      this.setupEventListeners();
    } catch (error) {
      console.warn('BLE Service initialization failed:', error);
      // BLE will be unavailable but WebSocket can still work
      throw new Error(`BLE initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private setupEventListeners(): void {
    // WebSocket JSON message listener (control messages)
    this.subscriptions.push(
      this.websocketService.addMessageListener((message: WebSocketMessage) => {
        this.handleWebSocketMessage(message);
      })
    );

    // WebSocket raw message listener (data for BLE)
    this.subscriptions.push(
      this.websocketService.addRawMessageListener((message: WebSocketRawMessage) => {
        this.handleWebSocketRawMessage(message);
      })
    );

    // WebSocket status listener
    this.subscriptions.push(
      this.websocketService.addStatusListener((status) => {
        this.notifyStatusChange();
        
        if (status === 'connected' && this.config.autoReconnect) {
          this.sendStatusUpdate();
        }
      })
    );

    // BLE message listener
    this.subscriptions.push(
      this.bleService.addMessageListener((message: BLEMessage) => {
        this.handleBLEMessage(message);
      })
    );

    // BLE status listener
    this.subscriptions.push(
      this.bleService.addStatusListener((status) => {
        this.notifyStatusChange();
        this.sendStatusUpdate();
      })
    );

    // BLE device discovery listener
    this.subscriptions.push(
      this.bleService.addDeviceListener((devices: BLEDeviceInfo[]) => {
        this.sendDeviceList(devices);
      })
    );
  }

  async startBridge(): Promise<void> {
    try {
      this.log('Starting bridge service...');
      
      // Connect to WebSocket
      await this.websocketService.connect();
      
      this.bridgeActive = true;
      this.notifyStatusChange();
      
      // Send initial status
      this.sendStatusUpdate();
      
      this.log('Bridge service started successfully');
    } catch (error) {
      this.log('Failed to start bridge service:', error);
      throw error;
    }
  }

  async stopBridge(): Promise<void> {
    this.log('Stopping bridge service...');
    
    this.bridgeActive = false;
    
    // Disconnect services
    this.websocketService.disconnect();
    await this.bleService.disconnect();
    
    this.notifyStatusChange();
    this.log('Bridge service stopped');
  }

  private async handleWebSocketMessage(message: WebSocketMessage): Promise<void> {
    this.log('Received WebSocket message:', message);

    try {
      switch (message.type) {
        case 'device_scan_start':
          await this.bleService.startScanning(message.data?.duration || 10000);
          break;

        case 'device_scan_stop':
          this.bleService.stopScanning();
          break;

        case 'device_connect':
          if (message.data?.deviceId) {
            await this.bleService.connectToDevice(message.data.deviceId);
            this.sendBridgeMessage('device_connected', {
              deviceId: message.data.deviceId,
              device: this.bleService.getConnectedDevice(),
            });
          }
          break;

        case 'device_disconnect':
          await this.bleService.disconnect();
          this.sendBridgeMessage('device_disconnected', {});
          break;

        case 'characteristic_read':
          if (message.data?.serviceUUID && message.data?.characteristicUUID) {
            const value = await this.bleService.readCharacteristic(
              message.data.serviceUUID,
              message.data.characteristicUUID
            );
            this.sendBridgeMessage('characteristic_read', {
              serviceUUID: message.data.serviceUUID,
              characteristicUUID: message.data.characteristicUUID,
              value,
            });
          }
          break;

        case 'characteristic_write':
          if (message.data?.serviceUUID && message.data?.characteristicUUID && message.data?.value) {
            await this.bleService.writeCharacteristic(
              message.data.serviceUUID,
              message.data.characteristicUUID,
              message.data.value
            );
          }
          break;

        case 'characteristic_subscribe':
          if (message.data?.serviceUUID && message.data?.characteristicUUID) {
            await this.bleService.subscribeToCharacteristic(
              message.data.serviceUUID,
              message.data.characteristicUUID
            );
          }
          break;

        default:
          this.log('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      this.log('Error handling WebSocket message:', error);
      this.sendBridgeMessage('error', {
        message: error instanceof Error ? error.message : 'Unknown error',
        originalMessage: message,
      });
    }
  }

  private async handleWebSocketRawMessage(message: WebSocketRawMessage): Promise<void> {
    this.log('Received raw WebSocket data, forwarding to BLE device:', {
      dataLength: message.data.length,
      preview: message.data.substring(0, 50) + (message.data.length > 50 ? '...' : '')
    });

    try {
      // Send raw data to BLE device (we'll use the first writable characteristic found)
      await this.sendRawDataToBLE(message.data);
    } catch (error) {
      this.log('Error forwarding raw data to BLE:', error);
      this.sendBridgeMessage('error', {
        message: `Failed to forward raw data to BLE: ${error instanceof Error ? error.message : 'Unknown error'}`,
        originalData: message.data.substring(0, 100) // Only log first 100 chars
      });
    }
  }

  private async sendRawDataToBLE(data: string): Promise<void> {
    const connectedDevice = this.bleService.getConnectedDevice();
    if (!connectedDevice) {
      throw new Error('No BLE device connected');
    }

    try {
      // Find the first writable characteristic
      const services = await connectedDevice.services();
      
      for (const service of services) {
        const characteristics = await service.characteristics();
        
        for (const char of characteristics) {
          if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
            this.log(`📤 Writing raw data to BLE characteristic ${char.uuid.substring(0, 8)}`, {
              serviceUUID: service.uuid.substring(0, 8),
              characteristicUUID: char.uuid.substring(0, 8),
              dataLength: data.length
            });

            // Convert string to base64 if needed (BLE expects base64)
            const base64Data = btoa(data);
            
            await connectedDevice.writeCharacteristicWithResponseForService(
              service.uuid,
              char.uuid,
              base64Data
            );
            
            this.log('✅ Raw data sent to BLE device successfully');
            return;
          }
        }
      }
      
      throw new Error('No writable characteristics found on BLE device');
    } catch (error) {
      throw new Error(`Failed to send data to BLE: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private handleBLEMessage(message: BLEMessage): void {
    this.log('Received BLE message:', message);
    
    // Forward BLE notifications to WebSocket
    this.sendBridgeMessage('characteristic_notification', {
      deviceId: message.deviceId,
      serviceUUID: message.serviceUUID,
      characteristicUUID: message.characteristicUUID,
      data: message.data,
      timestamp: message.timestamp,
    });
  }

  private sendBridgeMessage(type: BridgeMessageType, payload: any): void {
    const bridgeMessage: BridgeMessage = {
      type,
      payload,
      timestamp: Date.now(),
      source: 'bridge',
    };

    // Send to WebSocket
    if (this.websocketService.isConnected()) {
      this.websocketService.sendData(type, payload);
    }

    // Notify local listeners
    this.notifyMessageListeners(bridgeMessage);
  }

  private sendStatusUpdate(): void {
    const status = this.getStatus();
    this.sendBridgeMessage('status_update', status);
  }

  private sendDeviceList(devices: BLEDeviceInfo[]): void {
    this.sendBridgeMessage('device_discovered', { devices });
  }

  getStatus(): BridgeStatus {
    return {
      websocket: this.websocketService.getStatus(),
      ble: this.bleService.getStatus(),
      bridgeActive: this.bridgeActive,
    };
  }

  isBridgeActive(): boolean {
    return this.bridgeActive;
  }

  isFullyConnected(): boolean {
    return (
      this.bridgeActive &&
      this.websocketService.isConnected() &&
      this.bleService.getStatus() === 'powered_on'
    );
  }

  getBLEService(): BLEService {
    return this.bleService;
  }

  getWebSocketService(): WebSocketService {
    return this.websocketService;
  }

  addStatusListener(listener: (status: BridgeStatus) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      const index = this.statusListeners.indexOf(listener);
      if (index > -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  addMessageListener(listener: (message: BridgeMessage) => void): () => void {
    this.messageListeners.push(listener);
    return () => {
      const index = this.messageListeners.indexOf(listener);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }

  private notifyStatusChange(): void {
    const status = this.getStatus();
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in status listener:', error);
      }
    });
  }

  private notifyMessageListeners(message: BridgeMessage): void {
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  private log(message: string, data?: any): void {
    if (this.config.logMessages) {
      if (data) {
        console.log(`[Bridge] ${message}`, data);
      } else {
        console.log(`[Bridge] ${message}`);
      }
    }
  }

  destroy(): void {
    this.log('Destroying bridge service...');
    
    // Remove all subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    
    // Stop bridge
    this.stopBridge();
    
    // Destroy services
    this.bleService.destroy();
  }
}
