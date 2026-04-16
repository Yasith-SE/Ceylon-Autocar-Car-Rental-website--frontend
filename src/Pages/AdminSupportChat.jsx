import React, { useMemo, useState } from 'react';
import {
  FiClock,
  FiMessageCircle,
  FiRadio,
  FiSend,
  FiUser,
  FiUsers,
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import useAuth from '../context/useAuth';
import useSupportChat from '../hooks/useSupportChat';

const formatChatTime = (timestamp) => {
  if (!timestamp) {
    return '--';
  }

  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const AdminSupportChat = () => {
  const { user } = useAuth();
  const [draftMessage, setDraftMessage] = useState('');
  const {
    activeConversation,
    activeSessionId,
    connectionState,
    conversations,
    lastError,
    sendMessage,
    setActiveConversation,
  } = useSupportChat({
    user,
    isAdmin: true,
    connectWhen: true,
  });

  const statusTone = useMemo(() => {
    if (connectionState === 'connected') {
      return {
        label: 'Live',
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

  const handleSend = (event) => {
    event.preventDefault();

    if (!activeSessionId) {
      return;
    }

    const result = sendMessage(draftMessage, activeSessionId);

    if (result.ok) {
      setDraftMessage('');
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container-fluid" style={{ paddingTop: '118px', paddingBottom: '36px' }}>
        <div className="px-lg-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
            <div>
              <p className="text-uppercase small fw-bold text-danger mb-2">Live Support Desk</p>
              <h2 className="fw-bold mb-2">Client to admin websocket chat</h2>
              <p className="text-muted mb-0">
                Handle incoming rental questions in real time from the frontend floating chat.
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <span className={`badge rounded-pill px-3 py-2 ${statusTone.className}`}>
                <FiRadio className="me-2" />
                {statusTone.label}
              </span>
              <span className="badge rounded-pill bg-dark-subtle text-dark-emphasis px-3 py-2">
                <FiUsers className="me-2" />
                {conversations.length} active conversations
              </span>
            </div>
          </div>

          {lastError ? (
            <div className="alert alert-warning rounded-4 border-0 shadow-sm mb-4">
              {lastError}
            </div>
          ) : null}

          <div className="row g-4">
            <div className="col-xl-4">
              <div className="card border-0 shadow-sm rounded-5 h-100 overflow-hidden">
                <div className="card-header bg-white border-0 p-4 pb-3">
                  <div className="fw-semibold d-flex align-items-center gap-2">
                    <FiMessageCircle />
                    Conversation Queue
                  </div>
                  <div className="small text-muted mt-1">
                    New customer sessions appear here when your backend broadcasts them.
                  </div>
                </div>

                <div className="card-body px-3 pb-3 pt-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {conversations.length ? (
                    <div className="d-grid gap-2">
                      {conversations.map((conversation) => {
                        const isActive = conversation.sessionId === activeSessionId;

                        return (
                          <button
                            key={conversation.sessionId}
                            type="button"
                            onClick={() => setActiveConversation(conversation.sessionId)}
                            className="btn text-start rounded-4 p-3"
                            style={{
                              border: isActive
                                ? '1px solid rgba(239, 68, 68, 0.45)'
                                : '1px solid rgba(15, 23, 42, 0.08)',
                              background: isActive ? 'rgba(239, 68, 68, 0.08)' : '#fff',
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                              <div>
                                <div className="fw-semibold text-dark">{conversation.customerName}</div>
                                <div className="small text-muted font-monospace">
                                  {conversation.sessionId}
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="small text-muted">
                                  {formatChatTime(conversation.updatedAt)}
                                </div>
                                {conversation.unreadCount ? (
                                  <span className="badge rounded-pill bg-danger mt-1">
                                    {conversation.unreadCount}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <div className="small text-muted">
                              {conversation.lastMessage || 'No messages yet.'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-4 bg-light p-4 text-center text-muted">
                      No live client chat sessions yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-xl-8">
              <div className="card border-0 shadow-sm rounded-5 overflow-hidden">
                <div className="card-header bg-dark text-white border-0 p-4">
                  <div className="d-flex justify-content-between align-items-center gap-3">
                    <div>
                      <div className="fw-semibold fs-5">
                        {activeConversation?.customerName || 'Select a conversation'}
                      </div>
                      <div className="small text-white-50">
                        {activeConversation?.sessionId || 'Waiting for a customer session'}
                      </div>
                    </div>
                    <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                      Admin Reply Channel
                    </span>
                  </div>
                </div>

                <div
                  className="card-body p-4"
                  style={{
                    minHeight: '520px',
                    maxHeight: '65vh',
                    overflowY: 'auto',
                    background:
                      'linear-gradient(180deg, rgba(248,250,252,0.96), rgba(241,245,249,0.96))',
                  }}
                >
                  {activeConversation ? (
                    <div className="d-flex flex-column gap-3">
                      {activeConversation.messages.map((message) => {
                        const isAdminMessage = message.senderRole === 'ADMIN';
                        const isSystemMessage = message.senderRole === 'SYSTEM';

                        return (
                          <div
                            key={message.clientMessageId || message.id}
                            className={`d-flex ${
                              isAdminMessage ? 'justify-content-end' : 'justify-content-start'
                            }`}
                          >
                            <div
                              className="rounded-4 p-3 shadow-sm"
                              style={{
                                maxWidth: '72%',
                                background: isAdminMessage
                                  ? 'linear-gradient(135deg, #111827, #ef4444)'
                                  : isSystemMessage
                                    ? '#fff3cd'
                                    : '#ffffff',
                                color: isAdminMessage ? '#fff' : '#111827',
                              }}
                            >
                              <div className="small fw-semibold mb-1 d-flex align-items-center gap-2">
                                <FiUser size={13} />
                                {message.senderName}
                              </div>
                              <div style={{ lineHeight: 1.6 }}>{message.text}</div>
                              <div
                                className={`small mt-2 ${
                                  isAdminMessage ? 'text-white-50' : 'text-muted'
                                }`}
                              >
                                <FiClock className="me-1" />
                                {formatChatTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-100 d-flex align-items-center justify-content-center">
                      <div className="text-center text-muted">
                        <FiMessageCircle size={32} className="mb-3" />
                        <div className="fw-semibold mb-1">No chat selected</div>
                        <div className="small">
                          Open a customer conversation from the left queue to start replying.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-footer bg-white border-0 p-4">
                  <form onSubmit={handleSend} className="d-flex gap-3">
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-pill"
                      placeholder={
                        activeConversation
                          ? `Reply to ${activeConversation.customerName}...`
                          : 'Waiting for a customer session...'
                      }
                      disabled={!activeConversation}
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn btn-danger rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
                      disabled={!activeConversation || !draftMessage.trim()}
                    >
                      <FiSend />
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSupportChat;
