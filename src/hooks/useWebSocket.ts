import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8080/ws';

interface UseWebSocketOptions {
  userId: string | null;
  onNotification?: (notification: any) => void;
  onAdminAlert?: (alert: any) => void;
}

export function useWebSocket({ userId, onNotification, onAdminAlert }: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    if (!userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {}, // suppress debug logs
    });

    client.onConnect = () => {
      setConnected(true);

      // Subscribe to user-specific notifications
      client.subscribe(`/topic/notifications/${userId}`, (message) => {
        const notification = JSON.parse(message.body);
        onNotification?.(notification);
      });

      // Subscribe to broadcast notifications
      client.subscribe('/topic/notifications/broadcast', (message) => {
        const notification = JSON.parse(message.body);
        onNotification?.(notification);
      });

      // Subscribe to admin alerts (if admin role)
      const role = localStorage.getItem('role');
      if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MANAGER') {
        client.subscribe('/topic/admin/alerts', (message) => {
          const alert = JSON.parse(message.body);
          onAdminAlert?.(alert);
        });
      }
    };

    client.onDisconnect = () => {
      setConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('WebSocket STOMP error:', frame);
      setConnected(false);
    };

    client.activate();
    clientRef.current = client;
  }, [userId, onNotification, onAdminAlert]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { connected, disconnect };
}
