import React, { useEffect, useState } from 'react';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export interface NudgeMessage {
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  duration?: number; // milliseconds, default 5000
}

interface GentleNudgeProps {
  message: NudgeMessage | null;
  onClose: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const GentleNudge: React.FC<GentleNudgeProps> = ({
  message,
  onClose,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsExiting(false);

      const duration = message.duration || 5000;
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      onClose();
    }, 300); // Match animation duration
  };

  if (!message || !isVisible) {
    return null;
  }

  const getStyles = () => {
    switch (message.type) {
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/90',
          border: 'border-amber-200 dark:border-amber-700',
          icon: <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
          titleColor: 'text-amber-900 dark:text-amber-100',
          textColor: 'text-amber-800 dark:text-amber-200'
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/90',
          border: 'border-green-200 dark:border-green-700',
          icon: <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />,
          titleColor: 'text-green-900 dark:text-green-100',
          textColor: 'text-green-800 dark:text-green-200'
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/90',
          border: 'border-blue-200 dark:border-blue-700',
          icon: <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
          titleColor: 'text-blue-900 dark:text-blue-100',
          textColor: 'text-blue-800 dark:text-blue-200'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`fixed ${getPositionClasses()} z-50 max-w-sm w-full mx-auto transition-all duration-300 ${
        isExiting
          ? 'opacity-0 translate-y-2'
          : 'opacity-100 translate-y-0'
      }`}
    >
      <div
        className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 backdrop-blur-sm`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold ${styles.titleColor} mb-1`}>
              {message.title}
            </h3>
            <p className={`text-sm ${styles.textColor}`}>
              {message.message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ${styles.textColor} hover:opacity-70 transition-opacity`}
            aria-label="Close notification"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              message.type === 'warning'
                ? 'bg-amber-400'
                : message.type === 'success'
                ? 'bg-green-400'
                : 'bg-blue-400'
            } animate-progress`}
            style={{
              animation: `progress ${message.duration || 5000}ms linear`
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-progress {
          animation: progress 5s linear;
        }
      `}</style>
    </div>
  );
};

export default GentleNudge;
