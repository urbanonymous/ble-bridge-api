import { BleManager, Device, BleError, State, Characteristic, Subscription, BleRestoredState } from 'react-native-ble-plx';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import base64 from 'react-native-base64'; // Required for decoding characteristic values

// Define the target device name (replace with actual Brilliant Frames name if known)
const TARGET_DEVICE_NAME = 'Brilliant Frames'; // Or partial name
const DATA_SERVICE_UUID = 'replace-with-your-service-uuid'; // Example: '0000xxxx-0000-1000-8000-00805f9b34fb'
const DATA_CHARACTERISTIC_UUID = 'replace-with-your-characteristic-uuid'; // Example: '0000yyyy-0000-1000-8000-00805f9b34fb'

// Define a type for the data callback
type DataCallback = (data: any) => void; // Use a more specific type if data format is known

class BluetoothLowEnergyManager {
  private manager: BleManager;
  private device: Device | null = null;
  private connectionSubscription: Subscription | null = null;
  private characteristicSubscription: Subscription | null = null;
  private onDataReceivedCallback: DataCallback | null = null;
  private onStatusUpdateCallback: ((status: string, deviceName?: string) => void) | null = null;

  constructor() {
    this.manager = new BleManager({
      restoreStateIdentifier: 'bleBridgeRestoreState',
      restoreStateFunction: (restoredState: BleRestoredState | null) => {
        if (restoredState == null) {
          // BleManager was constructed for the first time.
          console.log('BLE Manager: No state to restore.');
        } else {
          // BleManager was restored. Check `restoredState.connectedPeripherals` property.
          console.log('BLE Manager: Restored state:', restoredState);
          // TODO: Handle restored state, potentially reconnecting to peripherals
          // this.device = restoredState.connectedPeripherals[0]; // Example
          // if (this.device) {
          //     this.updateStatus('restored_connecting', this.device.name);
          //     // Re-establish connection monitoring and characteristic subscriptions
          //     this.connectToDevice(this.device.id, true); // Add flag to skip discovery if possible
          // }
        }
      },
    });
    console.log('BLE Manager Initialized');
    this.subscribeToStateChanges();
  }

  // Listen to BLE state changes (e.g., Bluetooth powered on/off)
  private subscribeToStateChanges() {
    this.manager.onStateChange((state: State) => {
      console.log('BLE State Changed:', state);
      if (state === State.PoweredOn) {
        this.updateStatus('ready');
        // TODO: Optionally trigger scan automatically if needed
      } else {
        this.updateStatus('ble_off');
        // TODO: Handle other states (PoweredOff, Unauthorized, etc.) - Stop scans/disconnect?
        if (this.device) {
          this.disconnectDevice(false); // Disconnect without explicit request if BLE turns off
        }
      }
    }, true); // Emit the current state immediately
  }

  // Register callback for status updates
  onStatusUpdate(callback: (status: string, deviceName?: string) => void): void {
    this.onStatusUpdateCallback = callback;
  }

  private updateStatus(status: string, deviceName?: string): void {
    console.log(`BLE Status: ${status}`, deviceName ? `(${deviceName})` : '');
    if (this.onStatusUpdateCallback) {
      this.onStatusUpdateCallback(status, deviceName || this.device?.name);
    }
  }

  // Register callback for received data
  onDataReceived(callback: DataCallback): void {
    this.onDataReceivedCallback = callback;
  }

  // Request necessary permissions (Android specific)
  async requestPermissions(): Promise<boolean> {
    this.updateStatus('permission_request');
    if (Platform.OS === 'android') {
      // Location permission is required for BLE scanning on Android >= 6
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        console.error('Location permission not granted.');
        this.updateStatus('error_permission');
        return false;
      }

      // TODO: Add Bluetooth permissions check using react-native-permissions or Expo's equivalent
      // For now, assume permissions are handled via Info.plist/AndroidManifest.xml setup
      console.log('Android Permissions check passed (Placeholder)');
      this.updateStatus('permission_granted');
      return true; // Placeholder
    }
    // iOS permissions are typically handled via Info.plist
    this.updateStatus('permission_granted');
    return true;
  }

  // Scan for the target device
  scanForDevice(onDeviceFound: (device: Device) => void, onScanComplete: (found: boolean) => void): void {
    this.updateStatus('scanning');
    let foundDevice = false;
    this.manager.startDeviceScan(null, null, (error: BleError | null, scannedDevice: Device | null) => {
      if (error) {
        console.error('Scan Error:', error);
        this.updateStatus('error_scan');
        this.stopScan();
        onScanComplete(false);
        return;
      }

      if (scannedDevice) {
        // console.log(`Device found: ${scannedDevice.name} (${scannedDevice.id})`); // Log less frequently
        if (scannedDevice.name?.includes(TARGET_DEVICE_NAME)) {
          console.log(`Target device "${TARGET_DEVICE_NAME}" found!`);
          foundDevice = true;
          this.stopScan();
          this.device = scannedDevice;
          onDeviceFound(scannedDevice);
        }
      }
    });

    setTimeout(() => {
      if (this.manager.isDeviceScanning()) {
        console.log('Scan timed out.');
        this.stopScan();
        if (!foundDevice) {
          this.updateStatus('error_notfound');
          onScanComplete(false);
        } else {
          // This case shouldn't happen if stopScan was called above, but for safety:
          onScanComplete(true);
        }
      } else if (foundDevice) {
        onScanComplete(true); // Scan stopped early because device was found
      }
    }, 15000);
  }

  // Stop scanning
  stopScan(): void {
    if (this.manager.isDeviceScanning()) {
      console.log('Stopping BLE scan.');
      this.manager.stopDeviceScan();
      // Don't change status here, let the caller decide based on outcome (found/timeout)
    }
  }

  // Connect to the discovered device
  async connectToDevice(deviceId: string): Promise<Device> {
    this.updateStatus('connecting', this.device?.name);
    try {
      // Cancel any pending connection attempts
      await this.manager.cancelDeviceConnection(deviceId).catch(() => { /* Ignore if not connected */ });
      console.log(`Attempting to connect to ${deviceId}...`);
      const connectedDevice = await this.manager.connectToDevice(deviceId, { autoConnect: false }); // Use autoConnect carefully
      console.log(`Connected to ${connectedDevice.name}`);
      this.device = connectedDevice; // Update device instance with connected one

      // Subscribe to disconnect events
      this.connectionSubscription = this.manager.onDeviceDisconnected(deviceId, (error: BleError | null, disconnectedDevice: Device | null) => {
        console.error(`Device ${disconnectedDevice?.name} disconnected!`, error);
        this.updateStatus('disconnected', disconnectedDevice?.name);
        this.cleanupConnection();
        // TODO: Implement auto-reconnect logic in ProxyService if needed
      });

      // Discover services and characteristics
      console.log('Discovering services and characteristics...');
      await connectedDevice.discoverAllServicesAndCharacteristics();
      console.log('Discovery complete.');

      // Subscribe to the data characteristic
      await this.subscribeToDataCharacteristic();

      this.updateStatus('connected', connectedDevice.name);
      return connectedDevice;
    } catch (error: any) {
      console.error(`Failed to connect to device ${deviceId}:`, error);
      this.updateStatus('error_connect', this.device?.name);
      this.cleanupConnection();
      throw error; // Re-throw error to be handled by the caller (ProxyService)
    }
  }

  // Disconnect from the currently connected device
  async disconnectDevice(requestedByUser: boolean = true): Promise<void> {
    if (!this.device) {
      console.log('No device connected to disconnect from.');
      return;
    }
    const deviceName = this.device.name;
    this.updateStatus('disconnecting', deviceName);
    console.log(`Disconnecting from ${deviceName}...`);

    try {
      // Unsubscribe from characteristics first
      if (this.characteristicSubscription) {
        this.characteristicSubscription.remove();
        this.characteristicSubscription = null;
        console.log('Unsubscribed from characteristic.');
      }

      const isConnected = await this.manager.isDeviceConnected(this.device.id);
      if (isConnected) {
        await this.manager.cancelDeviceConnection(this.device.id);
        console.log(`Disconnected from ${deviceName}.`);
      } else {
        console.log(`${deviceName} was already disconnected.`);
      }
    } catch (error) {
      console.error(`Error during disconnection from ${deviceName}:`, error);
      this.updateStatus('error_disconnect', deviceName);
      // Still attempt cleanup
    } finally {
      // Always clean up internal state
      if (requestedByUser) {
        this.updateStatus('disconnected', deviceName);
      }
      // If not requested by user (e.g., BLE off), status is already set by state change listener
      this.cleanupConnection();
    }
  }

  // Subscribe to the data characteristic notifications
  private async subscribeToDataCharacteristic(): Promise<void> {
    if (!this.device) {
      throw new Error('No device connected.');
    }
    console.log(`Subscribing to characteristic ${DATA_CHARACTERISTIC_UUID}...`);
    try {
      this.characteristicSubscription = this.device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        DATA_CHARACTERISTIC_UUID,
        (error: BleError | null, characteristic: Characteristic | null) => {
          if (error) {
            console.error('Characteristic Monitor Error:', error.message);
            this.updateStatus('error_monitor', this.device?.name);
            // Consider attempting to re-subscribe or disconnect fully
            this.disconnectDevice(false);
            return;
          }
          if (characteristic?.value) {
            // Decode the Base64 encoded value
            const decodedValue = base64.decode(characteristic.value);
            console.log('Received data (decoded):', decodedValue);

            // TODO: Parse the decodedValue based on expected format (e.g., string, JSON, bytes)
            let parsedData: any = decodedValue; // Placeholder
            try {
              // Attempt to parse as JSON if applicable
              // parsedData = JSON.parse(decodedValue);
            } catch (e) {
              console.warn('Received data is not valid JSON, using raw decoded value.');
            }

            if (this.onDataReceivedCallback) {
              this.onDataReceivedCallback(parsedData);
            }
          }
        }
      );
      console.log('Successfully subscribed to characteristic.');
      this.updateStatus('subscribed', this.device.name);
    } catch(error) {
      console.error(`Failed to subscribe to characteristic ${DATA_CHARACTERISTIC_UUID}:`, error);
      this.updateStatus('error_subscribe', this.device.name);
      throw error; // Propagate error
    }
  }

  // Clean up subscriptions and device reference
  private cleanupConnection(): void {
    if (this.connectionSubscription) {
      this.connectionSubscription.remove();
      this.connectionSubscription = null;
    }
    if (this.characteristicSubscription) {
      this.characteristicSubscription.remove();
      this.characteristicSubscription = null;
    }
    this.device = null;
    console.log('BLE connection resources cleaned up.');
    // Status should be updated by the caller (disconnectDevice or state listener)
  }

  // Destroy the BleManager instance
  destroy(): void {
    console.log('Destroying BLE Manager instance.');
    this.manager.destroy();
    // Nullify callbacks to prevent memory leaks
    this.onDataReceivedCallback = null;
    this.onStatusUpdateCallback = null;
  }

  // TODO: Implement writeCharacteristic if needed
}

// Export a singleton instance
const bleManagerInstance = new BluetoothLowEnergyManager();
export default bleManagerInstance; 