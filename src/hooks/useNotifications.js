import { useCallback, useState } from 'react';

const createNotificationId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const dismissNotification = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((payload) => {
    const notification = {
      id: createNotificationId(),
      type: 'info',
      duration: 4600,
      ...payload,
    };

    setNotifications((current) => [...current.slice(-2), notification]);
    return notification.id;
  }, []);

  return {
    notifications,
    notify,
    dismissNotification,
  };
};

export default useNotifications;
