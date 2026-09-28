import timetableData from '../data/timetableData.json';
import excludedData from '../data/excludedSections.json';

export const SEMESTER_START = timetableData.semester.startDate || '2026-08-29';
export const SEMESTER_END = timetableData.semester.endDate || '2026-11-29';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns semester metadata (dates, academic year, term)
 */
export function getSemesterInfo() {
  return timetableData.semester;
}

/**
 * Returns the standard period schedule
 */
export function getPeriodSchedule() {
  return timetableData.periodSchedule;
}

/**
 * Returns all valid 2026-27 sections
 */
export function getAllSections() {
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
export function getSectionByName(sectionName) {
  if (!sectionName) return null;
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
export function getSubjectsForSection(sectionName) {
  const section = getSectionByName(sectionName);
  if (!section) {
    throw new Error(`Section "${sectionName}" not found.`);
  }
  return section.subjects;
}

/**
 * Gets the complete weekly timetable for a section
 */
export function getTimetableForSection(sectionName) {
  const section = getSectionByName(sectionName);
  if (!section) {
    throw new Error(`Section "${sectionName}" not found.`);
  }
  return section.timetable;
}

/**
 * Gets timetable entries for a specific weekday
 */
export function getTimetableForDay(sectionName, day) {
  const timetable = getTimetableForSection(sectionName);
  const normalizedDay = day.trim().toLowerCase();
  return timetable.filter(entry => entry.day.toLowerCase() === normalizedDay);
}

/**
 * Returns list of excluded 2024-25 sections
 */
export function getExcludedSections() {
  return excludedData.excludedSections;
}

/**
 * Resolves all scheduled class occurrences for a subject between date A and date B
 */
export function getClassOccurrencesBetweenDates(sectionName, startDateStr, endDateStr, subjectCodeFilter = null) {
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
        classType: cls.classType,
        venue: section.venue
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
 * Validates attendance percentage input (0 to 100)
 */
export function validateAttendancePercentage(percentage) {
  if (typeof percentage !== 'number' || isNaN(percentage)) {
    throw new Error(`Invalid attendance percentage: "${percentage}". Expected a number between 0 and 100.`);
  }
  if (percentage < 0 || percentage > 100) {
    throw new Error(`Attendance percentage must be between 0 and 100. Received: ${percentage}`);
  }
}

/**
 * Validates planning date against semester boundaries
 */
export function validatePlanningDate(planningDate, currentDate = null) {
  if (!planningDate || typeof planningDate !== 'string') {
    throw new Error(`Invalid planning date: "${planningDate}". Expected a string in YYYY-MM-DD format.`);
  }

  const pDate = new Date(planningDate);
  if (isNaN(pDate.getTime())) {
    throw new Error(`Invalid planning date format: "${planningDate}". Expected YYYY-MM-DD.`);
  }

  if (planningDate < SEMESTER_START) {
    throw new Error(`Planning date (${planningDate}) cannot be before semester start date (${SEMEESTER_START}).`);
  }

  if (planningDate > SEMESTER_END) {
    throw new Error(`Planning date (${planningDate}) cannot be after semester end date (${SEMESTER_END}).`);
  }

  if (currentDate && planningDate < currentDate) {
    throw new Error(`Planning date (${planningDate}) cannot be before current date (${currentDate}).`);
  }

  return true;
}

/**
 * Validates and resolves subject in section
 */
export function resolveSubject(sectionName, subjectIdentifier) {
  const subjects = getSubjectsForSection(sectionName);
  const normalized = (subjectIdentifier || '').trim().toLowerCase();
  
  const found = subjects.find(
    s => s.subjectCode.toLowerCase() === normalized ||
         s.subjectName.toLowerCase() === normalized
  );

  if (!found) {
    throw new Error(`Subject "${subjectIdentifier}" not found in section "${sectionName}".`);
  }

  return found;
}

/**
 * Estimates attended classes from conducted classes and percentage.
 * Centralized formula: A = Math.round(T * P / 100), bounded by [0, T].
 */
export function estimateAttendedClasses(classesConducted, attendancePercentage) {
  validateAttendancePercentage(attendancePercentage);
  if (classesConducted <= 0) return 0;
  const attended = Math.round((classesConducted * attendancePercentage) / 100);
  return Math.min(classesConducted, Math.max(0, attended));
}

function getNextDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Calculates scheduled classes conducted up to currentDate (inclusive)
 */
export function getClassesConducted(sectionName, subjectCode, currentDate) {
  if (currentDate < SEMESTER_START) {
    return 0;
  }
  const effectiveEnd = currentDate > SEMESTER_END ? SEMESTER_END : currentDate;
  const result = getClassOccurrencesBetweenDates(
    sectionName,
    SEMESTER_START,
    effectiveEnd,
    subjectCode
  );
  return result.totalOccurrences;
}

/**
 * Calculates scheduled classes remaining after currentDate (from tomorrow to semester end)
 */
export function getClassesRemaining(sectionName, subjectCode, currentDate) {
  if (currentDate >= SEMESTER_END) {
    return 0;
  }
  
  let effectiveStart;
  if (currentDate < SEMESTER_START) {
    effectiveStart = SEMESTER_START;
  } else {
    effectiveStart = getNextDay(currentDate);
  }

  if (effectiveStart > SEMESTER_END) {
    return 0;
  }

  const result = getClassOccurrencesBetweenDates(
    sectionName,
    effectiveStart,
    SEMESTER_END,
    subjectCode
  );
  return result.totalOccurrences;
}

/**
 * Calculates maximum possible attendance percentage if student attends all remaining classes
 */
export function calculateMaximumPossibleAttendance(attendedClasses, classesConducted, classesRemaining) {
  const totalClasses = classesConducted + classesRemaining;
  if (totalClasses === 0) {
    return 100.0;
  }
  const maxAttended = attendedClasses + classesRemaining;
  const percentage = (maxAttended / totalClasses) * 100;
  return Number(percentage.toFixed(2));
}

/**
 * Calculates minimum remaining classes required to reach a target percentage (e.g. 75 or 90)
 */
export function calculateRequiredClasses(attendedClasses, classesConducted, classesRemaining, currentAttendance, targetPercentage) {
  if (currentAttendance >= targetPercentage) {
    return {
      required: 0,
      achievable: true
    };
  }

  const totalClasses = classesConducted + classesRemaining;
  if (totalClasses === 0) {
    return {
      required: 0,
      achievable: true
    };
  }

  const targetNeeded = (targetPercentage * totalClasses) / 100;
  const rawDiff = targetNeeded - attendedClasses;
  const x = Math.max(0, Math.ceil(rawDiff - 1e-9));

  if (x > classesRemaining) {
    return {
      required: x,
      achievable: false
    };
  }

  return {
    required: x,
    achievable: true
  };
}

/**
 * Determines attendance status based on current attendance and maximum possible attendance
 */
export function determineAttendanceStatus(currentAttendance, maxPossibleAttendance) {
  if (currentAttendance >= 90) {
    return '90% ACHIEVED';
  } else if (currentAttendance >= 75) {
    return 'SAFE';
  } else if (maxPossibleAttendance >= 75) {
    return 'DETENTION RISK';
  } else {
    return 'IRREVERSIBLE DETENTION';
  }
}

/**
 * Returns scheduled upcoming classes between startDate and endDate (inclusive)
 */
export function getUpcomingClasses(sectionName, startDate, endDate, subjectCodeFilter = null) {
  const result = getClassOccurrencesBetweenDates(
    sectionName,
    startDate,
    endDate,
    subjectCodeFilter
  );

  return result.occurrences.map(item => ({
    date: item.date,
    day: item.day,
    period: item.period,
    startTime: item.startTime,
    endTime: item.endTime,
    subject: item.subjectName,
    subjectName: item.subjectName,
    subjectCode: item.subjectCode,
    classType: item.classType,
    slot: item.slot,
    section: item.section,
    venue: item.venue
  }));
}

/**
 * Core STP4 Planning Calculation:
 * "If I plan until planningDate, how many upcoming classes can I miss while keeping attendance >= 75%?"
 */
export function calculateFutureAttendancePlan(arg1, arg2, arg3, arg4, arg5) {
  let sectionName, subjectIdentifier, currentAttendance, planningDate, currentDate;

  if (typeof arg1 === 'object' && arg1 !== null) {
    sectionName = arg1.sectionName || arg1.section;
    subjectIdentifier = arg1.subjectIdentifier || arg1.subject || arg1.subjectCode;
    currentAttendance = arg1.currentAttendance;
    planningDate = arg1.planningDate;
    currentDate = arg1.currentDate || '2026-09-28';
  } else {
    sectionName = arg1;
    subjectIdentifier = arg2;
    currentAttendance = arg3;
    planningDate = arg4;
    currentDate = arg5 || '2026-09-28';
  }

  validateAttendancePercentage(currentAttendance);
  validatePlanningDate(planningDate, currentDate);

  const subject = resolveSubject(sectionName, subjectIdentifier);
  const subjectCode = subject.subjectCode;

  const classesConducted = getClassesConducted(sectionName, subjectCode, currentDate);
  const estimatedAttended = estimateAttendedClasses(classesConducted, currentAttendance);

  let upcomingClasses = [];
  let upcomingStart;

  if (currentDate < SEMESTER_START) {
    upcomingStart = SEMESTER_START;
  } else {
    upcomingStart = getNextDay(currentDate);
  }

  if (upcomingStart <= planningDate) {
    upcomingClasses = getUpcomingClasses(sectionName, upcomingStart, planningDate, subjectCode);
  }

  const totalUpcomingClasses = upcomingClasses.length;
  const totalClasses = classesConducted + totalUpcomingClasses;

  const maxPossible = totalClasses > 0
    ? Number((((estimatedAttended + totalUpcomingClasses) / totalClasses) * 100).toFixed(2))
    : 100.0;

  const targetPercentage = 75;
  const targetThreshold = (targetPercentage * totalClasses) / 100;

  let canReach75 = false;
  let canMiss = 0;
  let mustAttend = 0;
  let projectedAttendance = 0;

  if (totalClasses === 0) {
    canReach75 = true;
    canMiss = 0;
    mustAttend = 0;
    projectedAttendance = 100.0;
  } else if (maxPossible < 75.0) {
    canReach75 = false;
    canMiss = 0;
    mustAttend = totalUpcomingClasses;
    projectedAttendance = maxPossible;
  } else {
    canReach75 = true;
    const maxMissFloat = (estimatedAttended + totalUpcomingClasses) - targetThreshold;
    const m = Math.floor(maxMissFloat + 1e-9);
    
    canMiss = Math.max(0, Math.min(totalUpcomingClasses, m));
    mustAttend = totalUpcomingClasses - canMiss;

    const finalAttended = estimatedAttended + mustAttend;
    projectedAttendance = Number(((finalAttended / totalClasses) * 100).toFixed(2));
  }

  const status = determineAttendanceStatus(currentAttendance, maxPossible);

  const projectedIfAllAttended = maxPossible;
  const projectedIfMaxMissed = totalClasses > 0
    ? Number((((estimatedAttended + (totalUpcomingClasses - canMiss)) / totalClasses) * 100).toFixed(2))
    : 100.0;

  return {
    section: sectionName,
    subjectCode: subject.subjectCode,
    subjectName: subject.subjectName,
    faculty: subject.faculty,
    credits: subject.credits,
    classType: subject.classType,
    currentDate,
    planningDate,
    currentAttendance: Number(currentAttendance.toFixed(2)),
    classesConducted,
    estimatedAttendedClasses: estimatedAttended,
    totalUpcomingClasses,
    totalClassesInScope: totalClasses,
    upcomingClassCount: totalUpcomingClasses,
    upcomingClassDates: Array.from(new Set(upcomingClasses.map(c => c.date))),
    upcomingClasses,
    canReach75,
    mustAttend,
    canMiss,
    projectedAttendance,
    projectedAttendanceIfAllAttended: projectedIfAllAttended,
    projectedAttendanceIfMaxMissed: projectedIfMaxMissed,
    targetPercentage: 75,
    status
  };
}

/**
 * Enhanced Semester-End Forecast
 */
export function getSemesterEndForecast(sectionName, subjectIdentifier, currentAttendance, currentDate = '2026-09-28') {
  validateAttendancePercentage(currentAttendance);
  const subject = resolveSubject(sectionName, subjectIdentifier);
  const subjectCode = subject.subjectCode;

  const classesConducted = getClassesConducted(sectionName, subjectCode, currentDate);
  const classesRemaining = getClassesRemaining(sectionName, subjectCode, currentDate);
  const totalClasses = classesConducted + classesRemaining;
  const attendedClasses = estimateAttendedClasses(classesConducted, currentAttendance);

  const maxPossible = calculateMaximumPossibleAttendance(attendedClasses, classesConducted, classesRemaining);

  const req75 = calculateRequiredClasses(attendedClasses, classesConducted, classesRemaining, currentAttendance, 75);
  const req90 = calculateRequiredClasses(attendedClasses, classesConducted, classesRemaining, currentAttendance, 90);

  const status = determineAttendanceStatus(currentAttendance, maxPossible);

  let maxMissableFor75 = 0;
  if (req75.achievable && totalClasses > 0) {
    const targetThreshold = (75 * totalClasses) / 100;
    const maxMissFloat = (attendedClasses + classesRemaining) - targetThreshold;
    maxMissableFor75 = Math.max(0, Math.min(classesRemaining, Math.floor(maxMissFloat + 1e-9)));
  }

  return {
    section: sectionName,
    subjectCode: subject.subjectCode,
    subjectName: subject.subjectName,
    faculty: subject.faculty,
    credits: subject.credits,
    classType: subject.classType,
    currentDate,
    semesterEndDate: SEMESTER_END,
    currentAttendance: Number(currentAttendance.toFixed(2)),
    classesConducted,
    estimatedAttendedClasses: attendedClasses,
    classesRemaining,
    totalClasses,
    maximumPossibleAttendance: maxPossible,
    requiredFor75: req75.achievable ? req75.required : 0,
    requiredFor90: req90.achievable ? req90.required : 0,
    canReach75: req75.achievable,
    canReach90: req90.achievable,
    maxMissableFor75,
    maximumClassesCanBeMissedFor75: maxMissableFor75,
    status,
    finalStatus: status
  };
}

export default {
  SEMESTER_START,
  SEMESTER_END,
  getAllSections,
  getSectionByName,
  getSubjectsForSection,
  getSemesterInfo,
  getPeriodSchedule,
  getExcludedSections,
  getTimetableForSection,
  getTimetableForDay,
  getClassOccurrencesBetweenDates,
  validateAttendancePercentage,
  validatePlanningDate,
  resolveSubject,
  estimateAttendedClasses,
  getClassesConducted,
  getClassesRemaining,
  calculateMaximumPossibleAttendance,
  calculateRequiredClasses,
  determineAttendanceStatus,
  getUpcomingClasses,
  calculateFutureAttendancePlan,
  getSemesterEndForecast
};
