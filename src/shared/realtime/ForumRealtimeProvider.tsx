import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';
import {
  ActivationState,
  Client,
  type IMessage,
  type StompSubscription,
} from '@stomp/stompjs';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getFixedForumDestinations } from './forumDestinations';
import { buildForumWebSocketUrl, parseRealtimeForumEvent } from './forumRealtime';
import {
  ForumRealtimeContext,
  type ForumRealtimeConnectionStatus,
  type ForumRealtimeContextValue,
  type ForumRealtimeEventListener,
} from './forumRealtimeContext';

const HEARTBEAT_INTERVAL_MS = 10_000;
const RECONNECT_DELAY_MS = 5_000;
const CONNECTION_TIMEOUT_MS = 10_000;

interface ConnectionSnapshot {
  userId: number | null;
  status: Exclude<ForumRealtimeConnectionStatus, 'idle' | 'offline'>;
}

interface ForumRealtimeProviderProps {
  children: ReactNode;
}

const getAccessToken = () => localStorage.getItem('accessToken');

const getConnectionStatus = (
  isAuthenticated: boolean,
  isOnline: boolean,
  hasAccessToken: boolean,
  userId: number | undefined,
  snapshot: ConnectionSnapshot,
): ForumRealtimeConnectionStatus => {
  if (!isAuthenticated) {
    return 'idle';
  }

  if (!isOnline) {
    return 'offline';
  }

  if (!hasAccessToken || userId === undefined) {
    return 'disconnected';
  }

  if (snapshot.userId !== userId) {
    return 'connecting';
  }

  return snapshot.status;
};

export const ForumRealtimeProvider = ({ children }: ForumRealtimeProviderProps) => {
  const isAuthenticated = useAuth((state: AuthState) => state.isAuthenticated);
  const userId = useAuth((state: AuthState) => state.user?.id);
  const userRole = useAuth((state: AuthState) => state.user?.role);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [connectionSnapshot, setConnectionSnapshot] = useState<ConnectionSnapshot>({
    userId: null,
    status: 'disconnected',
  });
  const clientRef = useRef<Client | null>(null);
  const listenersRef = useRef(new Set<ForumRealtimeEventListener>());

  const consumeMessage = useCallback((message: IMessage) => {
    const event = parseRealtimeForumEvent(message.body);

    if (!event) {
      return null;
    }

    listenersRef.current.forEach((listener) => listener(event));
    return event;
  }, []);

  const addEventListener = useCallback((listener: ForumRealtimeEventListener) => {
    listenersRef.current.add(listener);

    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const subscribe = useCallback(
    (destination: string, listener?: ForumRealtimeEventListener) => {
      const client = clientRef.current;

      if (!client?.connected) {
        return () => undefined;
      }

      const subscription = client.subscribe(destination, (message) => {
        const event = consumeMessage(message);

        if (event && listener) {
          listener(event);
        }
      });

      return () => {
        if (client.connected) {
          subscription.unsubscribe();
        }
      };
    },
    [consumeMessage],
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || userId === undefined || !userRole || !getAccessToken()) {
      return undefined;
    }

    let disposed = false;
    let fixedSubscriptions: StompSubscription[] = [];

    const updateStatus = (
      status: ConnectionSnapshot['status'],
    ) => {
      if (!disposed) {
        setConnectionSnapshot({ userId, status });
      }
    };

    const client = new Client({
      brokerURL: buildForumWebSocketUrl(
        import.meta.env.VITE_API_URL,
        window.location.origin,
      ),
      heartbeatIncoming: HEARTBEAT_INTERVAL_MS,
      heartbeatOutgoing: HEARTBEAT_INTERVAL_MS,
      reconnectDelay: RECONNECT_DELAY_MS,
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      discardWebsocketOnCommFailure: true,
    });

    client.beforeConnect = async () => {
      const accessToken = getAccessToken();

      if (!accessToken) {
        await client.deactivate();
        return;
      }

      client.connectHeaders = {
        Authorization: `Bearer ${accessToken}`,
      };
    };

    client.onChangeState = (state) => {
      if (state === ActivationState.ACTIVE && !client.connected) {
        updateStatus('connecting');
      } else if (state === ActivationState.INACTIVE) {
        updateStatus('disconnected');
      }
    };

    client.onConnect = () => {
      fixedSubscriptions = getFixedForumDestinations(userRole).map((destination) =>
        client.subscribe(destination, consumeMessage),
      );
      updateStatus('connected');
    };

    client.onWebSocketClose = () => {
      fixedSubscriptions = [];
      updateStatus(client.active ? 'reconnecting' : 'disconnected');
    };

    client.onWebSocketError = () => {
      updateStatus('reconnecting');
    };

    client.onStompError = () => {
      updateStatus(client.active ? 'reconnecting' : 'disconnected');
    };

    client.onHeartbeatLost = () => {
      updateStatus('reconnecting');
    };

    clientRef.current = client;
    client.activate();

    return () => {
      disposed = true;

      if (client.connected) {
        fixedSubscriptions.forEach((subscription) => subscription.unsubscribe());
      }

      fixedSubscriptions = [];

      if (clientRef.current === client) {
        clientRef.current = null;
      }

      void client.deactivate();
    };
  }, [consumeMessage, isAuthenticated, userId, userRole]);

  const status = getConnectionStatus(
    isAuthenticated,
    isOnline,
    Boolean(getAccessToken()),
    userId,
    connectionSnapshot,
  );

  const contextValue = useMemo<ForumRealtimeContextValue>(
    () => ({
      status,
      isConnected: status === 'connected',
      subscribe,
      addEventListener,
    }),
    [addEventListener, status, subscribe],
  );

  return (
    <ForumRealtimeContext.Provider value={contextValue}>
      {children}
    </ForumRealtimeContext.Provider>
  );
};
