import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION = 4000;

const toastStyles: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-airq-primary',
    icon: <CheckCircle className="w-5 h-5" />,
  },
  error: {
    bg: 'bg-airq-tertiary',
    icon: <XCircle className="w-5 h-5" />,
  },
  warning: {
    bg: 'bg-airq-secondary text-airq-dark',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
};

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const style = toastStyles[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border border-airq-dark shadow-card ${style.bg} text-airq-light animate-slide-in`}
    >
      {style.icon}
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="hover:opacity-70 transition-opacity focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Toast container - bottom left */}
      <div className="fixed bottom-4 left-16 z-[60] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={hideToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
