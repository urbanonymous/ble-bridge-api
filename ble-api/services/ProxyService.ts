import bleManagerInstance from './BleManager';
import webSocketManagerInstance from './WebSocketManager';
import { Device } from 'react-native-ble-plx';

// Define a type for status updates to the UI
type ProxyStatusUpdateCallback = (status: { service: string; ble: string; ws: string; error?: string | null }) => void;

class ProxyService {
  private isRunning: boolean = false;
  private bleDevice: Device | null = null;
  private status: { service: string; ble: string; ws: string; error?: string | null } = {
    service: 'stopped',
    ble: '-',
    ws: 'disconnected',
    error: null,
  };
  private statusUpdateCallback: ProxyStatusUpdateCallback | null = null;

  constructor() {
    console.log('Proxy Service Initialized');
    this.setupStatusListeners();
  }

  // Register a callback for the UI to receive status updates
  onStatusUpdate(callback: ProxyStatusUpdateCallback): void {
    this.statusUpdateCallback = callback;
    // Immediately send the current status
    this.notifyStatusUpdate();
  }

  private notifyStatusUpdate(): void {
    if (this.statusUpdateCallback) {
      this.statusUpdateCallback({ ...this.status }); // Send a copy
    }
  }

  private updateStatus(newStatus: Partial<typeof this.status>): void {
    // Clear error when status changes, unless the new status *is* an error
    const clearError = !('error' in newStatus && newStatus.error);
    this.status = {
      ...this.status,
      ...newStatus,
      error: clearError ? null : (newStatus.error || this.status.error), // Preserve existing error if new status doesn't explicitly clear/set it
    };
    console.log('Proxy Status Updated:', JSON.stringify(this.status));
    this.notifyStatusUpdate();
  }

  // Listen to status changes from underlying services
  private setupStatusListeners(): void {
    bleManagerInstance.onStatusUpdate((bleStatus, deviceName) => {
      let displayStatus = bleStatus;
      if (deviceName && (bleStatus === 'connected' || bleStatus === 'subscribed')) {
        displayStatus = `${bleStatus} (${deviceName})`;
      }
      this.updateStatus({ ble: displayStatus });

      // Handle BLE errors shown in status
      if (bleStatus.startsWith('error_')) {
        this.updateStatus({ service: 'error', error: `BLE Error: ${bleStatus}` });
        // Attempt to stop everything on critical BLE errors
        this.stop();
      }
    });

    webSocketManagerInstance.onStatusChange((wsStatus) => {
      this.updateStatus({ ws: wsStatus });
      if (wsStatus === 'error') {
        this.updateStatus({ service: 'error', error: 'WebSocket Error' });
        // Optionally attempt to stop or just let reconnect logic handle it
      } else if (wsStatus === 'disconnected' && this.status.service === 'running') {
        // If WS disconnects while service is supposed to be running, maybe retry?
        console.warn('WebSocket disconnected while proxy service is running.');
        // TODO: Implement reconnect logic or rely on WebSocketManager's internal retry
      }
    });

    // Listen for data from BLE
    bleManagerInstance.onDataReceived((data) => {
      // Relay data to WebSocket
      webSocketManagerInstance.sendMessage({ type: 'ble_data', payload: data });
    });

    // Listen for data from WebSocket (if backend needs to send commands to BLE)
    webSocketManagerInstance.onMessage((data) => {
      console.log('Proxy received WS message:', data);
      // Example: Handle commands from backend
      if (data && data.type === 'command' && data.target === 'ble') {
        console.log('Received command for BLE:', data.payload);
        // TODO: Implement bleManagerInstance.writeCharacteristic(data.payload) when available
      }
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Proxy Service already running.');
      return;
    }
    this.updateStatus({ service: 'starting', ble: '-', ws: 'disconnected', error: null });
    this.isRunning = true;

    try {
      // 1. Request Permissions
      this.updateStatus({ ble: 'permission_request' });
      const permissionsGranted = await bleManagerInstance.requestPermissions();
      if (!permissionsGranted) {
        throw new Error('Required permissions not granted.');
      }
      this.updateStatus({ ble: 'permission_granted' });

      // 2. Scan for BLE Device
      this.updateStatus({ ble: 'scanning' });
      this.bleDevice = await new Promise<Device>((resolve, reject) => {
        bleManagerInstance.scanForDevice(
          (device) => resolve(device), // Resolve promise when device found
          (found) => {
            if (!found) {
              reject(new Error('Target BLE device not found.'));
            }
            // If found, promise is already resolved, do nothing here
          }
        );
      });
      // Status updated internally by BleManager listener

      // 3. Connect to BLE Device
      this.updateStatus({ ble: 'connecting' });
      await bleManagerInstance.connectToDevice(this.bleDevice.id);
      // Status updated internally by BleManager listener (connected, subscribed)

      // 4. Connect to WebSocket
      this.updateStatus({ ws: 'connecting' });
      webSocketManagerInstance.connect();
      // Status updated internally by WebSocketManager listener

      // 5. Service is now running
      this.updateStatus({ service: 'running' });
      console.log('Proxy Service Started Successfully');
    } catch (error: any) {
      console.error('Failed to start Proxy Service:', error);
      this.updateStatus({ service: 'error', error: error.message || 'Unknown start error' });
      await this.stop(); // Ensure cleanup on startup failure
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning && this.status.service !== 'starting') { // Allow stopping during failed start
      console.log('Proxy Service already stopped or not running.');
      // Ensure status reflects stopped state if called externally
      if (this.status.service !== 'stopped') {
        this.updateStatus({ service: 'stopped', ble: '-', ws: 'disconnected' });
      }
      return;
    }
    const wasStarting = this.status.service === 'starting';
    this.updateStatus({ service: 'stopping' });
    console.log('Stopping Proxy Service...');

    // Stop scan just in case it's still running (e.g., during startup failure)
    bleManagerInstance.stopScan();

    // Disconnect WebSocket first
    this.updateStatus({ ws: 'disconnecting' });
    webSocketManagerInstance.disconnect(); // Status updated internally

    // Disconnect BLE
    if (this.bleDevice) {
      this.updateStatus({ ble: 'disconnecting' });
      try {
        await bleManagerInstance.disconnectDevice();
      } catch (disconnectError) {
        console.error('Error during BLE disconnect in stop:', disconnectError);
        // Continue stopping process
      }
    }

    this.bleDevice = null;
    this.isRunning = false;
    // Final status update (unless it was a failed start, keep error status)
    if (!wasStarting || !this.status.error) {
      this.updateStatus({ service: 'stopped', ble: '-', ws: 'disconnected', error: null });
    }
    console.log('Proxy Service Stopped.');
  }

  // TODO: Implement destroy method to clean up listeners
}

// Export a singleton instance
const proxyServiceInstance = new ProxyService();
export default proxyServiceInstance; 