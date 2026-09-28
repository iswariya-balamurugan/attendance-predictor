import React from 'react';
import { ShieldCheck, Award, AlertCircle, ArrowUpRight, CheckCircle, Info } from 'lucide-react';

export default function TargetPanels({ forecast, planningPlan }) {
  if (!forecast) return null;

  const {
    currentAttendance,
    classesRemaining,
    totalClasses,
    maximumPossibleAttendance,
    canReach75,
    requiredFor75,
    canReach90,
    requiredFor90,
    status
  } = forecast;

  // Max missable classes from semester forecast or planning plan
  const maxMissableSemester = forecast.maxMissableFor75 ?? (
    forecast.maximumClassesCanBeMissedFor75 ?? 0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Panel 1: 75% Mandatory Minimum Threshold */}
      <div className={`p-5 rounded-xl border bg-slate-900 shadow-tactile ${
        !canReach75
          ? 'border-rose-500/50 bg-rose-950/10'
          : requiredFor75 > 0
          ? 'border-amber-500/40 bg-amber-950/10'
          : 'border-emerald-500/40 bg-emerald-950/10'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-md ${
              !canReach75
                ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                : requiredFor75 > 0
                ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                75% Mandatory Threshold
              </h4>
              <p className="text-[11px] text-slate-400">SRM University Detention Barrier</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
            !canReach75
              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
              : requiredFor75 > 0
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
          }`}>
            {!canReach75 ? 'UNACHIEVABLE' : requiredFor75 > 0 ? 'RECOVERY NEEDED' : 'COMPLIANT'}
          </span>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Required for 75% */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Must Attend Consecutively
              </span>
              <div className="mt-1 text-2xl font-mono font-bold text-slate-100">
                {requiredFor75}
                <span className="text-xs font-normal text-slate-400 ml-1">classes</span>
              </div>
              <span className="text-[10px] text-slate-500">To touch 75.0%</span>
            </div>

            {/* Allowable Skips (Max Missable) */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Allowable Skips (Safe)
              </span>
              <div className="mt-1 text-2xl font-mono font-bold text-emerald-400">
                {maxMissableSemester}
                <span className="text-xs font-normal text-slate-400 ml-1">classes</span>
              </div>
              <span className="text-[10px] text-slate-500">Without falling below 75%</span>
            </div>
          </div>

          {/* Tactical Advice Box */}
          <div className="p-3 rounded-lg bg-slate-850/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
            {!canReach75 ? (
              <p className="text-rose-300 flex items-start space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>
                  <strong>Irreversible Detention:</strong> Even if you attend all remaining {classesRemaining} scheduled classes, your maximum possible attendance will only be <strong>{maximumPossibleAttendance.toFixed(1)}%</strong>. Contact your academic advisor immediately.
                </span>
              </p>
            ) : requiredFor75 > 0 ? (
              <p className="text-amber-300 flex items-start space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  <strong>Detention Recovery Plan:</strong> You must attend the next <strong>{requiredFor75}</strong> consecutive classes without a single absence to bring your attendance back to the 75% safety line.
                </span>
              </p>
            ) : (
              <p className="text-emerald-300 flex items-start space-x-1.5">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  <strong>Attendance Buffer Active:</strong> You currently have a safety cushion. You can safely miss up to <strong>{maxMissableSemester}</strong> remaining classes throughout the semester while keeping attendance at or above 75.0%.
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Panel 2: 90% Distinction Benchmark */}
      <div className={`p-5 rounded-xl border bg-slate-900 shadow-tactile ${
        status === '90% ACHIEVED'
          ? 'border-cyan-500/40 bg-cyan-950/10'
          : canReach90
          ? 'border-slate-800'
          : 'border-slate-800/80 opacity-90'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-md ${
              status === '90% ACHIEVED'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                : canReach90
                ? 'bg-slate-800 text-cyan-400'
                : 'bg-slate-800 text-slate-500'
            }`}>
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                90% Distinction Benchmark
              </h4>
              <p className="text-[11px] text-slate-400">Academic Honors & Excellence</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
            status === '90% ACHIEVED'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
              : canReach90
              ? 'bg-slate-800 text-cyan-300 border border-slate-700'
              : 'bg-slate-800 text-slate-500 border border-slate-750'
          }`}>
            {status === '90% ACHIEVED' ? '90% ACHIEVED' : canReach90 ? 'ACHIEVABLE' : 'OUT OF REACH'}
          </span>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Required for 90% */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Required for 90%
              </span>
              <div className="mt-1 text-2xl font-mono font-bold text-slate-100">
                {canReach90 ? (
                  requiredFor90 === 0 ? (
                    <span className="text-cyan-400">0</span>
                  ) : (
                    <span className="text-cyan-400">{requiredFor90}</span>
                  )
                ) : (
                  <span className="text-slate-500">—</span>
                )}
                <span className="text-xs font-normal text-slate-400 ml-1">classes</span>
              </div>
              <span className="text-[10px] text-slate-500">
                {canReach90 ? (requiredFor90 === 0 ? 'Already at or above 90%' : 'Consecutive attendances') : 'Impossible this term'}
              </span>
            </div>

            {/* Ceiling / Headroom */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Maximum Ceiling
              </span>
              <div className="mt-1 text-2xl font-mono font-bold text-cyan-300">
                {maximumPossibleAttendance.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500">
                {maximumPossibleAttendance >= 90
                  ? `+${(maximumPossibleAttendance - 90).toFixed(1)}% above target`
                  : `${(90 - maximumPossibleAttendance).toFixed(1)}% short of 90%`}
              </span>
            </div>
          </div>

          {/* Tactical Advice Box */}
          <div className="p-3 rounded-lg bg-slate-850/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
            {status === '90% ACHIEVED' ? (
              <p className="text-cyan-300 flex items-start space-x-1.5">
                <CheckCircle className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                <span>
                  <strong>Distinction Standing:</strong> Your current attendance is at <strong>{currentAttendance.toFixed(1)}%</strong>, comfortably qualifying for university academic distinction.
                </span>
              </p>
            ) : canReach90 ? (
              <p className="text-slate-300 flex items-start space-x-1.5">
                <Info className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                <span>
                  <strong>Distinction is Achievable:</strong> If you attend the next <strong>{requiredFor90}</strong> classes consecutively, your attendance will rise to exactly 90.0%.
                </span>
              </p>
            ) : (
              <p className="text-slate-400 flex items-start space-x-1.5">
                <Info className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
                <span>
                  <strong>90% Benchmark Out of Reach:</strong> Even if you attend all {classesRemaining} remaining classes, maximum attendance reaches <strong>{maximumPossibleAttendance.toFixed(1)}%</strong>. Focus on maintaining &gt;75%.
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
