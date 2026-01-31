import React, { useState, useRef, useEffect, memo } from 'react';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { useAlerts } from '~/hooks/useAlerts';
import {
  GET_ALERT_HISTORY,
  ACKNOWLEDGE_ALERT,
  ACKNOWLEDGE_ALL_ALERTS,
  GET_UNACKNOWLEDGED_ALERT_COUNT,
} from '~/graphql/Alerts';
import Link from 'next/link';

interface AlertEntry {
  id: string;
  co2Ppm: number;
  severity: string;
  acknowledged: boolean;
  createdAt: string;
  sensor: { id: number; name: string } | null;
}

const AlertBell: React.FC = memo(() => {
  const { unacknowledgedCount } = useAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery<{ alertHistory: AlertEntry[] }>(GET_ALERT_HISTORY, {
    variables: { limit: 5, offset: 0 },
    skip: !isOpen,
    fetchPolicy: 'network-only',
  });

  const [acknowledgeAlert] = useMutation(ACKNOWLEDGE_ALERT, {
    refetchQueries: [
      { query: GET_UNACKNOWLEDGED_ALERT_COUNT },
      { query: GET_ALERT_HISTORY, variables: { limit: 5, offset: 0 } },
    ],
  });

  const [acknowledgeAll] = useMutation(ACKNOWLEDGE_ALL_ALERTS, {
    refetchQueries: [
      { query: GET_UNACKNOWLEDGED_ALERT_COUNT },
      { query: GET_ALERT_HISTORY, variables: { limit: 5, offset: 0 } },
    ],
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Request notification permission on first interaction
  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  };

  const alerts = data?.alertHistory ?? [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-2 text-airq-dark hover:text-airq-contrast hover:bg-gray-100 rounded-md transition-colors"
        title="Alerts"
      >
        <Bell className="w-5 h-5" />
        {unacknowledgedCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-airq-tertiary rounded-full">
            {unacknowledgedCount > 99 ? '99+' : unacknowledgedCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 border border-airq-dark shadow-card bg-airq-light z-50">
          <div className="flex items-center justify-between px-3 py-2 bg-airq-dark text-airq-light">
            <span className="text-xs font-semibold">alerts</span>
            {unacknowledgedCount > 0 && (
              <button
                onClick={() => void acknowledgeAll()}
                className="flex items-center space-x-1 text-xs hover:underline"
              >
                <CheckCheck className="w-3 h-3" />
                <span>ack all</span>
              </button>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="p-4 text-sm text-airq-dark/60 text-center">No recent alerts</div>
          ) : (
            <ul className="divide-y divide-airq-dark/10 max-h-72 overflow-y-auto">
              {alerts.map((alert) => (
                <li key={alert.id} className="px-3 py-2 hover:bg-airq-dark/5 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                          alert.severity === 'critical' ? 'bg-airq-tertiary' : 'bg-airq-secondary'
                        }`}
                      />
                      <span className="text-xs font-medium text-airq-dark truncate">
                        {alert.sensor?.name ?? 'Sensor'}: {alert.co2Ppm} ppm
                      </span>
                    </div>
                    <p className="text-[10px] text-airq-dark/50 mt-0.5 pl-4">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => void acknowledgeAlert({ variables: { id: alert.id } })}
                      className="flex-shrink-0 ml-2 p-1 text-airq-contrast hover:bg-airq-contrast/10 rounded"
                      title="Acknowledge"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/settings/alerts"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center space-x-1 px-3 py-2 text-xs text-airq-contrast hover:bg-airq-dark/5 border-t border-airq-dark/20"
          >
            <span>view all</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
});

AlertBell.displayName = 'AlertBell';

export default AlertBell;
