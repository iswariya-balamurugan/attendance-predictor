import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Filter, Layers, Beaker, BookOpen, MapPin } from 'lucide-react';
import { getUpcomingClasses } from '../services/clientServices';

export default function UpcomingClassesView({
  sectionName,
  selectedSubjectCode,
  currentDate,
  planningDate
}) {
  const [filterMode, setFilterMode] = useState('subject'); // 'subject' or 'all'
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate start date as tomorrow (or current date if current date is start of semester)
  const tomorrowDateStr = useMemo(() => {
    if (!currentDate) return '2026-08-30';
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [currentDate]);

  // Fetch upcoming classes using STP4 getUpcomingClasses
  const rawUpcoming = useMemo(() => {
    if (!sectionName || !tomorrowDateStr || !planningDate || tomorrowDateStr > planningDate) {
      return [];
    }
    try {
      const subjectFilter = filterMode === 'subject' ? selectedSubjectCode : null;
      return getUpcomingClasses(sectionName, tomorrowDateStr, planningDate, subjectFilter);
    } catch {
      return [];
    }
  }, [sectionName, tomorrowDateStr, planningDate, filterMode, selectedSubjectCode]);

  // Filter with search if typed
  const filteredUpcoming = useMemo(() => {
    if (!searchQuery.trim()) return rawUpcoming;
    const q = searchQuery.toLowerCase();
    return rawUpcoming.filter(
      item =>
        item.subjectCode.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.day.toLowerCase().includes(q) ||
        item.date.includes(q)
    );
  }, [rawUpcoming, searchQuery]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-tactile overflow-hidden">
      {/* Header with Filters */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Scheduled Upcoming Classes Timeline
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
            {filteredUpcoming.length} Occurrences
          </span>
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex p-0.5 rounded-lg bg-slate-850 border border-slate-750 text-xs font-mono">
            <button
              onClick={() => setFilterMode('subject')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                filterMode === 'subject'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              This Subject
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Section Classes
            </button>
          </div>
        </div>
      </div>

      {/* Date Window Indicator */}
      <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <div>
          <span>SCHEDULE WINDOW: </span>
          <span className="text-slate-200 font-semibold">{tomorrowDateStr}</span>
          <span className="text-slate-500"> (tomorrow) → </span>
          <span className="text-cyan-300 font-semibold">{planningDate}</span>
        </div>
        <div className="text-slate-500">
          Excludes lunch (12:30–13:20) & tea breaks
        </div>
      </div>

      {/* Classes Table / List */}
      <div className="max-h-[380px] overflow-y-auto">
        {filteredUpcoming.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            No scheduled classes found between {tomorrowDateStr} and {planningDate}.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Date & Day</th>
                <th className="py-2.5 px-3">Period & Time</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Slot</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-4 text-right">Venue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono">
              {filteredUpcoming.map((item, idx) => {
                const isSelectedSub = item.subjectCode === selectedSubjectCode;
                const isLab = item.classType === 'lab';

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-850/50 transition-colors ${
                      isSelectedSub ? 'bg-cyan-950/15' : ''
                    }`}
                  >
                    {/* Date & Day */}
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-200">{item.date}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{item.day}</div>
                    </td>

                    {/* Period & Time */}
                    <td className="py-2.5 px-3">
                      <div className="inline-flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                          P{item.period}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {item.startTime} – {item.endTime}
                        </span>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
                        <span>{item.subjectCode}</span>
                        {isSelectedSub && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px] font-sans">
                        {item.subjectName}
                      </div>
                    </td>

                    {/* Slot */}
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px]">
                        {item.subjectSlot}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td className="py-2.5 px-3">
                      {isLab ? (
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-950/70 border border-purple-500/30 text-purple-300">
                          <Beaker className="w-3 h-3" />
                          <span>LAB</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          <BookOpen className="w-3 h-3" />
                          <span>THEORY</span>
                        </span>
                      )}
                    </td>

                    {/* Venue */}
                    <td className="py-2.5 px-4 text-right text-slate-400 text-[11px]">
                      <span className="inline-flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{item.venue}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
