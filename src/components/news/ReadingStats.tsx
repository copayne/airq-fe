import React from 'react';
import { Modal } from '~/components/common/Modal';
import { useReadingStats } from '~/hooks/useReadingStats';
import { formatMinutes } from '~/utils/dateUtils';

interface ReadingStatsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReadingStats: React.FC<ReadingStatsProps> = ({ isOpen, onClose }) => {
  const { stats } = useReadingStats();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reading Stats" size="md">
      <div className="space-y-6 font-mono">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-airq-dark/5 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-airq-dark">{stats.today.count}</p>
            <p className="text-xs text-airq-dark/50 mt-1">today</p>
            <p className="text-xs text-airq-dark/30">{formatMinutes(stats.today.timeMin)}</p>
          </div>
          <div className="bg-airq-dark/5 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-airq-dark">{stats.week.count}</p>
            <p className="text-xs text-airq-dark/50 mt-1">this week</p>
            <p className="text-xs text-airq-dark/30">{formatMinutes(stats.week.timeMin)}</p>
          </div>
          <div className="bg-airq-dark/5 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-airq-dark">{stats.allTime.count}</p>
            <p className="text-xs text-airq-dark/50 mt-1">all time</p>
            <p className="text-xs text-airq-dark/30">{formatMinutes(stats.allTime.timeMin)}</p>
          </div>
        </div>

        {/* Streak */}
        {stats.streak > 0 && (
          <div className="flex items-center justify-between px-3 py-2 bg-airq-dark/5 rounded-lg">
            <span className="text-sm text-airq-dark/60">Reading streak</span>
            <span className="text-sm font-medium text-airq-dark">
              {stats.streak} day{stats.streak !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Top feeds */}
        {stats.topFeeds.length > 0 && (
          <div>
            <p className="text-xs text-airq-dark/50 uppercase tracking-wider mb-2">Most read</p>
            <div className="space-y-1">
              {stats.topFeeds.map(([name, count]) => (
                <div
                  key={name}
                  className="flex items-center justify-between px-3 py-1.5 rounded hover:bg-airq-dark/5 transition-colors"
                >
                  <span className="text-sm text-airq-dark truncate pr-3">{name}</span>
                  <span className="text-xs text-airq-dark/40 flex-shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.allTime.count === 0 && (
          <p className="text-sm text-airq-dark/40 text-center py-4">
            No reading activity recorded yet.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default ReadingStats;
