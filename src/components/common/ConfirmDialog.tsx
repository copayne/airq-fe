import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'confirm',
  cancelText = 'cancel',
  variant = 'danger',
  isLoading = false
}) => {
  const variantStyles = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-airq-tertiary/20',
      iconColor: 'text-airq-tertiary',
      buttonBg: 'bg-airq-tertiary hover:bg-airq-tertiary/90',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-airq-secondary/20',
      iconColor: 'text-airq-secondary',
      buttonBg: 'bg-airq-secondary hover:bg-airq-secondary/90 text-airq-dark',
    },
  };

  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 w-10 h-10 ${styles.iconBg} border border-airq-dark flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${styles.iconColor}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-airq-dark">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-airq-dark bg-airq-light border border-airq-dark shadow-card hover:bg-airq-dark/5 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium text-airq-light border border-airq-dark shadow-card active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50 ${styles.buttonBg}`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              processing...
            </span>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
