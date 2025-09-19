export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface WebSocketRawMessage {
  data: string;
  timestamp: number;
  isBinary?: boolean; // when true, data is base64-encoded binary payload
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private status: WebSocketStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageListeners: ((message: WebSocketMessage) => void)[] = [];
  private rawMessageListeners: ((message: WebSocketRawMessage) => void)[] = [];
  private statusListeners: ((status: WebSocketStatus) => void)[] = [];

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      ...config,
    };
  }

  private bytesToBase64(bytes: Uint8Array): string {
    let binaryString = '';
    for (let i = 0; i < bytes.length; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    // btoa is available in React Native via JSCore
    return btoa(binaryString);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      console.log('🔍 WebSocket connecting to URL:', this.config.url);
      this.setStatus('connecting');
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        this.setStatus('connected');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          // If data is already an object with a type, treat it as a JSON message
          if (event && event.data && typeof event.data === 'object') {
            const maybeObj: any = event.data;
            // Node-like Buffer sent over WS may appear as { type: 'Buffer', data: [...] }
            if (maybeObj && maybeObj.type === 'Buffer' && Array.isArray(maybeObj.data)) {
              const base64 = this.bytesToBase64(Uint8Array.from(maybeObj.data));
              const rawMessage: WebSocketRawMessage = {
                data: base64,
                isBinary: true,
                timestamp: Date.now(),
              };
              console.log('[WebSocket] Binary buffer received, forwarding to BLE (base64)');
              this.notifyRawMessageListeners(rawMessage);
              return;
            }

            if (maybeObj && typeof maybeObj.byteLength === 'number') {
              // ArrayBuffer
              const base64 = this.bytesToBase64(new Uint8Array(maybeObj as ArrayBuffer));
              const rawMessage: WebSocketRawMessage = {
                data: base64,
                isBinary: true,
                timestamp: Date.now(),
              };
              console.log('[WebSocket] ArrayBuffer received, forwarding to BLE (base64)');
              this.notifyRawMessageListeners(rawMessage);
              return;
            }

            if (maybeObj && typeof maybeObj.type === 'string') {
              const message: WebSocketMessage = {
                type: maybeObj.type,
                data: maybeObj.data ?? maybeObj,
                timestamp: Date.now(),
              };
              console.log('[WebSocket] JSON object message received:', message.type);
              this.notifyMessageListeners(message);
              return;
            }
          }

          // If string, try parse as JSON first (control messages)
          if (typeof event.data === 'string') {
            try {
              const message: WebSocketMessage = JSON.parse(event.data);
              console.log('[WebSocket] JSON message received:', message.type);
              this.notifyMessageListeners(message);
              return;
            } catch {
              // Not JSON, treat as raw string
              const rawMessage: WebSocketRawMessage = {
                data: event.data,
                isBinary: false,
                timestamp: Date.now(),
              };
              console.log('[WebSocket] Raw string received, forwarding to BLE:', {
                dataType: typeof event.data,
                dataLength: event.data.length,
                preview: event.data.length > 50 ? event.data.substring(0, 50) + '...' : event.data
              });
              this.notifyRawMessageListeners(rawMessage);
              return;
            }
          }

          // Other data types are currently unsupported; log and ignore
          console.warn('[WebSocket] Received unsupported data type:', typeof event.data, event.data);
        } catch (e) {
          console.error('[WebSocket] Error handling onmessage:', e);
        }
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.setStatus('error');
        reject(error);
      };
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setStatus('disconnected');
  }

  send(message: WebSocketMessage): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  sendData(type: string, data: any): boolean {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now(),
    };
    return this.send(message);
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === 'connected';
  }

  getConfig(): WebSocketConfig {
    return this.config;
  }

  addMessageListener(listener: (message: WebSocketMessage) => void): () => void {
    this.messageListeners.push(listener);
    return () => {
      const index = this.messageListeners.indexOf(listener);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }

  addRawMessageListener(listener: (message: WebSocketRawMessage) => void): () => void {
    this.rawMessageListeners.push(listener);
    return () => {
      const index = this.rawMessageListeners.indexOf(listener);
      if (index > -1) {
        this.rawMessageListeners.splice(index, 1);
      }
    };
  }

  addStatusListener(listener: (status: WebSocketStatus) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      const index = this.statusListeners.indexOf(listener);
      if (index > -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  private setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.notifyStatusListeners(status);
    }
  }

  private notifyMessageListeners(message: WebSocketMessage): void {
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  private notifyRawMessageListeners(message: WebSocketRawMessage): void {
    this.rawMessageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in raw message listener:', error);
      }
    });
  }

  private notifyStatusListeners(status: WebSocketStatus): void {
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in status listener:', error);
      }
    });
  }

  private handleReconnect(): void {
    if (
      this.reconnectAttempts < (this.config.maxReconnectAttempts || 5) &&
      this.status !== 'disconnected'
    ) {
      this.reconnectAttempts++;
      this.reconnectTimer = setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
        this.connect().catch(() => {
          // Reconnection failed, will try again if attempts remain
        });
      }, this.config.reconnectInterval || 5000);
    }
  }
}
