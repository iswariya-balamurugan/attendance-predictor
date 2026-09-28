import React from 'react';
import { Calendar, ShieldAlert, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LandingHero({ onQuickStart }) {
  return (
    <section className="relative pt-6 pb-8 border-b border-slate-800/60 bg-gradient-to-b from-slate-900/40 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Main Title & Subtitle (Taste Skill: constrained text elements, no fluff) */}
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>SRM OFFICIAL 2026–27 ACADEMIC TIMETABLE DATASET</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Attendance Forecasting & Detention Safeguard
            </h2>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              Calculate exact 75% compliance, allowable skips, and 90% distinction targets based on real scheduled class occurrences between <span className="font-mono text-cyan-300">29 Aug 2026</span> and <span className="font-mono text-cyan-300">29 Nov 2026</span>.
            </p>
          </div>

          {/* Quick Metrics & Callout Cards */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0">
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 shadow-tactile">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Verified</div>
              <div className="text-lg font-mono font-bold text-cyan-400">9 Sections</div>
              <div className="text-[11px] text-slate-400">2026–27 Only</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 shadow-tactile">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Threshold</div>
              <div className="text-lg font-mono font-bold text-emerald-400">75.0%</div>
              <div className="text-[11px] text-slate-400">Mandatory Min</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 shadow-tactile">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Distinction</div>
              <div className="text-lg font-mono font-bold text-cyan-400">90.0%</div>
              <div className="text-[11px] text-slate-400">Target Level</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
