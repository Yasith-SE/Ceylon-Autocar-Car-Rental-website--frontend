import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiClock,
  FiMessageCircle,
  FiRadio,
  FiSend,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import useAuth from '../context/useAuth';
import useSupportChat from '../hooks/useSupportChat';
import { createSystemChatMessage, rememberVisitorName } from '../utils/supportChat';

const formatTime = (timestamp) => {
  if (!timestamp) {
    return '--';
  }

  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const FloatingChat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const bodyRef = useRef(null);

  const shouldHideWidget =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/login') ||
    user?.role === 'ADMIN';

  const {
    activeConversation,
    connectionState,
    identity,
    lastError,
    sendMessage,
  } = useSupportChat({
    user,
    isAdmin: false,
    connectWhen: isOpen && !shouldHideWidget,
  });

  const statusMeta = useMemo(() => {
    if (connectionState === 'connected') {
      return {
        label: 'Live Support',
        className: 'bg-success-subtle text-success-emphasis',
      };
    }

    if (connectionState === 'connecting') {
      return {
        label: 'Connecting',
        className: 'bg-warning-subtle text-warning-emphasis',
      };
    }

    return {
      label: 'Offline',
      className: 'bg-secondary-subtle text-secondary-emphasis',
    };
  }, [connectionState]);

  useEffect(() => {
    if (!isOpen || !bodyRef.current) {
      return;
    }

    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [activeConversation?.messages, isOpen]);

  useEffect(() => {
    const handleComposeRequest = (event) => {
      const nextText = String(event.detail?.text || '').trim();
      const nextName = String(event.detail?.name || '').trim();

      if (nextName) {
        rememberVisitorName(nextName);
      }

      if (nextText) {
        setInputValue(nextText);
      }

      if (event.detail?.open !== false) {
        setIsOpen(true);
      }
    };

    window.addEventListener('ceylon-support-chat-compose', handleComposeRequest);

    return () => {
      window.removeEventListener('ceylon-support-chat-compose', handleComposeRequest);
    };
  }, []);

  if (shouldHideWidget) {
    return null;
  }

  const messages =
    activeConversation?.messages?.length
      ? activeConversation.messages
      : [
          createSystemChatMessage({
            sessionId: identity.sessionId,
            text: 'Welcome to Ceylon AutoCar. A showroom admin can reply here in real time.',
          }),
        ];

  const handleSend = (event) => {
    event.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn border-0 d-flex align-items-center justify-content-center shadow-lg"
          style={{
            position: 'fixed',
            right: '28px',
            bottom: '28px',
            width: '66px',
            height: '66px',
            borderRadius: '999px',
            zIndex: 1090,
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            color: '#fff',
          }}
          aria-label="Open live support chat"
        >
          <FiMessageCircle size={26} />
        </button>
      ) : (
        <div
          className="shadow-lg"
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '24px',
            width: 'min(92vw, 390px)',
            height: 'min(72vh, 620px)',
            zIndex: 1090,
            borderRadius: '26px',
            overflow: 'hidden',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            background: '#fff',
          }}
        >
          <div
            className="text-white p-4"
            style={{
              background: 'linear-gradient(135deg, #111827, #1f2937 60%, #ef4444)',
            }}
          >
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div>
                <div className="fw-semibold fs-5">Ceylon AutoCar</div>
                <div className="small text-white-50">Client to admin support channel</div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-sm text-white border-0 p-0"
                aria-label="Close support chat"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
              <span className={`badge rounded-pill px-3 py-2 ${statusMeta.className}`}>
                <FiRadio className="me-2" />
                {statusMeta.label}
              </span>
              <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                <FiUser className="me-2" />
                {identity.displayName}
              </span>
            </div>
          </div>

          <div
            ref={bodyRef}
            className="p-3"
            style={{
              height: 'calc(100% - 170px)',
              overflowY: 'auto',
              background:
                'linear-gradient(180deg, rgba(248,250,252,0.92), rgba(241,245,249,0.96))',
            }}
          >
            <div className="d-flex flex-column gap-3">
              {messages.map((message) => {
                const isCustomerMessage = message.senderRole === 'CUSTOMER';
                const isSystemMessage = message.senderRole === 'SYSTEM';

                return (
                  <div
                    key={message.clientMessageId || message.id}
                    className={`d-flex ${isCustomerMessage ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div
                      className="rounded-4 p-3 shadow-sm"
                      style={{
                        maxWidth: '80%',
                        background: isCustomerMessage
                          ? 'linear-gradient(135deg, #ef4444, #111827)'
                          : isSystemMessage
                            ? '#fff7ed'
                            : '#ffffff',
                        color: isCustomerMessage ? '#fff' : '#111827',
                      }}
                    >
                      <div className="small fw-semibold mb-1">{message.senderName}</div>
                      <div style={{ lineHeight: 1.55 }}>{message.text}</div>
                      <div
                        className={`small mt-2 d-flex align-items-center gap-1 ${
                          isCustomerMessage ? 'text-white-50' : 'text-muted'
                        }`}
                      >
                        <FiClock size={12} />
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {lastError ? (
                <div className="small text-danger text-center px-2">{lastError}</div>
              ) : null}
            </div>
          </div>

          <div className="border-top bg-white p-3">
            <form onSubmit={handleSend} className="d-flex gap-2 align-items-center">
              <input
                type="text"
                className="form-control form-control-lg rounded-pill border-0"
                placeholder="Ask about rentals, availability, or delivery..."
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                style={{ background: '#f3f4f6', boxShadow: 'none' }}
              />
              <button
                type="submit"
                className="btn btn-dark rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '48px', height: '48px' }}
                disabled={!inputValue.trim()}
                aria-label="Send message"
              >
                <FiSend size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
