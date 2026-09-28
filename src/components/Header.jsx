import React, { useState } from 'react';
import { Database, ShieldCheck, Calendar, BookOpen, AlertTriangle, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { getAllSections, getExcludedSections, getSemesterInfo } from '../services/clientServices';

export default function Header() {
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);
  const sections = getAllSections();
  const excluded = getExcludedSections();
  const semester = getSemesterInfo();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 border border-slate-700/60 shadow-tactile">
              <span className="font-mono font-bold text-sm text-cyan-400">SRM</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
                  Attendance Predictor
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                  v2026.1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                ODD SEMESTER • {semester.startDate} → {semester.endDate}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Dataset Audit Trigger */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden md:flex items-center space-x-3 text-xs font-mono text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="text-slate-400">Sections:</span>
                <span className="text-slate-100 font-semibold">{sections.length}</span>
              </span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-400">Subjects:</span>
                <span className="text-slate-100 font-semibold">85</span>
              </span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="text-slate-400">Weekly Classes:</span>
                <span className="text-slate-100 font-semibold">244</span>
              </span>
            </div>

            <button
              onClick={() => setShowIntegrityModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-cyan-300 border border-slate-700/80 transition-colors shadow-tactile cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dataset Rules</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dataset Rules Modal */}
      {showIntegrityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Dataset Validation & Rules</h3>
                  <p className="text-xs text-slate-400">STP1 & STP2 Verified Ground Truth</p>
                </div>
              </div>
              <button
                onClick={() => setShowIntegrityModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-slate-300">
              {/* Semester info banner */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Academic Year</span>
                  <span className="text-slate-200 font-semibold">{semester.academicYear}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Semester Bounds</span>
                  <span className="text-cyan-300 font-semibold">{semester.startDate} → {semester.endDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Total Days</span>
                  <span className="text-slate-200 font-semibold">93 Calendar Days</span>
                </div>
              </div>

              {/* Verified Sections List */}
              <div>
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified 2026–27 Sections (9 Total)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sections.map((sec, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-850 border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-100">{sec.sectionName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {sec.academicYear} • Sem {sec.semester} • {sec.venue}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        {sec.weeklyClassCount} classes/wk
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Excluded 2024-25 Sections */}
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20">
                <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Excluded 2024–25 Archive Timetables (Strictly Excluded)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mb-2">
                  Per challenge instructions, 2024–25 archival timetables are fully excluded from prediction calculations.
                </p>
                <div className="space-y-1">
                  {excluded.map((item, idx) => (
                    <div key={idx} className="text-[11px] font-mono text-slate-300 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span className="text-rose-200 font-medium">{item.sectionName}</span>
                      <span className="text-slate-500">({item.academicYear}, Page {item.pdfPage}) — {item.reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Period Timings & Non-Class Rules */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                  Period Timings & Schedule Constraints
                </h4>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                  <li><strong className="text-slate-300">Period 5 (12:30 – 13:20):</strong> Mandatory Lunch Break (0 classes scheduled).</li>
                  <li><strong className="text-slate-300">Tea Breaks:</strong> 10:40–10:50 (Morning) & 15:00–15:10 (Afternoon) — not counted as classes.</li>
                  <li><strong className="text-slate-300">Laboratory Sessions:</strong> Spans 2 consecutive periods; counted as 2 scheduled class periods.</li>
                  <li><strong className="text-slate-300">Free/Empty Slots:</strong> Excluded from class conducted and remaining metrics.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/50">
              <button
                onClick={() => setShowIntegrityModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
