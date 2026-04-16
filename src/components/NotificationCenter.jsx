import { useEffect } from 'react';
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiX,
  FiZap,
} from 'react-icons/fi';

const NOTIFICATION_THEME = {
  success: {
    icon: FiCheckCircle,
    accent: '#22c55e',
    surface: 'linear-gradient(145deg, rgba(6, 78, 59, 0.94), rgba(15, 23, 42, 0.96))',
    badge: 'rgba(34, 197, 94, 0.16)',
    iconSurface: 'rgba(34, 197, 94, 0.14)',
  },
  error: {
    icon: FiAlertCircle,
    accent: '#ef4444',
    surface: 'linear-gradient(145deg, rgba(127, 29, 29, 0.94), rgba(15, 23, 42, 0.96))',
    badge: 'rgba(239, 68, 68, 0.16)',
    iconSurface: 'rgba(239, 68, 68, 0.14)',
  },
  warning: {
    icon: FiAlertTriangle,
    accent: '#f59e0b',
    surface: 'linear-gradient(145deg, rgba(120, 53, 15, 0.94), rgba(15, 23, 42, 0.96))',
    badge: 'rgba(245, 158, 11, 0.16)',
    iconSurface: 'rgba(245, 158, 11, 0.14)',
  },
  info: {
    icon: FiInfo,
    accent: '#38bdf8',
    surface: 'linear-gradient(145deg, rgba(12, 74, 110, 0.94), rgba(15, 23, 42, 0.96))',
    badge: 'rgba(56, 189, 248, 0.16)',
    iconSurface: 'rgba(56, 189, 248, 0.14)',
  },
};

const NOTIFICATION_ANIMATION_STYLES = `
  @keyframes carNoticeSlideIn {
    from {
      opacity: 0;
      transform: translate3d(24px, -16px, 0) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  @keyframes carNoticePulse {
    0%, 100% {
      opacity: 0.72;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.08);
    }
  }

  @keyframes carNoticeProgress {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }

  .car-notice-card {
    position: relative;
    overflow: hidden;
    border-radius: 26px;
    color: #f8fafc;
    box-shadow: 0 24px 64px rgba(15, 23, 42, 0.24);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(18px);
    animation: carNoticeSlideIn 360ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .car-notice-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(130deg, rgba(255, 255, 255, 0.08), transparent 40%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 38%);
    pointer-events: none;
  }

  .car-notice-progress {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    transform-origin: left center;
    animation: carNoticeProgress var(--notice-duration, 4600ms) linear forwards;
  }

  .car-notice-beam {
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 999px;
    filter: blur(12px);
    opacity: 0.32;
    pointer-events: none;
    animation: carNoticePulse 5s ease-in-out infinite;
  }

  .car-notice-beam--primary {
    top: -26px;
    right: -18px;
  }

  .car-notice-beam--secondary {
    bottom: -40px;
    left: -30px;
    animation-delay: 1.2s;
  }

  @media (prefers-reduced-motion: reduce) {
    .car-notice-card,
    .car-notice-progress,
    .car-notice-beam {
      animation: none !important;
    }
  }
`;

const NotificationCard = ({ notification, onDismiss }) => {
  const theme = NOTIFICATION_THEME[notification.type] || NOTIFICATION_THEME.info;
  const Icon = theme.icon;

  useEffect(() => {
    if (!notification.duration) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onDismiss(notification.id);
    }, notification.duration);

    return () => window.clearTimeout(timeoutId);
  }, [notification.duration, notification.id, onDismiss]);

  return (
    <div
      className="car-notice-card"
      style={{
        background: theme.surface,
        '--notice-duration': `${notification.duration || 4600}ms`,
      }}
    >
      <div
        className="car-notice-beam car-notice-beam--primary"
        style={{ background: `${theme.accent}55` }}
      />
      <div
        className="car-notice-beam car-notice-beam--secondary"
        style={{ background: `${theme.accent}33` }}
      />

      <div className="p-4 position-relative">
        <div className="d-flex align-items-start gap-3">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
            style={{
              width: '52px',
              height: '52px',
              background: theme.iconSurface,
              color: theme.accent,
              boxShadow: `0 0 0 1px ${theme.badge} inset`,
            }}
          >
            <Icon size={22} />
          </div>

          <div className="flex-grow-1">
            <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="badge rounded-pill px-3 py-2 text-uppercase"
                    style={{
                      background: theme.badge,
                      color: theme.accent,
                      letterSpacing: '0.08em',
                      fontSize: '0.68rem',
                    }}
                  >
                    {notification.eyebrow || 'Garage Update'}
                  </span>
                  <span className="small text-white-50 d-inline-flex align-items-center gap-1">
                    <FiZap size={13} />
                    Standard notice
                  </span>
                </div>
                <div className="fw-semibold fs-5 mb-1">{notification.title}</div>
                <div className="text-white-50" style={{ lineHeight: 1.6 }}>
                  {notification.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(notification.id)}
                className="btn btn-sm rounded-circle border-0 text-white-50 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'rgba(255,255,255,0.06)',
                }}
                aria-label="Dismiss notification"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="car-notice-progress"
        style={{
          background: `linear-gradient(90deg, ${theme.accent}, rgba(255,255,255,0.88))`,
        }}
      />
    </div>
  );
};

const NotificationCenter = ({ notifications, onDismiss }) => {
  if (!notifications.length) {
    return null;
  }

  return (
    <>
      <style>{NOTIFICATION_ANIMATION_STYLES}</style>
      <div
        className="position-fixed top-0 end-0 p-3"
        style={{
          zIndex: 1085,
          width: 'min(420px, calc(100vw - 1.5rem))',
          marginTop: '96px',
          pointerEvents: 'none',
        }}
      >
        <div className="d-grid gap-3">
          {notifications.map((notification) => (
            <div key={notification.id} style={{ pointerEvents: 'auto' }}>
              <NotificationCard notification={notification} onDismiss={onDismiss} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;
