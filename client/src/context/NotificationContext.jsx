import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext({ notifications: [], add: () => {}, clear: () => {}, remove: () => {} });
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fds_notifs') || '[]'); } catch { return []; }
  });

  const persist = (list) => {
    setNotifications(list);
    localStorage.setItem('fds_notifs', JSON.stringify(list.slice(0, 20)));
  };

  const add = useCallback((text, type = 'info') => {
    const n = { id: Date.now().toString(), text, type, time: new Date().toISOString() };
    setNotifications(prev => {
      const next = [n, ...prev].slice(0, 20);
      localStorage.setItem('fds_notifs', JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      localStorage.setItem('fds_notifs', JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('fds_notifs');
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, add, remove, clear }}>
      {children}
    </NotificationContext.Provider>
  );
}
