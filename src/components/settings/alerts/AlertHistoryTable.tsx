import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Check, CheckCheck } from 'lucide-react';
import { GET_ALERT_HISTORY, ACKNOWLEDGE_ALERT, ACKNOWLEDGE_ALL_ALERTS, GET_UNACKNOWLEDGED_ALERT_COUNT } from '~/graphql/Alerts';

interface AlertHistoryEntry {
  id: string;
  sensorId: number;
  co2Ppm: number;
  severity: string;
  channelsSent: string;
  emailStatus: string;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  createdAt: string;
  sensor: {
    id: number;
    name: string;
  } | null;
}

export const AlertHistoryTable: React.FC = () => {
  const { data, loading, refetch } = useQuery<{ alertHistory: AlertHistoryEntry[] }>(
    GET_ALERT_HISTORY,
    { variables: { limit: 50, offset: 0 } }
  );

  const refetchAll = () => {
    void refetch();
  };

  const [acknowledgeAlert] = useMutation(ACKNOWLEDGE_ALERT, {
    refetchQueries: [{ query: GET_UNACKNOWLEDGED_ALERT_COUNT }],
    onCompleted: () => refetchAll(),
  });

  const [acknowledgeAll] = useMutation(ACKNOWLEDGE_ALL_ALERTS, {
    refetchQueries: [{ query: GET_UNACKNOWLEDGED_ALERT_COUNT }],
    onCompleted: () => refetchAll(),
  });

  const alerts = data?.alertHistory ?? [];
  const hasUnacknowledged = alerts.some((a) => !a.acknowledged);

  if (loading) {
    return <div className="p-4 text-sm text-airq-dark/60">Loading alert history...</div>;
  }

  if (alerts.length === 0) {
    return <div className="p-4 text-sm text-airq-dark/60">No alerts recorded yet.</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 border-b border-airq-dark/20">
        <p className="text-sm font-medium text-airq-dark">alert history</p>
        {hasUnacknowledged && (
          <button
            onClick={() => void acknowledgeAll()}
            className="flex items-center space-x-1 text-xs text-airq-contrast hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>acknowledge all</span>
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-airq-dark/20 text-left text-xs text-airq-dark/60">
              <th className="px-4 py-2">time</th>
              <th className="px-4 py-2">sensor</th>
              <th className="px-4 py-2">CO2</th>
              <th className="px-4 py-2">severity</th>
              <th className="px-4 py-2">email</th>
              <th className="px-4 py-2">status</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id} className="border-b border-airq-dark/10 hover:bg-airq-dark/5">
                <td className="px-4 py-2 text-xs text-airq-dark/70">
                  {new Date(alert.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2">{alert.sensor?.name ?? `Sensor ${alert.sensorId}`}</td>
                <td className="px-4 py-2 font-mono">{alert.co2Ppm} ppm</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium ${
                      alert.severity === 'critical'
                        ? 'bg-airq-tertiary/10 text-airq-tertiary border border-airq-tertiary/30'
                        : 'bg-airq-secondary/10 text-airq-dark border border-airq-secondary/50'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium ${
                      alert.emailStatus === 'sent'
                        ? 'bg-airq-primary/10 text-airq-primary border border-airq-primary/30'
                        : alert.emailStatus === 'failed'
                        ? 'bg-airq-tertiary/10 text-airq-tertiary border border-airq-tertiary/30'
                        : 'bg-airq-dark/10 text-airq-dark/60 border border-airq-dark/20'
                    }`}
                  >
                    {alert.emailStatus}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {alert.acknowledged ? (
                    <span className="text-xs text-airq-primary">acknowledged</span>
                  ) : (
                    <button
                      onClick={() => void acknowledgeAlert({ variables: { id: alert.id } })}
                      className="flex items-center space-x-1 text-xs text-airq-contrast hover:underline"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>acknowledge</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
