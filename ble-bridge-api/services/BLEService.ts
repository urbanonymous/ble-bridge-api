import { BleManager, Device, Characteristic, BleError, State } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

export interface BLEDeviceInfo {
  id: string;
  name: string | null;
  rssi: number | null;
  isConnectable: boolean | null;
}

export interface BLECharacteristic {
  uuid: string;
  serviceUUID: string;
  value?: string;
  isReadable: boolean;
  isWritable: boolean;
  isNotifiable: boolean;
}

export type BLEStatus = 'unknown' | 'unsupported' | 'unauthorized' | 'powered_off' | 'powered_on' | 'scanning' | 'connecting' | 'connected' | 'disconnected';

export interface BLEMessage {
  deviceId: string;
  characteristicUUID: string;
  serviceUUID: string;
  data: string;
  timestamp: number;
}

export class BLEService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private status: BLEStatus = 'unknown';
  private scanning = false;
  private deviceListeners: ((devices: BLEDeviceInfo[]) => void)[] = [];
  private statusListeners: ((status: BLEStatus) => void)[] = [];
  private messageListeners: ((message: BLEMessage) => void)[] = [];
  private discoveredDevices: Map<string, BLEDeviceInfo> = new Map();

  constructor() {
    this.manager = new BleManager();
    this.initializeBLE();
  }

  private async initializeBLE(): Promise<void> {
    // Check BLE state
    const subscription = this.manager.onStateChange((state: State) => {
      console.log('BLE State:', state);
      switch (state) {
        case State.Unknown:
          this.setStatus('unknown');
          break;
        case State.Unsupported:
          this.setStatus('unsupported');
          break;
        case State.Unauthorized:
          this.setStatus('unauthorized');
          break;
        case State.PoweredOff:
          this.setStatus('powered_off');
          break;
        case State.PoweredOn:
          this.setStatus('powered_on');
          break;
      }
    }, true);

    // Request permissions for Android
    if (Platform.OS === 'android') {
      await this.requestAndroidPermissions();
    }
  }

  private async requestAndroidPermissions(): Promise<boolean> {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ];

      // For Android 12+
      if (typeof Platform.Version === 'number' && Platform.Version >= 31) {
        permissions.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      return Object.values(granted).every(permission => 
        permission === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async startScanning(durationMs: number = 10000): Promise<void> {
    if (this.scanning) {
      return;
    }

    this.discoveredDevices.clear();
    this.scanning = true;
    this.setStatus('scanning');

    console.log('Starting BLE scan...');

    this.manager.startDeviceScan(null, null, (error: BleError | null, device: Device | null) => {
      if (error) {
        console.error('Scan error:', error);
        this.stopScanning();
        return;
      }

      if (device) {
        const deviceInfo: BLEDeviceInfo = {
          id: device.id,
          name: device.name,
          rssi: device.rssi,
          isConnectable: device.isConnectable,
        };

        this.discoveredDevices.set(device.id, deviceInfo);
        this.notifyDeviceListeners();
      }
    });

    // Stop scanning after duration
    setTimeout(() => {
      this.stopScanning();
    }, durationMs);
  }

  stopScanning(): void {
    if (this.scanning) {
      this.manager.stopDeviceScan();
      this.scanning = false;
      this.setStatus(this.connectedDevice ? 'connected' : 'powered_on');
      console.log('BLE scan stopped');
    }
  }

  async connectToDevice(deviceId: string): Promise<Device> {
    try {
      this.setStatus('connecting');
      console.log('Connecting to device:', deviceId);

      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();

      this.connectedDevice = device;
      this.setStatus('connected');

      // Set up disconnect listener
      device.onDisconnected((error: BleError | null, disconnectedDevice: Device) => {
        console.log('Device disconnected:', disconnectedDevice.id);
        this.connectedDevice = null;
        this.setStatus('disconnected');
      });

      console.log('Connected to device:', device.name || device.id);
      return device;
    } catch (error) {
      console.error('Connection error:', error);
      this.setStatus('powered_on');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
        this.connectedDevice = null;
        this.setStatus('powered_on');
        console.log('Disconnected from device');
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
  }

  async getServices(): Promise<any[]> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      return await this.connectedDevice.services();
    } catch (error) {
      console.error('Error getting services:', error);
      throw error;
    }
  }

  async getCharacteristics(serviceUUID: string): Promise<BLECharacteristic[]> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const characteristics = await this.connectedDevice.characteristicsForService(serviceUUID);
      
      return characteristics.map((char: Characteristic) => ({
        uuid: char.uuid,
        serviceUUID: char.serviceUUID,
        isReadable: char.isReadable,
        isWritable: char.isWritableWithResponse || char.isWritableWithoutResponse,
        isNotifiable: char.isNotifiable,
      }));
    } catch (error) {
      console.error('Error getting characteristics:', error);
      throw error;
    }
  }

  async readCharacteristic(serviceUUID: string, characteristicUUID: string): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const characteristic = await this.connectedDevice.readCharacteristicForService(
        serviceUUID,
        characteristicUUID
      );
      
      return characteristic.value || '';
    } catch (error) {
      console.error('Error reading characteristic:', error);
      throw error;
    }
  }

  async writeCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
    data: string
  ): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      await this.connectedDevice.writeCharacteristicWithResponseForService(
        serviceUUID,
        characteristicUUID,
        data
      );
    } catch (error) {
      console.error('Error writing characteristic:', error);
      throw error;
    }
  }

  async subscribeToCharacteristic(
    serviceUUID: string,
    characteristicUUID: string
  ): Promise<() => void> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const subscription = this.connectedDevice.monitorCharacteristicForService(
        serviceUUID,
        characteristicUUID,
        (error: BleError | null, characteristic: Characteristic | null) => {
          if (error) {
            console.error('Monitor error:', error);
            return;
          }

          if (characteristic && characteristic.value) {
            const message: BLEMessage = {
              deviceId: this.connectedDevice!.id,
              serviceUUID,
              characteristicUUID,
              data: characteristic.value,
              timestamp: Date.now(),
            };

            this.notifyMessageListeners(message);
          }
        }
      );

      return () => subscription.remove();
    } catch (error) {
      console.error('Error subscribing to characteristic:', error);
      throw error;
    }
  }

  getDiscoveredDevices(): BLEDeviceInfo[] {
    return Array.from(this.discoveredDevices.values());
  }

  getConnectedDevice(): Device | null {
    return this.connectedDevice;
  }

  getStatus(): BLEStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === 'connected' && this.connectedDevice !== null;
  }

  isScanning(): boolean {
    return this.scanning;
  }

  addDeviceListener(listener: (devices: BLEDeviceInfo[]) => void): () => void {
    this.deviceListeners.push(listener);
    return () => {
      const index = this.deviceListeners.indexOf(listener);
      if (index > -1) {
        this.deviceListeners.splice(index, 1);
      }
    };
  }

  addStatusListener(listener: (status: BLEStatus) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      const index = this.statusListeners.indexOf(listener);
      if (index > -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  addMessageListener(listener: (message: BLEMessage) => void): () => void {
    this.messageListeners.push(listener);
    return () => {
      const index = this.messageListeners.indexOf(listener);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }

  private setStatus(status: BLEStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.notifyStatusListeners(status);
    }
  }

  private notifyDeviceListeners(): void {
    const devices = this.getDiscoveredDevices();
    this.deviceListeners.forEach(listener => {
      try {
        listener(devices);
      } catch (error) {
        console.error('Error in device listener:', error);
      }
    });
  }

  private notifyStatusListeners(status: BLEStatus): void {
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in status listener:', error);
      }
    });
  }

  private notifyMessageListeners(message: BLEMessage): void {
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  destroy(): void {
    this.stopScanning();
    this.disconnect();
    this.manager.destroy();
  }
}
