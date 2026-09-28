import React from 'react';
import { Target, CheckCircle2, AlertOctagon, TrendingUp, HelpCircle, Activity } from 'lucide-react';
import AttendanceStatusBadge from './AttendanceStatusBadge';

export default function AttendanceOverview({ forecast }) {
  if (!forecast) return null;

  const {
    currentAttendance,
    classesConducted,
    estimatedAttendedClasses,
    classesRemaining,
    totalClasses,
    maximumPossibleAttendance,
    canReach75,
    requiredFor75,
    canReach90,
    requiredFor90,
    status
  } = forecast;

  // Determine meter stroke color
  const getMeterColor = () => {
    switch (status) {
      case '90% ACHIEVED':
        return '#06b6d4'; // cyan
      case 'SAFE':
        return '#10b981'; // emerald
      case 'DETENTION RISK':
        return '#f59e0b'; // amber
      case 'IRREVERSIBLE DETENTION':
        return '#f43f5e'; // rose
      default:
        return '#10b981';
    }
  };

  // Radial progress calculations (circumference for r=42 is ~264)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, currentAttendance)) / 100) * circumference;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-tactile overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Current Attendance Posture & Engine Metrics
          </h3>
        </div>
        <AttendanceStatusBadge status={status} />
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Radial Meter / Visual Gauge (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* 75% reference tick / subtle ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-amber-500/20"
                  strokeWidth="8"
                  strokeDasharray="2 6"
                  fill="transparent"
                />
                {/* Main progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={getMeterColor()}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              {/* Center Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
                  {currentAttendance.toFixed(1)}%
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Current
                </span>
              </div>
            </div>

            {/* Threshold Guide */}
            <div className="mt-3 flex items-center justify-between w-full text-[11px] font-mono px-2 pt-2 border-t border-slate-850">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-slate-400">75% Min</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="text-slate-400">90% Goal</span>
              </div>
            </div>
          </div>

          {/* Tactical Metric Grid (8 cols on lg) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Tile 1: Conducted Classes */}
            <div className="p-3.5 rounded-lg bg-slate-850/70 border border-slate-800 shadow-sm">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Conducted (T)
              </div>
              <div className="mt-1 text-xl font-mono font-bold text-slate-100">
                {classesConducted}
              </div>
              <div className="text-[11px] text-slate-400">Classes so far</div>
            </div>

            {/* Tile 2: Estimated Attended */}
            <div className="p-3.5 rounded-lg bg-slate-850/70 border border-slate-800 shadow-sm">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Attended (A)
              </div>
              <div className="mt-1 text-xl font-mono font-bold text-emerald-400">
                {estimatedAttendedClasses}
              </div>
              <div className="text-[11px] text-slate-400">Classes present</div>
            </div>

            {/* Tile 3: Classes Remaining */}
            <div className="p-3.5 rounded-lg bg-slate-850/70 border border-slate-800 shadow-sm">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Remaining (R)
              </div>
              <div className="mt-1 text-xl font-mono font-bold text-cyan-400">
                {classesRemaining}
              </div>
              <div className="text-[11px] text-slate-400">Scheduled ahead</div>
            </div>

            {/* Tile 4: Total Semester Classes */}
            <div className="p-3.5 rounded-lg bg-slate-850/70 border border-slate-800 shadow-sm">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Total Classes
              </div>
              <div className="mt-1 text-xl font-mono font-bold text-slate-100">
                {totalClasses}
              </div>
              <div className="text-[11px] text-slate-400">Full term (T + R)</div>
            </div>

            {/* Tile 5: Maximum Possible Attendance */}
            <div className="col-span-2 p-3.5 rounded-lg bg-slate-850/70 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Maximum Possible Ceiling
                </span>
                <span className="text-[11px] font-mono text-cyan-400">100% of remaining</span>
              </div>
              <div className="mt-1 text-2xl font-mono font-bold text-cyan-300">
                {maximumPossibleAttendance.toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                If you attend every single remaining class ({classesRemaining} classes)
              </div>
            </div>

            {/* Tile 6: Minimum 75% Requirement */}
            <div className="col-span-2 p-3.5 rounded-lg bg-slate-850/70 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  75% Compliance Status
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  canReach75
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-950/70 text-rose-300 border border-rose-500/30'
                }`}>
                  {canReach75 ? 'ACHIEVABLE' : 'IMPOSSIBLE'}
                </span>
              </div>
              <div className="mt-1 text-2xl font-mono font-bold text-slate-100">
                {requiredFor75 === 0 ? (
                  <span className="text-emerald-400">0 Classes</span>
                ) : (
                  <span className="text-amber-400">{requiredFor75} Classes</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {requiredFor75 === 0
                  ? 'Currently above 75% threshold'
                  : `Must attend next ${requiredFor75} classes without missing`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
