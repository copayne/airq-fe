/**
 * Air Quality Heatmap Chart
 *
 * Displays a calendar-style heatmap showing air quality scores over the past year.
 * Each cell represents one day, colored from red (poor) to green (good).
 *
 * IMPORTANT: This component is RENDER ONLY. All business logic, calculations,
 * and scoring are performed server-side via the GraphQL API.
 */

import { useQuery } from '@apollo/client';
import React, { memo, useMemo } from 'react';
import { DataStateWrapper } from '~/components/common/DataStateWrapper';
import { GET_DAILY_AIR_QUALITY_SCORES } from '~/graphql/AirQuality';
import { CACHE_FIRST_OPTIONS } from '~/lib/apolloDefaults';
import type { DailyAirQualityScore, GetDailyAirQualityScoresData } from '~/types/sensors';
import type { AirQualityHeatmapConfig } from '~/types/widgetConfig';

interface HeatmapCellProps {
  score: number | null;
  date: string;
  readingCount: number;
}

/**
 * Get color for a score value (0-100)
 * 100 = bright green, 0 = bright red
 */
function getScoreColor(score: number | null): string {
  if (score === null) return '#e5e5e5'; // Gray for no data

  // Clamp score to 0-100
  const s = Math.max(0, Math.min(100, score));

  // Interpolate from red (0) to green (100)
  // Red: #ED4C4C (237, 76, 76)
  // Yellow: #FFC914 (255, 201, 20) at 50
  // Green: #137547 (19, 117, 71)

  if (s <= 50) {
    // Red to Yellow
    const t = s / 50;
    const r = Math.round(237 + (255 - 237) * t);
    const g = Math.round(76 + (201 - 76) * t);
    const b = Math.round(76 + (20 - 76) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to Green
    const t = (s - 50) / 50;
    const r = Math.round(255 + (19 - 255) * t);
    const g = Math.round(201 + (117 - 201) * t);
    const b = Math.round(20 + (71 - 20) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

const HeatmapCell: React.FC<HeatmapCellProps> = memo(({ score, date, readingCount }) => {
  const color = getScoreColor(score);
  const title = score !== null
    ? `${date}: Score ${score.toFixed(0)} (${readingCount} readings)`
    : `${date}: No data`;

  return (
    <div
      className="w-3 h-3 rounded-sm border border-gray-400"
      style={{ backgroundColor: color }}
      title={title}
    />
  );
});

HeatmapCell.displayName = 'HeatmapCell';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthData {
  month: number;
  year: number;
  days: (DailyAirQualityScore | null)[];
}

function organizeByMonth(scores: DailyAirQualityScore[], daysToShow: number): MonthData[] {
  // Create a map for quick lookup
  const scoreMap = new Map<string, DailyAirQualityScore>();
  scores.forEach(s => scoreMap.set(s.date, s));

  // Get the date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (daysToShow - 1)); // daysToShow including today

  // Organize by month
  const monthsMap = new Map<string, MonthData>();

  const current = new Date(startDate);
  while (current <= endDate) {
    const monthKey = `${current.getFullYear()}-${current.getMonth()}`;
    const dateStr = current.toISOString().split('T')[0]!;

    if (!monthsMap.has(monthKey)) {
      monthsMap.set(monthKey, {
        month: current.getMonth(),
        year: current.getFullYear(),
        days: []
      });
    }

    const monthData = monthsMap.get(monthKey)!;
    const dayOfMonth = current.getDate();

    // Ensure array is large enough
    while (monthData.days.length < dayOfMonth) {
      monthData.days.push(null);
    }

    monthData.days[dayOfMonth - 1] = scoreMap.get(dateStr) ?? null;

    current.setDate(current.getDate() + 1);
  }

  // Convert to array and sort by date
  return Array.from(monthsMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

interface AirQualityHeatmapProps {
  config?: AirQualityHeatmapConfig;
}

const AirQualityHeatmap: React.FC<AirQualityHeatmapProps> = memo(({ config }) => {
  // Use config days value if provided, otherwise default to 548 (1.5 years)
  const days = config?.days ?? 548;

  const { data, loading, error } = useQuery<GetDailyAirQualityScoresData>(
    GET_DAILY_AIR_QUALITY_SCORES,
    {
      ...CACHE_FIRST_OPTIONS,
      variables: { days },
    }
  );

  const monthsData = useMemo(() => {
    if (!data?.dailyAirQualityScores) return [];
    return organizeByMonth(data.dailyAirQualityScores, days);
  }, [data, days]);

  // Find max days in any month for consistent row count
  const maxDays = 31;

  return (
    <DataStateWrapper
      loading={loading}
      error={error}
      data={data?.dailyAirQualityScores}
      errorMessage="Error loading air quality heatmap"
      emptyMessage="No air quality data available"
      className="h-full flex items-center justify-center"
      showSpinner={true}
    >
      <div className="h-full w-full p-2 flex flex-col overflow-hidden">
        {/* Legend */}
        <div className="flex justify-end items-center gap-2 mb-2">
          <span className="text-[9px] text-gray-500">Poor</span>
          <div
            className="h-2 w-20 rounded-sm"
            style={{
              background: 'linear-gradient(to right, #ED4C4C, #FFC914, #137547)'
            }}
          />
          <span className="text-[9px] text-gray-500">Good</span>
        </div>

        {/* Heatmap grid */}
        <div className="flex-1 w-fit m-auto pr-4 overflow-hidden">
          <div className="flex gap-[1px] h-full">
            {/* Day labels column */}
            <div className="flex flex-col gap-[1px] justify-start pt-4">
              {Array.from({ length: maxDays }, (_, i) => (
                <div key={i} className="h-3 text-[8px] text-gray-400 leading-3 text-right pr-1">
                  {(i + 1) % 5 === 1 ? i + 1 : ''}
                </div>
              ))}
            </div>

            {/* Month columns */}
            {monthsData.map((monthData) => (
              <div key={`${monthData.year}-${monthData.month}`} className="flex flex-col gap-[1px]">
                {/* Month label */}
                <div className="h-4 text-[8px] text-gray-500 text-center">
                  {MONTH_NAMES[monthData.month]}
                </div>
                {/* Day cells */}
                {Array.from({ length: maxDays }, (_, dayIndex) => {
                  const dayData = monthData.days[dayIndex];
                  if (dayData) {
                    return (
                      <HeatmapCell
                        key={dayIndex}
                        score={dayData.score}
                        date={dayData.date}
                        readingCount={dayData.readingCount}
                      />
                    );
                  }
                  // Empty cell for days that don't exist in this month or no data
                  const daysInMonth = new Date(monthData.year, monthData.month + 1, 0).getDate();
                  if (dayIndex >= daysInMonth) {
                    return <div key={dayIndex} className="w-3 h-3" />;
                  }
                  return (
                    <div
                      key={dayIndex}
                      className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-400"
                      title={`${monthData.year}-${String(monthData.month + 1).padStart(2, '0')}-${String(dayIndex + 1).padStart(2, '0')}: No data`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DataStateWrapper>
  );
});

AirQualityHeatmap.displayName = 'AirQualityHeatmap';

export default AirQualityHeatmap;
