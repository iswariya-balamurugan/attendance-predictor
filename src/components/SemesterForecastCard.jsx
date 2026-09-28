import React, { useState, useMemo } from 'react';
import { Table, Copy, Check, ShieldAlert, Award, FileSpreadsheet, ChevronRight } from 'lucide-react';
import { getSubjectsForSection, getSemesterEndForecast } from '../services/clientServices';
import AttendanceStatusBadge from './AttendanceStatusBadge';

export default function SemesterForecastCard({
  sectionName,
  currentAttendance,
  currentDate,
  onSelectSubject
}) {
  const [copied, setCopied] = useState(false);

  // Compute forecast for all subjects in the section
  const sectionForecasts = useMemo(() => {
    if (!sectionName || !currentDate) return [];
    try {
      const subjects = getSubjectsForSection(sectionName);
      return subjects.map(sub => {
        try {
          return getSemesterEndForecast(sectionName, sub.subjectCode, currentAttendance, currentDate);
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch {
      return [];
    }
  }, [sectionName, currentAttendance, currentDate]);

  // Copy structured report to clipboard
  const handleCopyReport = () => {
    if (sectionForecasts.length === 0) return;
    const lines = [
      `=== SRM ATTENDANCE PREDICTOR AUDIT REPORT ===`,
      `Section: ${sectionName}`,
      `As-Of Date: ${currentDate}`,
      `Current Attendance Basis: ${currentAttendance}%`,
      `----------------------------------------------------------------------------------------------------------------`,
      `Code        | Subject Name                      | Type   | Cond | Rem | Tot | Max % | Req 75 | Skips | Status`,
      `----------------------------------------------------------------------------------------------------------------`
    ];

    sectionForecasts.forEach(f => {
      const code = f.subjectCode.padEnd(11);
      const name = f.subjectName.substring(0, 33).padEnd(33);
      const type = f.classType.toUpperCase().padEnd(6);
      const cond = String(f.classesConducted).padStart(4);
      const rem = String(f.classesRemaining).padStart(3);
      const tot = String(f.totalClasses).padStart(3);
      const maxP = `${f.maximumPossibleAttendance.toFixed(1)}%`.padStart(6);
      const req = String(f.requiredFor75).padStart(6);
      const skips = String(f.maxMissableFor75).padStart(5);
      const status = f.status.padEnd(20);
      lines.push(`${code} | ${name} | ${type} | ${cond} | ${rem} | ${tot} | ${maxP} | ${req} | ${skips} | ${status}`);
    });

    lines.push(`----------------------------------------------------------------------------------------------------------------`);
    lines.push(`Generated via SRM Attendance Engine (STP1-STP4 Verified Ground Truth)`);

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-tactile overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Full Section Semester Audit Matrix ({sectionName})
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
            {sectionForecasts.length} Courses
          </span>
        </div>

        <button
          onClick={handleCopyReport}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors shadow-tactile cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Full Audit Report</span>
            </>
          )}
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4">Subject</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3 text-right">Conducted</th>
              <th className="py-2.5 px-3 text-right">Remaining</th>
              <th className="py-2.5 px-3 text-right">Total</th>
              <th className="py-2.5 px-3 text-right">Max %</th>
              <th className="py-2.5 px-3 text-right">Req (75%)</th>
              <th className="py-2.5 px-3 text-right">Allowable Skips</th>
              <th className="py-2.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 font-mono">
            {sectionForecasts.map((f, idx) => {
              return (
                <tr
                  key={idx}
                  onClick={() => onSelectSubject && onSelectSubject(f.subjectCode)}
                  className="hover:bg-slate-850/60 transition-colors cursor-pointer group"
                >
                  {/* Subject Name & Code */}
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors flex items-center space-x-1">
                      <span>{f.subjectCode}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans truncate max-w-[200px]">
                      {f.subjectName}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      f.classType === 'lab'
                        ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {f.classType}
                    </span>
                  </td>

                  {/* Conducted */}
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {f.classesConducted}
                  </td>

                  {/* Remaining */}
                  <td className="py-2.5 px-3 text-right text-cyan-400">
                    {f.classesRemaining}
                  </td>

                  {/* Total */}
                  <td className="py-2.5 px-3 text-right text-slate-400 font-bold">
                    {f.totalClasses}
                  </td>

                  {/* Max % */}
                  <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                    {f.maximumPossibleAttendance.toFixed(1)}%
                  </td>

                  {/* Req for 75% */}
                  <td className="py-2.5 px-3 text-right">
                    {f.requiredFor75 === 0 ? (
                      <span className="text-emerald-400">0</span>
                    ) : (
                      <span className="text-amber-400 font-bold">{f.requiredFor75}</span>
                    )}
                  </td>

                  {/* Allowable Skips */}
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                    {f.maxMissableFor75}
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-4 text-right">
                    <AttendanceStatusBadge status={f.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
