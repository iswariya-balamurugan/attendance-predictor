import React, { useMemo } from 'react';
import { Calendar, Percent, BookOpen, User, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { getAllSections, getSubjectsForSection, SEMESTER_START, SEMESTER_END } from '../services/clientServices';

export default function AttendanceForm({
  selectedSection,
  onSelectSection,
  selectedSubjectCode,
  onSelectSubjectCode,
  currentAttendance,
  onChangeAttendance,
  currentDate,
  onChangeCurrentDate,
  planningDate,
  onChangePlanningDate,
  validationError
}) {
  const allSections = useMemo(() => getAllSections(), []);

  // Dynamically load subjects for selected section
  const availableSubjects = useMemo(() => {
    if (!selectedSection) return [];
    try {
      return getSubjectsForSection(selectedSection);
    } catch {
      return [];
    }
  }, [selectedSection]);

  // Selected subject object
  const selectedSubject = useMemo(() => {
    return availableSubjects.find(s => s.subjectCode === selectedSubjectCode) || availableSubjects[0] || null;
  }, [availableSubjects, selectedSubjectCode]);

  // Quick preset percentages
  const attendancePresets = [62, 70, 75, 82, 92];

  // Helper to add days to a date string
  const addDaysToDate = (baseDateStr, days) => {
    const d = new Date(baseDateStr);
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const result = `${yyyy}-${mm}-${dd}`;
    return result > SEMESTER_END ? SEMESTER_END : result;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-tactile overflow-hidden">
      {/* Form Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Attendance Calculation Parameters
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Semester: {SEMESTER_START} → {SEMESTER_END}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Row 1: Section & Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Academic Section</span>
              <span className="text-[11px] font-mono text-slate-500">9 verified sections</span>
            </label>
            <select
              value={selectedSection}
              onChange={(e) => onSelectSection(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-850 border border-slate-700/80 text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono cursor-pointer"
            >
              {allSections.map((sec) => (
                <option key={sec.sectionName} value={sec.sectionName}>
                  {sec.sectionName} ({sec.academicYear} • Sem {sec.semester} • {sec.venue})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Subject / Course</span>
              <span className="text-[11px] font-mono text-slate-500">{availableSubjects.length} enrolled</span>
            </label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => onSelectSubjectCode(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-850 border border-slate-700/80 text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono cursor-pointer"
            >
              {availableSubjects.map((sub) => (
                <option key={sub.subjectCode} value={sub.subjectCode}>
                  [{sub.subjectSlot}] {sub.subjectCode} — {sub.subjectName} ({sub.classType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Subject Tactical Pill Strip */}
        {selectedSubject && (
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-3 font-mono">
              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-semibold text-[11px]">
                SLOT {selectedSubject.subjectSlot}
              </span>
              <span className="font-semibold text-slate-200">{selectedSubject.subjectCode}</span>
              <span className="text-slate-400 hidden sm:inline">— {selectedSubject.subjectName}</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center space-x-1">
                <User className="w-3 h-3 text-slate-500" />
                <span>{selectedSubject.faculty}</span>
              </span>
              <span className="text-slate-700">|</span>
              <span>{selectedSubject.credit} Credits</span>
              <span className="text-slate-700">|</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                selectedSubject.classType === 'lab'
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                  : 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
              }`}>
                {selectedSubject.classType}
              </span>
            </div>
          </div>
        )}

        {/* Row 2: Attendance Percentage & Presets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <Percent className="w-3.5 h-3.5 text-cyan-400" />
              <span>Current Attendance Percentage (%)</span>
            </label>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">Presets:</span>
              {attendancePresets.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onChangeAttendance(pct)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                    currentAttendance === pct
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
            <div className="sm:col-span-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={currentAttendance}
                onChange={(e) => onChangeAttendance(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-mono font-semibold rounded-lg bg-slate-850 border border-slate-700 text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="75.0"
              />
            </div>
            <div className="sm:col-span-3">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={currentAttendance}
                onChange={(e) => onChangeAttendance(parseFloat(e.target.value) || 0)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0% (Detention)</span>
                <span className="text-amber-400 font-semibold">75% (Req)</span>
                <span className="text-cyan-400 font-semibold">90% (Distinction)</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Current As-Of Date & Planning Target Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-slate-800/80">
          {/* Current Date */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>As-Of Date (Current Date)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">Range: Aug 29 → Nov 29</span>
            </label>
            <input
              type="date"
              min={SEMESTER_START}
              max={SEMESTER_END}
              value={currentDate}
              onChange={(e) => onChangeCurrentDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-850 border border-slate-700/80 text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
            />
          </div>

          {/* Planning Target Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Future Planning Date</span>
              </label>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => onChangePlanningDate(addDaysToDate(currentDate, 7))}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                >
                  +7d
                </button>
                <button
                  type="button"
                  onClick={() => onChangePlanningDate(addDaysToDate(currentDate, 14))}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                >
                  +14d
                </button>
                <button
                  type="button"
                  onClick={() => onChangePlanningDate(SEMESTER_END)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 cursor-pointer"
                >
                  End of Sem
                </button>
              </div>
            </div>
            <input
              type="date"
              min={currentDate || SEMESTER_START}
              max={SEMESTER_END}
              value={planningDate}
              onChange={(e) => onChangePlanningDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-850 border border-slate-700/80 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Validation Error Alert if any */}
        {validationError && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-center space-x-2 text-xs text-rose-300 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
