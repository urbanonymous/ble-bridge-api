Project Overview:
You're developing a React Native app that serves as a proxy between a Bluetooth device (Brilliant Frames) and a Python backend. The goal of the system is to maintain a constant communication between the Bluetooth device and the backend server via WebSocket. The app facilitates the relaying of data between these two components, ensuring that the connection remains active even when the phone is locked or the app is in the background.

App Components:
Bluetooth Device (Brilliant Frames):

The React Native app will connect to the Bluetooth device and establish a stable connection using the Bluetooth Low Energy (BLE) protocol.

The app will handle data from the device (e.g., sensor readings, state changes) and relay it to the backend.

React Native App (Proxy):

The app acts as a proxy between the Bluetooth device and the backend server. It:

Connects to the Bluetooth device and reads or writes data as needed.

Connects to the Python WebSocket server, ensuring the data is continuously relayed between the Bluetooth device and the server in real-time.

The WebSocket connection ensures that the communication is persistent and can be updated live without interruptions.

Foreground Service: The React Native app runs a foreground service to ensure that the BLE and WebSocket connections remain active even if the phone is locked, the app is backgrounded, or the screen is off. This service prevents the system from terminating the app and maintains uninterrupted data flow.

Python Backend (WebSocket Server):

The backend exposes a WebSocket endpoint, which is responsible for receiving and transmitting data between the React Native app and other parts of the system.

The backend could perform additional processing on the data received from the app or forward it to other services as needed.

Flow of Operations:
Bluetooth Device Connection:

Upon starting the app, it first establishes a connection to the Bluetooth device using BLE.

The data from the Bluetooth device is read continuously as long as the connection is active.

WebSocket Connection:

After the Bluetooth device is connected, the React Native app establishes a WebSocket connection with the Python backend server.

The app will send the data collected from the Bluetooth device over the WebSocket connection to the backend server.

The server can then process, store, or relay this data as required.

Data Relay:

The React Native app serves as the intermediary, continuously relaying data between the Bluetooth device and the backend server.

Data could include sensor readings, state changes, or any other relevant information the Bluetooth device sends.

Foreground Service:

The app runs a foreground service to maintain the BLE and WebSocket connections even when the app is in the background or the phone is locked.

The foreground service uses a persistent notification to inform the user that the app is running in the background, ensuring the system does not kill the app, allowing the connections to stay alive.

Key Features:
Real-time communication via WebSocket to ensure constant data exchange without delays.

Bluetooth BLE support for seamless device interaction.

Proxy functionality in the React Native app to connect multiple devices and systems (Bluetooth and WebSocket) together.

Python backend to manage data, provide processing, or integrate with other services.

Foreground service to keep the BLE and WebSocket connections active even when the app is backgrounded or the phone is locked.

This architecture allows you to have a distributed system where the app and the backend can work independently, yet share data in real-time. The foreground service ensures that communication remains uninterrupted, providing a reliable solution for constant data exchange between the Bluetooth device and the server.

## Implementation Plan:

1.  **Project Setup & Cleanup:**
    *   Remove any remaining template/example code and components not relevant to the core proxy functionality.
    *   Install necessary dependencies:
        *   BLE library (e.g., `react-native-ble-plx`).
        *   WebSocket client (potentially using the built-in `WebSocket` API or a library like `ws`).
        *   Foreground service library (e.g., Expo's `expo-foreground-actions` or `react-native-foreground-service` if ejecting).
    *   Configure permissions for Bluetooth and foreground services (Android `AndroidManifest.xml`, iOS `Info.plist`).

2.  **BLE Module:**
    *   Create a dedicated module/service for handling BLE interactions.
    *   Implement device scanning logic specifically targeting "Brilliant Frames".
    *   Implement connection/disconnection logic.
    *   Implement reading/subscribing to relevant characteristics for data transfer.
    *   Implement writing to characteristics if control is needed.
    *   Manage BLE states and provide status updates (e.g., via context or state management).

3.  **WebSocket Module:**
    *   Create a dedicated module/service for handling WebSocket communication.
    *   Implement connection/disconnection logic to the Python backend endpoint.
    *   Handle WebSocket message sending (outgoing data from BLE).
    *   Handle WebSocket message receiving (incoming data/commands from backend, if applicable).
    *   Manage WebSocket states and provide status updates.

4.  **Proxy Service:**
    *   Create a central service that orchestrates the BLE and WebSocket modules.
    *   Listen for data updates from the BLE module.
    *   Relay received BLE data to the WebSocket module for transmission to the backend.
    *   (Optional) Relay commands received from the WebSocket module to the BLE module.
    *   Implement basic queuing or buffering for data if one connection drops temporarily while the other is active.

5.  **Foreground Service Integration:**
    *   Configure and integrate the chosen foreground service library.
    *   Define the background task that will run the core proxy logic (managing BLE connection, WebSocket connection, and data relay).
    *   Implement controls to start and stop the foreground service.
    *   Ensure the BLE and WebSocket connections are managed *within* the foreground task to persist when the app is backgrounded or the screen is off.
    *   Configure the persistent notification required by foreground services.

6.  **User Interface (UI):**
    *   Develop basic UI screens:
        *   Display BLE connection status (scanning, connecting, connected, device name).
        *   Display WebSocket connection status.
        *   Show logs or basic data flow for debugging/monitoring.
        *   Provide buttons to manually start/stop the proxy service.

7.  **Error Handling & Resilience:**
    *   Implement robust error handling for BLE operations (scan failures, connection errors, read/write errors).
    *   Implement robust error handling for WebSocket communication (connection failures, unexpected closures).
    *   Implement automatic reconnection strategies for both BLE and WebSocket connections.

8.  **Testing:**
    *   Unit/integration tests for BLE and WebSocket modules.
    *   End-to-end testing with the actual Brilliant Frames device and the Python WebSocket backend.
    *   Test background persistence thoroughly (locking screen, backgrounding app, killing app via task manager if foreground service permits restart).

9.  **Backend Coordination:**
    *   Define the exact WebSocket endpoint URL.
    *   Define the expected data format for messages exchanged between the app and the backend.