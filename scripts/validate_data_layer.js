/**
 * Comprehensive Validation Suite for STP2 Timetable Data Layer
 */

const timetableService = require('../src/services/timetableService');
const timetableData = require('../src/data/timetableData.json');
const excludedData = require('../src/data/excludedSections.json');

const EXPECTED_SECTIONS = [
  'II - BME',
  'II - ECE - DS A',
  'II - ECE - DS B',
  'III - BME',
  'III ECE-A',
  'III ECE-B',
  'III ECE-DS',
  'IV ECE-A',
  'IV ECE-B'
];

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const VALID_PERIODS = {
  1: { start: '09:00', end: '09:50' },
  2: { start: '09:50', end: '10:40' },
  3: { start: '10:50', end: '11:40' },
  4: { start: '11:40', end: '12:30' },
  6: { start: '13:20', end: '14:10' },
  7: { start: '14:10', end: '15:00' },
  8: { start: '15:10', end: '16:00' },
  9: { start: '16:00', end: '16:50' }
};

let passedChecks = 0;
let failedChecks = 0;
const errors = [];

function assert(condition, message) {
  if (condition) {
    passedChecks++;
    console.log(`  ✓ ${message}`);
  } else {
    failedChecks++;
    errors.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('===============================================================');
console.log(' STP2: STRUCTURED TIMETABLE DATA LAYER VALIDATION');
console.log('===============================================================\n');

// 1. Verify All 9 Sections Exist
console.log('1. Validating Section Count and Section Names:');
assert(timetableData.sections.length === 9, `Expected exactly 9 valid sections, found ${timetableData.sections.length}`);
const loadedNames = timetableData.sections.map(s => s.sectionName);
for (const expected of EXPECTED_SECTIONS) {
  assert(loadedNames.includes(expected), `Section "${expected}" is present in the dataset`);
}

// 2. Verify No 2024-25 Sections are Loaded
console.log('\n2. Verifying Exclusion of 2024-25 Archive Sections:');
for (const sec of timetableData.sections) {
  assert(sec.academicYear === '2026-2027', `Section "${sec.sectionName}" academic year is 2026-2027 (actual: ${sec.academicYear})`);
  assert(!sec.sectionName.includes('2024-25'), `Section "${sec.sectionName}" is not labeled 2024-25`);
  assert(!sec.sectionName.startsWith('I '), `Section "${sec.sectionName}" is not from Year 1 archive`);
}
assert(excludedData.excludedSections.length === 4, `Excluded sections registry tracks exactly 4 archive sections`);
for (const excluded of excludedData.excludedSections) {
  assert(!loadedNames.includes(excluded.sectionName), `Archive section "${excluded.sectionName}" is NOT present in active store`);
}

// 3. Verify Subjects and Timetable Mappings for Each Section
console.log('\n3. Validating Subjects, Credits, and Timetable Consistency:');
let totalSubjects = 0;
let totalTimetableEntries = 0;

for (const section of timetableData.sections) {
  console.log(`\n  Checking Section: ${section.sectionName} (${section.shift} shift, ${section.venue})`);
  assert(section.subjects.length > 0, `Section ${section.sectionName} has ${section.subjects.length} subjects`);
  assert(section.timetable.length > 0, `Section ${section.sectionName} has ${section.timetable.length} scheduled periods`);

  totalSubjects += section.subjects.length;
  totalTimetableEntries += section.timetable.length;

  const subjectCodeSet = new Set(section.subjects.map(s => s.subjectCode));

  // Check that every subject in subjects array has required fields
  for (const sub of section.subjects) {
    assert(sub.subjectCode && sub.subjectName && sub.faculty && sub.department,
      `Subject ${sub.subjectCode} (${sub.subjectName}) has complete metadata`);
    assert(['theory', 'lab', 'project', 'other'].includes(sub.classType),
      `Subject ${sub.subjectCode} has valid classType: "${sub.classType}"`);
  }

  // Check period mapping and integrity
  const periodOccupancy = {};
  for (const entry of section.timetable) {
    const key = `${entry.day}_P${entry.period}`;
    assert(!periodOccupancy[key], `No collision on ${section.sectionName} ${key} (already assigned to ${periodOccupancy[key]})`);
    periodOccupancy[key] = entry.subjectCode;

    assert(VALID_DAYS.includes(entry.day), `Valid weekday: ${entry.day}`);
    assert(VALID_PERIODS[entry.period] !== undefined, `Period ${entry.period} is a valid class period (not lunch or tea)`);
    assert(entry.period !== 5, `Period 5 (Lunch) is NOT in scheduled classes`);
    assert(entry.startTime === VALID_PERIODS[entry.period].start, `Period ${entry.period} start time is ${VALID_PERIODS[entry.period].start}`);
    assert(entry.endTime === VALID_PERIODS[entry.period].end, `Period ${entry.period} end time is ${VALID_PERIODS[entry.period].end}`);

    assert(subjectCodeSet.has(entry.subjectCode),
      `Timetable entry ${entry.subjectCode} (${entry.day} P${entry.period}) references a declared subject`);
  }

  // Check that labs are scheduled
  const labs = section.subjects.filter(s => s.classType === 'lab');
  assert(labs.length > 0, `Section ${section.sectionName} has scheduled lab subject(s) (${labs.map(l => l.subjectCode).join(', ')})`);
  for (const lab of labs) {
    const labEntries = section.timetable.filter(e => e.subjectCode === lab.subjectCode);
    assert(labEntries.length > 0, `Lab ${lab.subjectCode} has ${labEntries.length} active periods in timetable`);
  }
}

// 4. Test Date-Range Query Engine ("How many classes of subject X between date A and date B?")
console.log('\n4. Validating Date-Range Query Service:');

const testStartDate = '2026-08-29'; // Saturday
const testEndDate = '2026-11-29';   // Sunday

// Test query for entire challenge semester on II - BME
const bmeAQuery = timetableService.getClassOccurrencesBetweenDates('II - BME', testStartDate, testEndDate, '21MAB201T');
console.log(`  Query: "21MAB201T" in "II - BME" from ${testStartDate} to ${testEndDate}`);
console.log(`  -> Total Occurrences: ${bmeAQuery.totalOccurrences}`);
assert(bmeAQuery.totalOccurrences > 0, `Generated class occurrences for 21MAB201T across challenge semester`);

// Slot A in II BME occurs: Tue P4 (1), Wed P3-4 (2), Thu P1 (1), Fri P2 (1) = 5 periods/week.
// Total weeks in 29 Aug to 29 Nov 2026:
// 29 Aug 2026 is Sat. 31 Aug is Monday.
// Let's verify number of Mondays, Tuesdays, Wednesdays, Thursdays, Fridays between 29 Aug and 29 Nov:
let tuesdays = 0, wednesdays = 0, thursdays = 0, fridays = 0;
let cur = new Date('2026-08-29');
const end = new Date('2026-11-29');
while (cur <= end) {
  const d = cur.getDay();
  if (d === 2) tuesdays++;
  if (d === 3) wednesdays++;
  if (d === 4) thursdays++;
  if (d === 5) fridays++;
  cur.setDate(cur.getDate() + 1);
}
// Expected: tuesdays * 1 + wednesdays * 2 + thursdays * 1 + fridays * 1
const expectedBmeA = tuesdays * 1 + wednesdays * 2 + thursdays * 1 + fridays * 1;
assert(bmeAQuery.totalOccurrences === expectedBmeA,
  `Exact occurrence count match: calculated ${bmeAQuery.totalOccurrences}, expected ${expectedBmeA} (13 Tue, 13 Wed [x2], 13 Thu, 13 Fri)`);

// Test one-week query
const oneWeekQuery = timetableService.getClassOccurrencesBetweenDates('II - BME', '2026-09-07', '2026-09-11', '21MAB201T');
assert(oneWeekQuery.totalOccurrences === 5,
  `One week (Mon 7 Sep - Fri 11 Sep) has exactly 5 periods of 21MAB201T (Tue 1, Wed 2, Thu 1, Fri 1)`);

// 5. Final Validation Summary
console.log('\n===============================================================');
console.log(' VALIDATION SUMMARY');
console.log('===============================================================');
console.log(`Total Valid Sections:       ${timetableData.sections.length}`);
console.log(`Total Unique Subjects:      ${totalSubjects}`);
console.log(`Total Weekly Class Periods: ${totalTimetableEntries}`);
console.log(`Sections Converted:         ${timetableData.sections.map(s => s.sectionName).join(', ')}`);
console.log(`Excluded 2024-25 Sections:  ${excludedData.excludedSections.map(s => s.sectionName).join(', ')}`);
console.log(`Passed Assertions:          ${passedChecks}`);
console.log(`Failed Assertions:          ${failedChecks}`);

if (failedChecks === 0) {
  console.log('\n✓ ALL VALIDATION CHECKS PASSED SUCCESSFULLY. STP2 COMPLETE.');
} else {
  console.error(`\n✗ ${failedChecks} VALIDATION CHECKS FAILED:`);
  errors.forEach((e, idx) => console.error(`  ${idx + 1}. ${e}`));
  process.exit(1);
}
