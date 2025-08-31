# BLE Bridge API Implementation

This app provides a bridge between Bluetooth Low Energy (BLE) devices and WebSocket APIs. It features two main screens:

## Features

### 1. WebSocket Connection Screen (First Tab)
- Connect to WebSocket API endpoints
- Real-time status monitoring 
- Message logging and display
- Automatic reconnection support
- Bridge service integration

### 2. BLE Device Connection Screen (Second Tab)
- Scan for nearby BLE devices
- Connect to BLE devices
- View device characteristics
- Monitor BLE status and permissions

### 3. Bridge Service
The bridge service connects both functionalities, allowing:
- WebSocket commands to control BLE operations
- BLE data to be forwarded via WebSocket
- Bidirectional communication between BLE devices and web APIs

## Architecture

### Services
- **WebSocketService**: Handles WebSocket connections with auto-reconnect
- **BLEService**: Manages BLE device discovery, connection, and data transfer
- **BridgeService**: Orchestrates communication between WebSocket and BLE services

### Key Components
- **WebSocket Screen**: Input for API endpoint, connection status, message display
- **BLE Screen**: Device scanning, connection management, characteristic viewing
- **Tab Navigation**: Easy switching between WebSocket and BLE functionality

## Usage

1. **Connect to WebSocket API**:
   - Enter your WebSocket API URL (default: ws://localhost:8080)
   - Tap "Connect" to establish connection
   - Monitor connection status and messages

2. **Connect to BLE Device**:
   - Ensure Bluetooth is enabled
   - Tap "Start Scan" to discover nearby devices
   - Tap on a device to connect
   - View available characteristics after connection

3. **Bridge Functionality**:
   - Once both WebSocket and BLE are connected, the bridge automatically enables
   - BLE notifications are forwarded to the WebSocket API
   - WebSocket commands can control BLE operations

## WebSocket Message Protocol

The bridge service supports these message types:

### Incoming (WebSocket → BLE)
- `device_scan_start`: Start BLE device scanning
- `device_scan_stop`: Stop BLE device scanning  
- `device_connect`: Connect to specific BLE device
- `device_disconnect`: Disconnect from BLE device
- `characteristic_read`: Read BLE characteristic
- `characteristic_write`: Write to BLE characteristic
- `characteristic_subscribe`: Subscribe to BLE notifications

### Outgoing (BLE → WebSocket)
- `device_discovered`: New devices found during scan
- `device_connected`: BLE device connected
- `device_disconnected`: BLE device disconnected
- `characteristic_notification`: BLE notification data
- `status_update`: Bridge status changes
- `error`: Error messages

## Permissions

### Android
- BLUETOOTH
- BLUETOOTH_ADMIN  
- ACCESS_COARSE_LOCATION
- ACCESS_FINE_LOCATION
- BLUETOOTH_SCAN (Android 12+)
- BLUETOOTH_CONNECT (Android 12+)

## Installation

```bash
# Install dependencies
bun install

# Run on Android  
bun run android

# Run on web
bun run web
```

## Development

The app is built with:
- React Native + Expo
- TypeScript
- react-native-ble-plx for BLE functionality
- WebSocket API for real-time communication
- Tab-based navigation

All services are designed to be modular and can be extended for additional functionality.
