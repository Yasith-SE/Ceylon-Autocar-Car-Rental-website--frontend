import { buildDerivedWebSocketUrl, getStoredAuthToken } from './api';

const CHAT_VISITOR_SESSION_KEY = 'ceylon-autocar-support-chat-session';
const CHAT_VISITOR_NAME_KEY = 'ceylon-autocar-support-chat-name';

const createId = (prefix = 'chat') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const readStorageValue = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorageValue = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures and continue with memory values.
  }
};

export const getVisitorChatSessionId = () => {
  const existing = readStorageValue(CHAT_VISITOR_SESSION_KEY);

  if (existing) {
    return existing;
  }

  const nextValue = createId('visitor');
  writeStorageValue(CHAT_VISITOR_SESSION_KEY, nextValue);
  return nextValue;
};

export const rememberVisitorName = (name) => {
  const trimmedName = String(name || '').trim();

  if (trimmedName) {
    writeStorageValue(CHAT_VISITOR_NAME_KEY, trimmedName);
  }
};

export const getStoredVisitorName = () =>
  readStorageValue(CHAT_VISITOR_NAME_KEY) || 'Guest Customer';

export const buildSupportChatSocketUrl = () => {
  const baseUrl =
    import.meta.env.VITE_SUPPORT_CHAT_WS_URL?.trim() ||
    buildDerivedWebSocketUrl('/ws/support-chat');
  const token = getStoredAuthToken();

  if (!token) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  url.searchParams.set('token', token);
  return url.toString();
};

export const resolveChatIdentity = (user, isAdmin = false) => {
  if (user?.id) {
    return {
      sessionId: isAdmin ? `admin-${user.id}` : `customer-${user.id}`,
      participantId: String(user.id),
      role: isAdmin ? 'ADMIN' : user.role || 'CUSTOMER',
      displayName: user.name || (isAdmin ? 'Showroom Admin' : 'Customer'),
      email: user.email || '',
    };
  }

  const visitorSessionId = getVisitorChatSessionId();
  const visitorName = getStoredVisitorName();

  return {
    sessionId: visitorSessionId,
    participantId: visitorSessionId,
    role: isAdmin ? 'ADMIN' : 'CUSTOMER',
    displayName: visitorName,
    email: '',
  };
};

export const createSystemChatMessage = ({
  sessionId,
  text,
  senderName = 'Ceylon AutoCar',
}) => ({
  id: createId('system'),
  sessionId,
  text,
  senderRole: 'SYSTEM',
  senderName,
  timestamp: new Date().toISOString(),
  deliveryState: 'sent',
});

export const createOutgoingChatMessage = ({ sessionId, text, identity }) => ({
  id: createId('message'),
  clientMessageId: createId('client'),
  sessionId,
  text,
  senderRole: identity.role,
  senderName: identity.displayName,
  senderId: identity.participantId,
  timestamp: new Date().toISOString(),
  deliveryState: 'pending',
});

export const normalizeIncomingChatMessage = (input, fallbackSessionId) => {
  const raw = input?.message && typeof input.message === 'object' ? input.message : input;
  const text = String(
    raw?.text ??
      raw?.content ??
      raw?.body ??
      raw?.message ??
      '',
  ).trim();

  if (!text) {
    return null;
  }

  const senderRole = String(
    raw?.senderRole ??
      raw?.fromRole ??
      raw?.role ??
      raw?.sender?.role ??
      'CUSTOMER',
  ).toUpperCase();

  return {
    id: String(
      raw?.id ??
        raw?.messageId ??
        raw?.clientMessageId ??
        createId('incoming'),
    ),
    clientMessageId: raw?.clientMessageId || '',
    sessionId:
      raw?.sessionId ??
      raw?.conversationId ??
      raw?.chatId ??
      fallbackSessionId,
    text,
    senderRole,
    senderName:
      raw?.senderName ??
      raw?.name ??
      raw?.sender?.name ??
      (senderRole === 'ADMIN' ? 'Showroom Support' : 'Customer'),
    senderId: String(raw?.senderId ?? raw?.sender?.id ?? ''),
    timestamp:
      raw?.timestamp ??
      raw?.createdAt ??
      raw?.sentAt ??
      new Date().toISOString(),
    deliveryState: raw?.deliveryState || 'sent',
  };
};

export const sortChatMessages = (messages) =>
  [...messages].sort(
    (left, right) =>
      new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
  );

export const dedupeChatMessages = (messages) => {
  const seen = new Set();

  return sortChatMessages(messages).filter((message) => {
    const key =
      message.clientMessageId ||
      message.id ||
      `${message.sessionId}-${message.senderRole}-${message.timestamp}-${message.text}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const mergeChatMessageCollections = (currentMessages, nextMessages) =>
  dedupeChatMessages([...currentMessages, ...nextMessages]);
