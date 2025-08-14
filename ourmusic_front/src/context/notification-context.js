import React, { createContext, useState, useContext, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuidv4 } from 'uuid';
import './Notification.css';

const NotificationContext = createContext({
  addToast: (message, type) => {},
});

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // removeToast 函数现在会先触发退出动画，再移除元素
  const removeToast = useCallback((id) => {
    // 1. 给要移除的 toast 添加 isExiting 状态
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, isExiting: true } : toast
      )
    );

    // 2. 在动画结束后（400ms后）真正从 state 中移除
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 400); // 这个时间必须和CSS中的动画时间匹配
  }, []);

  const addToast = useCallback(
    (message, type = 'info') => {
      const id = uuidv4();
      setToasts((prevToasts) => [...prevToasts, { id, message, type, isExiting: false }]);

      // 自动消失的逻辑现在也调用我们新的 removeToast
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );
  

  return (
    <NotificationContext.Provider value={{ addToast }}>
      {children}
      {ReactDOM.createPortal(
        <ToastContainer toasts={toasts} removeToast={removeToast} />,
        document.getElementById('toast-root')
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// 单个Toast组件现在会根据 isExiting 状态添加 exiting class
const Toast = ({ message, type, onClose, isExiting }) => {
  const toastClasses = `toast toast-${type} ${isExiting ? 'exiting' : ''}`;
  
  return (
    <div className={toastClasses}>
      <span className="toast-message">{message}</span>
      <button onClick={onClose} className="toast-close-btn">&times;</button>
    </div>
  );
};