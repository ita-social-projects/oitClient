import { forumKeys } from '@shared/query/forumKeys';
import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';
import { getForumErrorStatus } from '@shared/utils/forumError';
import {
  ActivationState,
  Client,
  type IMessage,
  type StompSubscription,
} from '@stomp/stompjs';
import { useQueryClient } from '@tanstack/react-query';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getFixedForumDestinations } from './forumDestinations';
import {
  buildForumWebSocketUrl,
  createForumRealtimeEventBuffer,
  getForumConnectionKind,
  isServerBackedForumQueryKey,
  parseRealtimeForumEvent,
} from './forumRealtime';
import {
  ForumRealtimeContext,
  type ForumRealtimeConnectionStatus,
  type ForumRealtimeContextValue,
  type ForumRealtimeEventListener,
  type ForumRealtimeReconciliationStatus,
} from './forumRealtimeContext';

const HEARTBEAT_INTERVAL_MS = 10_000;
const RECONNECT_DELAY_MS = 5_000;
const CONNECTION_TIMEOUT_MS = 10_000;
const EXPECTED_RECONCILIATION_ERROR_STATUSES = new Set([403, 404]);

interface ConnectionSnapshot {
  userId: number | null;
  status: Exclude<ForumRealtimeConnectionStatus, 'idle' | 'offline'>;
}

interface ForumRealtimeProviderProps {
  children: ReactNode;
}

interface DynamicSubscriptionRegistration {
  destination: string;
  listener?: ForumRealtimeEventListener;
  subscription: StompSubscription | null;
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
  const queryClient = useQueryClient();
  const isAuthenticated = useAuth((state: AuthState) => state.isAuthenticated);
  const userId = useAuth((state: AuthState) => state.user?.id);
  const userRole = useAuth((state: AuthState) => state.user?.role);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [connectionSnapshot, setConnectionSnapshot] = useState<ConnectionSnapshot>({
    userId: null,
    status: 'disconnected',
  });
  const [reconciliationStatus, setReconciliationStatus] =
    useState<ForumRealtimeReconciliationStatus>('idle');
  const clientRef = useRef<Client | null>(null);
  const listenersRef = useRef(new Set<ForumRealtimeEventListener>());
  const dynamicSubscriptionsRef = useRef(
    new Set<DynamicSubscriptionRegistration>(),
  );
  const eventBufferRef = useRef(createForumRealtimeEventBuffer());

  const dispatchEvent = useCallback((event: Parameters<ForumRealtimeEventListener>[0]) => {
    listenersRef.current.forEach((listener) => listener(event));
  }, []);

  const consumeMessage = useCallback(
    (message: IMessage) => {
      const event = parseRealtimeForumEvent(message.body);

      if (!event) {
        return null;
      }

      if (eventBufferRef.current.capture(event)) {
        return null;
      }

      dispatchEvent(event);
      return event;
    },
    [dispatchEvent],
  );

  const addEventListener = useCallback((listener: ForumRealtimeEventListener) => {
    listenersRef.current.add(listener);

    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const activateDynamicSubscription = useCallback(
    (client: Client, registration: DynamicSubscriptionRegistration) => {
      registration.subscription = client.subscribe(
        registration.destination,
        (message) => {
          const event = consumeMessage(message);

          if (event && registration.listener) {
            registration.listener(event);
          }
        },
      );
    },
    [consumeMessage],
  );

  const subscribe = useCallback(
    (destination: string, listener?: ForumRealtimeEventListener) => {
      const registration: DynamicSubscriptionRegistration = {
        destination,
        listener,
        subscription: null,
      };

      dynamicSubscriptionsRef.current.add(registration);

      const client = clientRef.current;

      if (client?.connected) {
        activateDynamicSubscription(client, registration);
      }

      return () => {
        if (clientRef.current?.connected && registration.subscription) {
          registration.subscription.unsubscribe();
        }

        registration.subscription = null;
        dynamicSubscriptionsRef.current.delete(registration);
      };
    },
    [activateDynamicSubscription],
  );

  const refetchForumSubtree = useCallback(async (): Promise<boolean> => {
    const queries = queryClient.getQueryCache().findAll({
      queryKey: forumKeys.all,
      predicate: (query) =>
        isServerBackedForumQueryKey(query.queryKey) && !query.isDisabled(),
    });

    const results = await Promise.allSettled(
      queries.map((query) =>
        queryClient.refetchQueries(
          {
            queryKey: query.queryKey,
            exact: true,
            type: 'all',
          },
          {
            throwOnError: true,
          },
        ),
      ),
    );

    return results.every((result) => {
      if (result.status === 'fulfilled') {
        return true;
      }

      const status = getForumErrorStatus(result.reason);
      return status !== undefined && EXPECTED_RECONCILIATION_ERROR_STATUSES.has(status);
    });
  }, [queryClient]);

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
    let hasConnectedBefore = false;
    let reconciliationRunId = 0;
    let fixedSubscriptions: StompSubscription[] = [];

    const updateStatus = (status: ConnectionSnapshot['status']) => {
      if (!disposed) {
        setConnectionSnapshot({ userId, status });
      }
    };

    const updateReconciliationStatus = (
      status: ForumRealtimeReconciliationStatus,
    ) => {
      if (!disposed) {
        setReconciliationStatus(status);
      }
    };

    const cancelReconciliation = () => {
      reconciliationRunId += 1;
      eventBufferRef.current.cancel();
      updateReconciliationStatus('idle');
    };

    const finishReconciliation = (
      runId: number,
      succeeded: boolean,
    ) => {
      if (
        disposed ||
        runId !== reconciliationRunId ||
        !eventBufferRef.current.isActive()
      ) {
        return;
      }

      const bufferedEvents = eventBufferRef.current.drain();
      bufferedEvents.forEach(dispatchEvent);
      updateReconciliationStatus(succeeded ? 'idle' : 'error');
    };

    const reconcileAfterReconnect = async (runId: number) => {
      try {
        const succeeded = await refetchForumSubtree();
        finishReconciliation(runId, succeeded);
      } catch {
        finishReconciliation(runId, false);
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
      const connectionKind = getForumConnectionKind(hasConnectedBefore);
      hasConnectedBefore = true;
      let currentReconciliationRunId: number | null = null;

      if (connectionKind === 'reconnect') {
        eventBufferRef.current.start();
        currentReconciliationRunId = ++reconciliationRunId;
        updateReconciliationStatus('reconciling');
      } else {
        updateReconciliationStatus('idle');
      }

      fixedSubscriptions = getFixedForumDestinations(userRole).map((destination) =>
        client.subscribe(destination, consumeMessage),
      );
      dynamicSubscriptionsRef.current.forEach((registration) => {
        registration.subscription = null;
        activateDynamicSubscription(client, registration);
      });
      updateStatus('connected');

      if (currentReconciliationRunId !== null) {
        void reconcileAfterReconnect(currentReconciliationRunId);
      }
    };

    client.onWebSocketClose = () => {
      fixedSubscriptions = [];
      dynamicSubscriptionsRef.current.forEach((registration) => {
        registration.subscription = null;
      });
      cancelReconciliation();
      updateStatus(client.active ? 'reconnecting' : 'disconnected');
    };

    client.onWebSocketError = () => {
      cancelReconciliation();
      // updateStatus('reconnecting');
    };

    client.onStompError = () => {
      cancelReconciliation();
      // updateStatus(client.active ? 'reconnecting' : 'disconnected');
    };

    client.onHeartbeatLost = () => {
      cancelReconciliation();
      // updateStatus('reconnecting');
    };

    client.onHeartbeatReceived = () => {
      if (client.connected) {
        updateStatus('connected');
      }
    };

    clientRef.current = client;
    client.activate();

    return () => {
      disposed = true;
      reconciliationRunId += 1;
      eventBufferRef.current.cancel();

      if (client.connected) {
        fixedSubscriptions.forEach((subscription) => subscription.unsubscribe());
      }

      fixedSubscriptions = [];
      dynamicSubscriptionsRef.current.forEach((registration) => {
        registration.subscription = null;
      });

      if (clientRef.current === client) {
        clientRef.current = null;
      }

      void client.deactivate();
    };
  }, [
    activateDynamicSubscription,
    consumeMessage,
    dispatchEvent,
    isAuthenticated,
    refetchForumSubtree,
    userId,
    userRole,
  ]);

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
      reconciliationStatus,
      isConnected: status === 'connected',
      subscribe,
      addEventListener,
    }),
    [addEventListener, reconciliationStatus, status, subscribe],
  );

  return (
    <ForumRealtimeContext.Provider value={contextValue}>
      {children}
    </ForumRealtimeContext.Provider>
  );
};
