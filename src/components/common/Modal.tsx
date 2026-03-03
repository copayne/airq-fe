import React, { useEffect, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mobileFullScreen?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  mobileFullScreen = false,
}) => {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop — hidden on mobile when full-screen */}
      <div
        className={`fixed inset-0 bg-airq-dark/60 transition-opacity ${mobileFullScreen ? 'hidden sm:block' : ''}`}
        onClick={onClose}
      />

      {/* Modal container */}
      <div className={
        mobileFullScreen
          ? 'h-full sm:h-auto sm:flex sm:min-h-full sm:items-start sm:justify-center sm:pt-12 sm:px-4 sm:pb-4'
          : 'flex min-h-full items-start justify-center pt-12 px-4 pb-4'
      }>
        <div
          className={`relative w-full bg-airq-light transform transition-all ${
            mobileFullScreen
              ? `flex flex-col h-full sm:h-auto sm:block ${sizeClasses[size]} sm:border sm:border-airq-dark sm:shadow-card`
              : `${sizeClasses[size]} border border-airq-dark shadow-card`
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header — hidden on mobile when full-screen (caller provides own) */}
          <div className={`bg-airq-dark text-airq-light px-4 py-2 flex items-center justify-between border-b border-black/80 ${
            mobileFullScreen ? 'hidden sm:flex' : ''
          }`}>
            <p className="text-sm font-semibold">{title}</p>
            <button
              onClick={onClose}
              className="text-airq-light hover:text-airq-secondary transition-colors focus:outline-none"
            >
              <span className="text-lg leading-none">x</span>
            </button>
          </div>

          {/* Content */}
          <div className={
            mobileFullScreen
              ? 'flex-1 flex flex-col min-h-0 sm:flex-none sm:block sm:px-4 sm:py-4'
              : 'px-4 py-4'
          }>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
