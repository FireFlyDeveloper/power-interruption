'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../AuthContext';

interface RealtimeUpdate {
  type: 'connected' | 'device_update' | 'event' | 'event_resolved' | 'heartbeat' | 'initial';
  data?: any;
  timestamp: string;
}

interface UseRealtimeOptions {
  onDeviceUpdate?: (device: any) => void;
  onNewEvent?: (event: any) => void;
  onEventResolved?: (eventId: string, data: any) => void;
  onInitialData?: (data: { devices: any[]; activeEvents: any[] }) => void;
  onConnected?: () => void;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { onDeviceUpdate, onNewEvent, onEventResolved, onInitialData, onConnected } = options;
  const { isAuthenticated } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  const connect = useCallback(() => {
    if (!isAuthenticated || eventSourceRef.current || isConnectingRef.current) {
      return;
    }

    isConnectingRef.current = true;

    try {
      const token = localStorage.getItem('power-interruption-token');
      if (!token) {
        isConnectingRef.current = false;
        return;
      }

      console.log('[SSE] Connecting to real-time updates...');

      // Create EventSource with auth header via URL param (EventSource doesn't support headers)
      const es = new EventSource(`/sse/updates?token=${encodeURIComponent(token)}`);
      eventSourceRef.current = es;

      es.onopen = () => {
        console.log('[SSE] Connected to real-time updates');
        isConnectingRef.current = false;
        onConnected?.();
      };

      es.onmessage = (event) => {
        try {
          const update: RealtimeUpdate = JSON.parse(event.data);
          console.log('[SSE] Received:', update.type, update);

          switch (update.type) {
            case 'initial':
              onInitialData?.(update.data);
              break;
            case 'device_update':
              onDeviceUpdate?.(update.data);
              break;
            case 'event':
              onNewEvent?.(update.data);
              break;
            case 'event_resolved':
              onEventResolved?.(update.data.eventId, update.data);
              break;
            case 'connected':
              console.log('[SSE] Connection confirmed:', update.timestamp);
              break;
            case 'heartbeat':
              // Heartbeat received, connection is alive
              break;
          }
        } catch (error) {
          console.error('[SSE] Error parsing message:', error);
        }
      };

      es.onerror = (error) => {
        console.error('[SSE] Connection error:', error);
        isConnectingRef.current = false;

        // Close current connection
        es.close();
        eventSourceRef.current = null;

        // Attempt reconnection after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[SSE] Attempting reconnection...');
          connect();
        }, 5000);
      };
    } catch (error) {
      console.error('[SSE] Failed to connect:', error);
      isConnectingRef.current = false;
    }
  }, [isAuthenticated, onDeviceUpdate, onNewEvent, onEventResolved, onInitialData, onConnected]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      console.log('[SSE] Disconnecting...');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    isConnectingRef.current = false;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: !!eventSourceRef.current,
    disconnect,
    reconnect: connect,
  };
}
