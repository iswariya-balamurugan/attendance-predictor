/**
 * Timetable Data Service
 * Provides access to structured timetable data and supports date-range class occurrence queries.
 */

const timetableData = require('../data/timetableData.json');
const excludedData = require('../data/excludedSections.json');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns semester metadata (dates, academic year, term)
 */
function getSemesterInfo() {
  return timetableData.semester;
}

/**
 * Returns the standard period schedule
 */
function getPeriodSchedule() {
  return timetableData.periodSchedule;
}

/**
 * Returns all valid 2026-27 sections
 */
function getAllSections() {
  return timetableData.sections.map(s => ({
    sectionName: s.sectionName,
    academicYear: s.academicYear,
    semester: s.semester,
    shift: s.shift,
    venue: s.venue,
    subjectCount: s.subjects.length,
    weeklyClassCount: s.timetable.length
  }));
}

/**
 * Gets a specific section by name
 */
function getSectionByName(sectionName) {
  const normalized = sectionName.trim().toLowerCase();
  const section = timetableData.sections.find(
    s => s.sectionName.toLowerCase() === normalized ||
         s.sectionName.toLowerCase().replace(/[\s\-_]/g, '') === normalized.replace(/[\s\-_]/g, '')
  );
  return section || null;
}

/**
 * Gets all subjects for a section
 */
function getSubjectsForSection(sectionName) {
  const section = getSectionByName(sectionName);
  if (!section) {
    throw new Error(`Section "${sectionName}" not found.`);
  }
  return section.subjects;
}

/**
 * Gets the complete weekly timetable for a section
 */
function getTimetableForSection(sectionName) {
  const section = getSectionByName(sectionName);
  if (!section) {
    throw new Error(`Section "${sectionName}" not found.`);
  }
  return section.timetable;
}

/**
 * Gets timetable entries for a specific weekday
 */
function getTimetableForDay(sectionName, day) {
  const timetable = getTimetableForSection(sectionName);
  const normalizedDay = day.trim().toLowerCase();
  return timetable.filter(entry => entry.day.toLowerCase() === normalizedDay);
}

/**
 * Calculates weekly period counts per subject for a section
 */
function getWeeklySubjectCounts(sectionName) {
  const timetable = getTimetableForSection(sectionName);
  const subjects = getSubjectsForSection(sectionName);

  const counts = {};
  for (const sub of subjects) {
    counts[sub.subjectCode] = {
      subjectCode: sub.subjectCode,
      subjectName: sub.subjectName,
      slot: sub.subjectSlot,
      classType: sub.classType,
      weeklyPeriods: 0
    };
  }

  for (const entry of timetable) {
    if (counts[entry.subjectCode]) {
      counts[entry.subjectCode].weeklyPeriods++;
    } else {
      counts[entry.subjectCode] = {
        subjectCode: entry.subjectCode,
        subjectName: entry.subjectName,
        slot: entry.slot,
        classType: entry.classType,
        weeklyPeriods: 1
      };
    }
  }

  return Object.values(counts);
}

/**
 * Resolves all scheduled class occurrences for a subject between date A and date B
 *
 * @param {string} sectionName - Section name (e.g. "II - BME")
 * @param {string} startDateStr - ISO date string (YYYY-MM-DD)
 * @param {string} endDateStr - ISO date string (YYYY-MM-DD)
 * @param {string|null} [subjectCodeFilter=null] - Optional subjectCode to filter by
 * @returns {Object} { totalOccurrences, occurrences: [...], summaryBySubject: {...} }
 */
function getClassOccurrencesBetweenDates(sectionName, startDateStr, endDateStr, subjectCodeFilter = null) {
  const section = getSectionByName(sectionName);
  if (!section) {
    throw new Error(`Section "${sectionName}" not found.`);
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error(`Invalid date format. Expected YYYY-MM-DD.`);
  }

  if (start > end) {
    throw new Error(`Start date (${startDateStr}) must be on or before end date (${endDateStr}).`);
  }

  // Pre-index section timetable by weekday for rapid lookup
  const timetableByDay = {
    'Monday': [],
    'Tuesday': [],
    'Wednesday': [],
    'Thursday': [],
    'Friday': []
  };

  for (const entry of section.timetable) {
    if (timetableByDay[entry.day]) {
      if (!subjectCodeFilter || entry.subjectCode === subjectCodeFilter) {
        timetableByDay[entry.day].push(entry);
      }
    }
  }

  const occurrences = [];
  const summaryBySubject = {};

  const current = new Date(start);
  while (current <= end) {
    const dayName = DAY_NAMES[current.getDay()];
    const dateFormatted = current.toISOString().slice(0, 10);

    const dayClasses = timetableByDay[dayName] || [];
    for (const cls of dayClasses) {
      const occurrence = {
        date: dateFormatted,
        day: dayName,
        section: section.sectionName,
        period: cls.period,
        startTime: cls.startTime,
        endTime: cls.endTime,
        slot: cls.slot,
        subjectCode: cls.subjectCode,
        subjectName: cls.subjectName,
        classType: cls.classType
      };

      occurrences.push(occurrence);
      summaryBySubject[cls.subjectCode] = (summaryBySubject[cls.subjectCode] || 0) + 1;
    }

    current.setDate(current.getDate() + 1);
  }

  return {
    section: section.sectionName,
    startDate: startDateStr,
    endDate: endDateStr,
    totalOccurrences: occurrences.length,
    summaryBySubject,
    occurrences
  };
}

/**
 * Returns list of excluded 2024-25 sections
 */
function getExcludedSections() {
  return excludedData.excludedSections;
}

module.exports = {
  getSemesterInfo,
  getPeriodSchedule,
  getAllSections,
  getSectionByName,
  getSubjectsForSection,
  getTimetableForSection,
  getTimetableForDay,
  getWeeklySubjectCounts,
  getClassOccurrencesBetweenDates,
  getExcludedSections
};
