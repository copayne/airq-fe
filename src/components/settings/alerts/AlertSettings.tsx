import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, Edit2, Trash2, Bell, Send } from 'lucide-react';
import { GET_ALERT_THRESHOLDS, DELETE_ALERT_THRESHOLD, SEND_TEST_ALERT } from '~/graphql/Alerts';
import { GET_SENSORS_BASIC } from '~/graphql/Sensor';
import { AlertThresholdForm } from './AlertThresholdForm';
import { AlertHistoryTable } from './AlertHistoryTable';
import { ConfirmDialog } from '~/components/common/ConfirmDialog';
import { Modal } from '~/components/common/Modal';

interface AlertThreshold {
  id: string;
  sensorId: number | null;
  warningPpm: number;
  criticalPpm: number;
  cooldownMinutes: number;
  isEnabled: boolean;
  sensor: { id: number; name: string } | null;
}

interface Sensor {
  id: number;
  name: string;
}

export const AlertSettings: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<AlertThreshold | null>(null);
  const [deletingThreshold, setDeletingThreshold] = useState<AlertThreshold | null>(null);
  const [testAlertMessage, setTestAlertMessage] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<{ alertThresholds: AlertThreshold[] }>(GET_ALERT_THRESHOLDS);
  const { data: sensorsData } = useQuery<{ sensors: Sensor[] }>(GET_SENSORS_BASIC);

  const [sendTestAlert, { loading: sendingTest }] = useMutation<{
    sendTestAlert: { success: boolean; message: string };
  }>(SEND_TEST_ALERT, {
    onCompleted: (result) => {
      setTestAlertMessage(result.sendTestAlert.message);
      setTimeout(() => setTestAlertMessage(null), 5000);
    },
    onError: () => {
      setTestAlertMessage('Failed to send test alert');
      setTimeout(() => setTestAlertMessage(null), 5000);
    },
  });

  const [deleteThreshold, { loading: deleting }] = useMutation<{
    deleteAlertThreshold: { success: boolean; message: string };
  }>(DELETE_ALERT_THRESHOLD, {
    onCompleted: (result) => {
      if (result.deleteAlertThreshold.success) {
        setDeletingThreshold(null);
        void refetch();
      }
    },
  });

  const thresholds = data?.alertThresholds ?? [];
  const sensors = sensorsData?.sensors ?? [];

  const handleSaved = () => {
    setIsFormOpen(false);
    setEditingThreshold(null);
    void refetch();
  };

  const handleEdit = (t: AlertThreshold) => {
    setEditingThreshold(t);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingThreshold) return;
    await deleteThreshold({ variables: { id: deletingThreshold.id } });
  };

  return (
    <div>
      {/* Thresholds section */}
      <div className="border-b border-airq-dark/20">
        <div className="flex items-center justify-between px-4 py-3 bg-airq-dark text-airq-light">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <p className="text-sm font-semibold">alert thresholds</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => void sendTestAlert()}
              disabled={sendingTest}
              className="flex items-center space-x-1 text-xs bg-airq-light/20 px-2 py-1 hover:bg-airq-light/30 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingTest ? 'sending...' : 'test alert'}</span>
            </button>
            <button
              onClick={() => { setEditingThreshold(null); setIsFormOpen(true); }}
              className="flex items-center space-x-1 text-xs bg-airq-contrast px-2 py-1 hover:bg-airq-contrast/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>add threshold</span>
            </button>
          </div>
        </div>

        {testAlertMessage && (
          <div className="px-4 py-2 text-xs bg-airq-primary/10 text-airq-dark border-b border-airq-dark/20">
            {testAlertMessage}
          </div>
        )}

        {loading ? (
          <div className="p-4 text-sm text-airq-dark/60">Loading thresholds...</div>
        ) : thresholds.length === 0 ? (
          <div className="p-4 text-sm text-airq-dark/60">
            No alert thresholds configured. Add one to receive CO2 alerts.
          </div>
        ) : (
          <div className="divide-y divide-airq-dark/10">
            {thresholds.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-airq-dark/5">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-airq-dark">
                      {t.sensor ? t.sensor.name : 'Global (all sensors)'}
                    </span>
                    {!t.isEnabled && (
                      <span className="text-xs text-airq-dark/50 border border-airq-dark/20 px-1.5 py-0.5">disabled</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-airq-dark/60">
                    <span className="text-airq-secondary font-medium">W: {t.warningPpm} ppm</span>
                    <span className="text-airq-tertiary font-medium">C: {t.criticalPpm} ppm</span>
                    <span>cooldown: {t.cooldownMinutes}m</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(t)}
                    className="p-1.5 text-airq-dark/60 hover:text-airq-contrast transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingThreshold(t)}
                    className="p-1.5 text-airq-dark/60 hover:text-airq-tertiary transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert history section */}
      <AlertHistoryTable />

      {/* Create/edit modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingThreshold(null); }}
        title={editingThreshold ? 'edit threshold' : 'new threshold'}
      >
        <AlertThresholdForm
          threshold={editingThreshold}
          sensors={sensors}
          onSaved={handleSaved}
          onCancel={() => { setIsFormOpen(false); setEditingThreshold(null); }}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletingThreshold}
        onClose={() => setDeletingThreshold(null)}
        onConfirm={() => void handleDelete()}
        title="Delete Alert Threshold"
        message={`Delete the threshold for ${deletingThreshold?.sensor?.name ?? 'Global'}?`}
        confirmText="Delete"
        isLoading={deleting}
        variant="danger"
      />
    </div>
  );
};
