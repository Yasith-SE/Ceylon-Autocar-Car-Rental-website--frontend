import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildSupportChatSocketUrl,
  createOutgoingChatMessage,
  mergeChatMessageCollections,
  normalizeIncomingChatMessage,
  rememberVisitorName,
  resolveChatIdentity,
} from '../utils/supportChat';

const createConversation = ({
  sessionId,
  customerName,
  customerId = '',
  messages = [],
  unreadCount = 0,
  online = false,
}) => {
  const sortedMessages = mergeChatMessageCollections([], messages);
  const lastMessage = sortedMessages[sortedMessages.length - 1];

  return {
    sessionId,
    customerName,
    customerId,
    messages: sortedMessages,
    unreadCount,
    online,
    updatedAt: lastMessage?.timestamp || new Date().toISOString(),
    lastMessage: lastMessage?.text || '',
  };
};

const upsertConversation = (current, incoming, activeSessionId) => {
  const existing = current.find((item) => item.sessionId === incoming.sessionId);

  if (!existing) {
    const nextConversation = createConversation({
      ...incoming,
      unreadCount:
        activeSessionId && activeSessionId !== incoming.sessionId
          ? incoming.unreadCount || 0
          : 0,
    });

    return [...current, nextConversation].sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
  }

  const mergedMessages = mergeChatMessageCollections(existing.messages, incoming.messages || []);
  const lastMessage = mergedMessages[mergedMessages.length - 1];
  const nextConversation = {
    ...existing,
    ...incoming,
    messages: mergedMessages,
    unreadCount:
      activeSessionId === existing.sessionId
        ? 0
        : incoming.unreadCount ?? existing.unreadCount,
    updatedAt: lastMessage?.timestamp || incoming.updatedAt || existing.updatedAt,
    lastMessage: incoming.lastMessage || lastMessage?.text || existing.lastMessage,
  };

  return current
    .map((item) => (item.sessionId === incoming.sessionId ? nextConversation : item))
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
};

const extractPayload = (eventData) => eventData?.payload ?? eventData;

export const useSupportChat = ({ user, isAdmin = false, connectWhen = true }) => {
  const identity = useMemo(
    () => resolveChatIdentity(user, isAdmin),
    [isAdmin, user],
  );
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const activeSessionIdRef = useRef('');
  const [reconnectTick, setReconnectTick] = useState(0);
  const [connectionState, setConnectionState] = useState(connectWhen ? 'connecting' : 'idle');
  const [lastError, setLastError] = useState('');
  const [conversations, setConversations] = useState([]);
  const [manualActiveSessionId, setManualActiveSessionId] = useState('');
  const activeSessionId = isAdmin
    ? manualActiveSessionId || conversations[0]?.sessionId || ''
    : identity.sessionId;

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    if (!connectWhen) {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      socketRef.current?.close();
      socketRef.current = null;
      return undefined;
    }

    const socketUrl = buildSupportChatSocketUrl();
    let allowReconnect = true;

    const handleReconnect = () => {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }

      reconnectTimerRef.current = window.setTimeout(() => {
        setReconnectTick((current) => current + 1);
      }, 2500);
    };

    try {
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnectionState('connected');
        setLastError('');
        rememberVisitorName(identity.displayName);

        socket.send(
          JSON.stringify({
            type: 'chat:join',
            payload: {
              sessionId: identity.sessionId,
              participantId: identity.participantId,
              role: identity.role,
              displayName: identity.displayName,
              email: identity.email,
            },
          }),
        );

        socket.send(
          JSON.stringify({
            type: isAdmin ? 'chat:sessions:request' : 'chat:history:request',
            payload: isAdmin ? { role: 'ADMIN' } : { sessionId: identity.sessionId },
          }),
        );
      };

      socket.onmessage = (event) => {
        let parsed;

        try {
          parsed = JSON.parse(event.data);
        } catch {
          return;
        }

        const payload = extractPayload(parsed);
        const eventType = String(parsed?.type || payload?.type || '').toLowerCase();

        if (eventType.includes('error')) {
          setLastError(String(payload?.message || 'Support chat reported an error.'));
          return;
        }

        if (eventType.includes('sessions') || Array.isArray(payload?.conversations)) {
          const incomingConversations = payload?.conversations || [];

          setConversations((current) =>
            incomingConversations.reduce((state, item) => {
              const normalizedMessages = (item.messages || [])
                .map((message) =>
                  normalizeIncomingChatMessage(message, item.sessionId || item.id),
                )
                .filter(Boolean);

              return upsertConversation(
                state,
                {
                  sessionId: item.sessionId || item.id,
                  customerName:
                    item.customerName || item.displayName || item.customer?.name || 'Customer',
                  customerId: String(item.customerId || item.customer?.id || ''),
                  unreadCount: Number(item.unreadCount || 0),
                  online: Boolean(item.online),
                  messages: normalizedMessages,
                  lastMessage: item.lastMessage,
                  updatedAt: item.updatedAt,
                },
                activeSessionIdRef.current,
              );
            }, current),
          );
          return;
        }

        if (eventType.includes('history') || Array.isArray(payload?.messages)) {
          const historySessionId = payload?.sessionId || identity.sessionId;
          const normalizedMessages = (payload?.messages || [])
            .map((message) => normalizeIncomingChatMessage(message, historySessionId))
            .filter(Boolean);

          setConversations((current) =>
            upsertConversation(
              current,
              {
                sessionId: historySessionId,
                customerName:
                  payload?.customerName || identity.displayName || 'Customer',
                customerId: String(payload?.customerId || identity.participantId || ''),
                unreadCount: 0,
                online: true,
                messages: normalizedMessages,
                updatedAt: payload?.updatedAt,
              },
              activeSessionIdRef.current || historySessionId,
            ),
          );
          return;
        }

        const normalizedMessage = normalizeIncomingChatMessage(payload, payload?.sessionId);

        if (normalizedMessage) {
          setConversations((current) => {
            const activeForMessage =
              activeSessionIdRef.current || normalizedMessage.sessionId;
            const shouldIncreaseUnread =
              isAdmin &&
              activeForMessage !== normalizedMessage.sessionId &&
              normalizedMessage.senderRole !== 'ADMIN';
            const existingConversation = current.find(
              (item) => item.sessionId === normalizedMessage.sessionId,
            );
            const inferredCustomerName =
              existingConversation?.customerName ||
              payload?.customerName ||
              (normalizedMessage.senderRole === 'CUSTOMER'
                ? normalizedMessage.senderName
                : 'Customer');

            return upsertConversation(
              current,
              {
                sessionId: normalizedMessage.sessionId,
                customerName: inferredCustomerName,
                customerId:
                  existingConversation?.customerId ||
                  String(payload?.customerId || normalizedMessage.senderId || ''),
                unreadCount: shouldIncreaseUnread
                  ? (existingConversation?.unreadCount || 0) + 1
                  : 0,
                online: true,
                messages: [normalizedMessage],
              },
              activeForMessage,
            );
          });
        }
      };

      socket.onerror = () => {
        setLastError('Support chat connection failed. Please check the backend websocket service.');
      };

      socket.onclose = () => {
        socketRef.current = null;

        if (!allowReconnect) {
          return;
        }

        setConnectionState('disconnected');
        handleReconnect();
      };
    } catch {
      window.setTimeout(() => {
        setConnectionState('error');
        setLastError('Support chat could not start.');
      }, 0);
    }

    return () => {
      allowReconnect = false;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [
    activeSessionId,
    connectWhen,
    identity.displayName,
    identity.email,
    identity.participantId,
    identity.role,
    identity.sessionId,
    isAdmin,
    reconnectTick,
  ]);

  const setActiveConversation = useCallback((sessionId) => {
    setManualActiveSessionId(sessionId);
    setConversations((current) =>
      current.map((item) =>
        item.sessionId === sessionId
          ? {
              ...item,
              unreadCount: 0,
            }
          : item,
      ),
    );
  }, []);

  const sendMessage = useCallback(
    (text, explicitSessionId) => {
      const trimmedText = String(text || '').trim();
      const sessionId = explicitSessionId || activeSessionId || identity.sessionId;

      if (!trimmedText || !sessionId) {
        return { ok: false, reason: 'empty' };
      }

      const outgoingMessage = createOutgoingChatMessage({
        sessionId,
        text: trimmedText,
        identity,
      });

      setConversations((current) =>
        upsertConversation(
          current,
          {
            sessionId,
            customerName:
              current.find((item) => item.sessionId === sessionId)?.customerName ||
              identity.displayName,
            customerId: identity.participantId,
            online: connectionState === 'connected',
            unreadCount: 0,
            messages: [outgoingMessage],
          },
          sessionId,
        ),
      );

      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        setLastError('The chat backend is offline right now. Message queued only in the UI.');
        return { ok: false, reason: 'offline' };
      }

      socketRef.current.send(
        JSON.stringify({
          type: 'chat:message',
          payload: {
            sessionId,
            clientMessageId: outgoingMessage.clientMessageId,
            text: outgoingMessage.text,
            senderRole: identity.role,
            senderId: identity.participantId,
            senderName: identity.displayName,
            timestamp: outgoingMessage.timestamp,
          },
        }),
      );

      return { ok: true };
    },
    [
      activeSessionId,
      connectionState,
      identity,
    ],
  );

  const activeConversation =
    conversations.find((item) => item.sessionId === activeSessionId) || null;
  const resolvedConnectionState = !connectWhen
    ? 'idle'
    : connectionState === 'idle'
      ? 'connecting'
      : connectionState;
  const resolvedLastError = connectWhen ? lastError : '';

  return {
    activeConversation,
    activeSessionId,
    connectionState: resolvedConnectionState,
    conversations,
    identity,
    lastError: resolvedLastError,
    sendMessage,
    setActiveConversation,
  };
};

export default useSupportChat;
