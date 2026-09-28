import React, { useState } from 'react';
import { Sunrise, Sun, Sunset, Moon, Clock } from 'lucide-react';
import { ChartEmptyState } from './ChartStates';

export interface PeakDarshanPeriod {
  key: string;
  devCount: number | string;
  label: string;
  hours: string;
  subtitle?: string;
  rushLevel?: 'PEAK' | 'MODERATE' | 'SMOOTH' | string;
  rushLabel?: string;
}

export interface PeakDarshanHoursChartProps {
  data?: PeakDarshanPeriod[];
  height?: number | string;
  emptyMessage?: string;
}

/**
 * PeakDarshanHoursChart
 * 
 * Innovative, operational queue & footfall analysis component designed specifically for Temple Authorities:
 * Analyzes devotee flow and crowd density across key darshan & seva time windows throughout the day.
 * 
 * Windows:
 * 1. Early Morning (06:00 - 08:00) • Suprabhatham / Nirmalya
 * 2. Morning Rush (08:00 - 11:00) • Morning Darshanam & Archana
 * 3. Midday (11:00 - 14:00) • Uchikala Pooja & Naivedyam
 * 4. Evening Sayaratchai (16:00 - 18:00) • Evening Darshan & Aarti
 * 5. Night Arthajama (18:00 - 21:00) • Night Pooja & Ekantha Seva
 */
export const PeakDarshanHoursChart: React.FC<PeakDarshanHoursChartProps> = ({
  data = [],
  height = 320,
  emptyMessage = 'No darshan slot bookings recorded for this period.',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const periods = data || [];
  const totalDevotees = periods.reduce((acc, p) => acc + (Number(p.devCount) || 0), 0);

  if (!periods || periods.length === 0 || totalDevotees === 0) {
    return <ChartEmptyState message={emptyMessage} height={height} />;
  }

  // Icons map for time of day
  const getPeriodIcon = (key: string): React.ComponentType<{ className?: string }> => {
    switch (key) {
      case 'EARLY_MORNING':
        return Sunrise;
      case 'MORNING':
        return Sun;
      case 'MIDDAY':
        return Sun;
      case 'EVENING':
        return Sunset;
      case 'NIGHT':
        return Moon;
      default:
        return Clock;
    }
  };

  const maxCount = Math.max(...periods.map((p) => Number(p.devCount) || 0), 1);

  return (
    <div className="w-full flex flex-col justify-between py-2 select-none space-y-3.5">
      {periods.map((period, idx) => {
        const Icon = getPeriodIcon(period.key);
        const count = Number(period.devCount) || 0;
        const relativePct = Math.round((count / maxCount) * 100);
        const sharePct = totalDevotees > 0 ? ((count / totalDevotees) * 100).toFixed(1) : '0';
        const isHovered = hoveredIdx === idx;

        // Rush badge config
        const isPeak = period.rushLevel === 'PEAK';
        const isModerate = period.rushLevel === 'MODERATE';

        const badgeClass = isPeak
          ? 'bg-rose-50 text-rose-800 border-rose-200'
          : isModerate
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200';

        const barGradient = isPeak
          ? 'from-amber-500 to-rose-500'
          : isModerate
          ? 'from-amber-400 to-amber-600'
          : 'from-emerald-400 to-teal-600';

        return (
          <div
            key={period.key || idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`p-3.5 rounded-xl border transition-all duration-200 ${
              isHovered
                ? 'bg-[#FAF6F0] border-amber-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] -translate-y-0.5'
                : 'bg-white border-[#EAE0D0]/80 hover:border-[#EAE0D0]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Left Info: Icon + Name + Hours */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                    isPeak
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : isModerate
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-[13px] tracking-tight truncate">
                      {period.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F4EFEA] text-slate-600 border border-[#E5DFD6]">
                      {period.hours}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {period.subtitle || 'Scheduled darshan and pooja slots'}
                  </p>
                </div>
              </div>

              {/* Right Info: Footfall Stats & Rush Badge */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border flex items-center gap-1 ${badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isPeak ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  <span>{period.rushLabel || (isPeak ? 'Peak Rush' : isModerate ? 'Moderate Crowd' : 'Smooth Flow')}</span>
                </span>

                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-slate-900 leading-none">
                    {count.toLocaleString('en-IN')}{' '}
                    <span className="text-[11px] font-sans font-normal text-slate-500">devotees</span>
                  </div>
                  <div className="text-[10.5px] font-mono font-medium text-slate-400 mt-0.5">
                    {sharePct}% of daily crowd
                  </div>
                </div>
              </div>
            </div>

            {/* Density Progress Track */}
            <div className="mt-3 w-full bg-[#F4EFEA] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500 ease-out`}
                style={{ width: `${Math.max(4, relativePct)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PeakDarshanHoursChart;
