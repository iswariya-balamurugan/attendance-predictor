import React, { useState, useMemo } from 'react';
import { CalendarRange, Sliders, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PlanAheadSection({
  planningPlan,
  planningDate,
  currentDate,
  subjectCode
}) {
  if (!planningPlan) return null;

  const {
    classesConducted,
    estimatedAttendedClasses,
    totalUpcomingClasses,
    totalClassesInScope,
    canReach75,
    canMiss,
    mustAttend,
    projectedAttendanceIfAllAttended,
    projectedAttendanceIfMaxMissed
  } = planningPlan;

  // Simulator state: how many classes student wants to simulate missing
  const [simulatedSkips, setSimulatedSkips] = useState(canMiss);

  // Update simulator when canMiss changes from props
  React.useEffect(() => {
    setSimulatedSkips(canMiss);
  }, [canMiss, totalUpcomingClasses]);

  // Compute simulated projected attendance
  const simulatedProjected = useMemo(() => {
    if (totalClassesInScope <= 0) return 0;
    const attendedInPlan = totalUpcomingClasses - simulatedSkips;
    const totalAttended = estimatedAttendedClasses + attendedInPlan;
    const pct = (totalAttended / totalClassesInScope) * 100;
    return Number(pct.toFixed(2));
  }, [totalClassesInScope, totalUpcomingClasses, simulatedSkips, estimatedAttendedClasses]);

  const isSimulatedSafe = simulatedProjected >= 75.0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-tactile overflow-hidden">
      {/* Section Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarRange className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Future Attendance Planning & Allowable Skips Engine
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
          <span>Target Date:</span>
          <span className="text-emerald-300 font-semibold">{planningDate}</span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Core Question & Answer Banner */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono mb-1">
            EXECUTIVE FORECAST WINDOW: <span className="text-slate-200">{currentDate}</span> → <span className="text-emerald-300 font-semibold">{planningDate}</span>
          </div>
          
          <div className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
            {totalUpcomingClasses === 0 ? (
              <span>There are 0 scheduled classes between {currentDate} and {planningDate}.</span>
            ) : !canReach75 ? (
              <span className="text-rose-400">
                Attendance cannot reach 75% by {planningDate}. Maximum possible attendance is {projectedAttendanceIfAllAttended}%.
              </span>
            ) : (
              <span>
                Between now and <span className="text-emerald-300 font-mono">{planningDate}</span> ({totalUpcomingClasses} upcoming classes scheduled), you can safely skip{' '}
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-lg">
                  {canMiss}
                </span>{' '}
                classes while keeping attendance at or above 75.0%.
              </span>
            )}
          </div>
        </div>

        {/* 3-Column Tactical Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Total Upcoming */}
          <div className="p-3.5 rounded-lg bg-slate-850/70 border border-slate-800">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Upcoming Classes
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-slate-100">
              {totalUpcomingClasses}
            </div>
            <div className="text-[11px] text-slate-400">In planning interval</div>
          </div>

          {/* Card 2: Allowable Skips */}
          <div className="p-3.5 rounded-lg bg-slate-850/70 border border-slate-800">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Allowable Skips (Safe)
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-emerald-400">
              {canMiss}
            </div>
            <div className="text-[11px] text-slate-400">
              {canMiss === 0 ? 'No skips allowed' : 'Max classes you can miss'}
            </div>
          </div>

          {/* Card 3: Must Attend */}
          <div className="p-3.5 rounded-lg bg-slate-850/70 border border-slate-800">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Mandatory Attend
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-cyan-400">
              {mustAttend}
            </div>
            <div className="text-[11px] text-slate-400">Must attend in interval</div>
          </div>
        </div>

        {/* Interactive "What-If" Scenario Simulator */}
        {totalUpcomingClasses > 0 && (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Interactive "What-If" Skip Simulator
                </h4>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                isSimulatedSafe
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-950 text-rose-300 border border-rose-500/30'
              }`}>
                {isSimulatedSafe ? 'SAFE (≥ 75%)' : 'DETENTION RISK (< 75%)'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">
                  Simulate skipping: <strong className="text-cyan-400 text-sm">{simulatedSkips}</strong> of {totalUpcomingClasses} classes
                </span>
                <span className="text-slate-400">
                  Attending: <strong className="text-emerald-400">{totalUpcomingClasses - simulatedSkips}</strong> classes
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={totalUpcomingClasses}
                step="1"
                value={simulatedSkips}
                onChange={(e) => setSimulatedSkips(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 skips (Attend all)</span>
                <span className="text-emerald-400">Max safe: {canMiss} skips</span>
                <span>{totalUpcomingClasses} skips (Miss all)</span>
              </div>
            </div>

            {/* Projected Simulation Result Pill */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Projected Attendance by {planningDate}
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-xl font-mono font-bold ${
                    isSimulatedSafe ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {simulatedProjected.toFixed(2)}%
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({estimatedAttendedClasses + (totalUpcomingClasses - simulatedSkips)} / {totalClassesInScope} classes)
                  </span>
                </div>
              </div>

              <div className="text-right">
                {isSimulatedSafe ? (
                  <div className="flex items-center space-x-1 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Safe (+{(simulatedProjected - 75).toFixed(1)}% buffer)</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-rose-400 text-xs font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{(75 - simulatedProjected).toFixed(1)}% below required</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
