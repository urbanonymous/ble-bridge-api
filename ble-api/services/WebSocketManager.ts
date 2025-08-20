// Define the WebSocket server URL (replace with your actual backend URL)
const WEBSOCKET_URL = 'ws://your-backend-server.com/ws'; // Example URL

class WebSocketManager {
  private ws: WebSocket | null = null;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private onMessageCallback: ((data: any) => void) | null = null;
  private onStatusChangeCallback: ((status: string) => void) | null = null;

  constructor() {
    console.log('WebSocket Manager Initialized');
  }

  connect(): void {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      console.log('WebSocket already connecting or connected.');
      return;
    }

    console.log(`Connecting to WebSocket at ${WEBSOCKET_URL}...`);
    this.updateStatus('connecting');

    try {
      this.ws = new WebSocket(WEBSOCKET_URL);

      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        this.updateStatus('connected');
      };

      this.ws.onmessage = (event) => {
        console.log('WebSocket Message Received:', event.data);
        if (this.onMessageCallback) {
          try {
            const parsedData = JSON.parse(event.data); // Assuming JSON data
            this.onMessageCallback(parsedData);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
            // Optionally pass raw data if parsing fails
            // this.onMessageCallback(event.data);
          }
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        // The onclose event will usually fire shortly after an error.
        this.updateStatus('error');
        // TODO: Implement reconnection logic here or in onclose
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket Disconnected. Code:', event.code, 'Reason:', event.reason);
        // Avoid setting status to 'disconnected' if it was already set to 'error'
        if (this.connectionStatus !== 'error') {
          this.updateStatus('disconnected');
        }
        this.ws = null;
        // TODO: Implement robust reconnection strategy (e.g., exponential backoff)
      };
    } catch (error) {
        console.error("WebSocket connection failed:", error);
        this.updateStatus('error');
    }
  }

  disconnect(): void {
    if (this.ws) {
      console.log('Disconnecting WebSocket...');
      this.ws.close(1000, 'Client initiated disconnect'); // 1000 indicates a normal closure
    } else {
      console.log('WebSocket already disconnected.');
    }
  }

  sendMessage(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const message = JSON.stringify(data);
        console.log('Sending WebSocket Message:', message);
        this.ws.send(message);
      } catch (error) {
        console.error('Failed to stringify or send WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket not connected. Message not sent:', data);
      // TODO: Queue message if desired
    }
  }

  // Register a callback for incoming messages
  onMessage(callback: (data: any) => void): void {
    this.onMessageCallback = callback;
  }

  // Register a callback for status changes
  onStatusChange(callback: (status: string) => void): void {
    this.onStatusChangeCallback = callback;
    // Immediately provide the current status
    callback(this.connectionStatus);
  }

  private updateStatus(status: 'disconnected' | 'connecting' | 'connected' | 'error'): void {
    if (this.connectionStatus !== status) {
        this.connectionStatus = status;
        console.log(`WebSocket status changed: ${status}`);
        if (this.onStatusChangeCallback) {
            this.onStatusChangeCallback(status);
        }
    }
  }

  // TODO: Add cleanup method
}

// Export a singleton instance
const webSocketManagerInstance = new WebSocketManager();
export default webSocketManagerInstance; 