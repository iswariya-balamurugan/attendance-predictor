/**
 * Automated Test Suite for STP3 Attendance Calculation Engine
 * Tests all 13 required edge cases, mathematical formulas, and multi-section forecasts.
 */

const attendanceEngine = require('../src/services/attendanceEngine');
const timetableService = require('../src/services/timetableService');

let passedTests = 0;
let failedTests = 0;
const testErrors = [];

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    testErrors.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function assertThrows(fn, expectedSubstr, message) {
  try {
    fn();
    failedTests++;
    testErrors.push(`Expected exception containing "${expectedSubstr}", but no exception was thrown: ${message}`);
    console.error(`  ✗ FAIL (No throw): ${message}`);
  } catch (err) {
    if (err.message.includes(expectedSubstr)) {
      passedTests++;
      console.log(`  ✓ Correctly threw: "${err.message}" - ${message}`);
    } else {
      failedTests++;
      testErrors.push(`Expected exception containing "${expectedSubstr}", but got "${err.message}": ${message}`);
      console.error(`  ✗ FAIL (Wrong error): ${message}`);
    }
  }
}

console.log('===============================================================');
console.log(' STP3: ATTENDANCE CALCULATION ENGINE TEST SUITE');
console.log('===============================================================\n');

const SECTION = 'II - BME';
const SUBJECT = '21MAB201T'; // 5 classes/week (Tue P4, Wed P3-P4, Thu P1, Fri P2)

// Mid-semester reference date: 2026-10-15 (Thursday)
const MID_DATE = '2026-10-15';

// -------------------------------------------------------------
// 1. Core Conducted & Remaining Calculation Integrity
// -------------------------------------------------------------
console.log('1. Testing Conducted & Remaining Class Counts:');
const conducted = attendanceEngine.getClassesConducted(SECTION, SUBJECT, MID_DATE);
const remaining = attendanceEngine.getClassesRemaining(SECTION, SUBJECT, MID_DATE);
const totalSemester = attendanceEngine.getClassesConducted(SECTION, SUBJECT, '2026-11-29');

console.log(`  Mid-date: ${MID_DATE} -> Conducted: ${conducted}, Remaining: ${remaining}, Total: ${conducted + remaining}`);
assert(conducted > 0, `Conducted classes on ${MID_DATE} (${conducted}) is greater than 0`);
assert(remaining > 0, `Remaining classes after ${MID_DATE} (${remaining}) is greater than 0`);
assert(conducted + remaining === totalSemester, `Sum of conducted (${conducted}) + remaining (${remaining}) matches total semester (${totalSemester})`);
assert(totalSemester === 65, `Total semester classes for 21MAB201T in II - BME is exactly 65`);

// -------------------------------------------------------------
// 2. Testing 13 Required Edge Cases
// -------------------------------------------------------------
console.log('\n2. Testing Required Edge Cases (Step 10):');

// Edge Case 1: Current Attendance = 100%
console.log('\n  [Edge Case 1]: Current Attendance = 100%');
const ec1 = attendanceEngine.getSemesterEndForecast(SECTION, SUBJECT, 100, MID_DATE);
assert(ec1.status === '90% ACHIEVED', `Status is "90% ACHIEVED" (got: "${ec1.status}")`);
assert(ec1.requiredFor75 === 0, `Required for 75% is 0`);
assert(ec1.canReach75 === true, `Can reach 75% is true`);
assert(ec1.requiredFor90 === 0, `Required for 90% is 0`);
assert(ec1.canReach90 === true, `Can reach 90% is true`);
assert(ec1.maximumPossibleAttendance === 100.0, `Maximum possible attendance is 100.0%`);

// Edge Case 2: Current Attendance = 90%
console.log('\n  [Edge Case 2]: Current Attendance = 90%');
const ec2 = attendanceEngine.getSemesterEndForecast(SECTION, SUBJECT, 90, MID_DATE);
assert(ec2.status === '90% ACHIEVED', `Status is "90% ACHIEVED" (got: "${ec2.status}")`);
assert(ec2.requiredFor75 === 0, `Required for 75% is 0`);
assert(ec2.requiredFor90 === 0, `Required for 90% is 0`);
assert(ec2.canReach75 === true, `Can reach 75% is true`);
assert(ec2.canReach90 === true, `Can reach 90% is true`);

// Edge Case 3: Current Attendance = 75%
console.log('\n  [Edge Case 3]: Current Attendance = 75%');
const ec3 = attendanceEngine.getSemesterEndForecast(SECTION, SUBJECT, 75, MID_DATE);
assert(ec3.status === 'SAFE', `Status is "SAFE" (got: "${ec3.status}")`);
assert(ec3.requiredFor75 === 0, `Required for 75% is 0 (already safe)`);
assert(ec3.canReach75 === true, `Can reach 75% is true`);
assert(typeof ec3.requiredFor90 === 'number' || ec3.requiredFor90 === null, `Required for 90% computed cleanly`);

// Edge Case 4: Current Attendance = 74%
console.log('\n  [Edge Case 4]: Current Attendance = 74%');
const ec4 = attendanceEngine.getSemesterEndForecast(SECTION, SUBJECT, 74, MID_DATE);
assert(ec4.status === 'DETENTION RISK', `Status is "DETENTION RISK" (got: "${ec4.status}")`);
assert(ec4.canReach75 === true, `Can reach 75% is true`);
assert(ec4.requiredFor75 > 0, `Required for 75% is strictly positive (${ec4.requiredFor75})`);
assert(ec4.requiredFor75 <= ec4.classesRemaining, `Required for 75% (${ec4.requiredFor75}) <= remaining classes (${ec4.classesRemaining})`);

// Edge Case 5: Attendance below 75% but recoverable
console.log('\n  [Edge Case 5]: Attendance below 75% but recoverable (e.g. 60%)');
const ec5 = attendanceEngine.getSemesterEndForecast(SECTION, SUBJECT, 60, MID_DATE);
assert(ec5.status === 'DETENTION RISK', `Status is "DETENTION RISK" (got: "${ec5.status}")`);
assert(ec5.canReach75 === true, `Can reach 75% is true`);
assert(ec5.maximumPossibleAttendance >= 75.0, `Max possible (${ec5.maximumPossibleAttendance}%) is >= 75%`);
assert(ec5.requiredFor75 > 0, `Required for 75% is ${ec5.requiredFor75}`);
// Mathematical proof that requiredFor75 is exact minimal integer:
const attended5 = ec5.estimatedAttendedClasses;
const req5 = ec5.requiredFor75;
const total5 = ec5.totalClasses;
assert(((attended5 + req5) / total5) * 100 >= 75, `Attending ${req5} classes achieves ${(((attended5 + req5) / total5) * 100).toFixed(2)}% (>= 75%)`);
assert(((attended5 + req5 - 1) / total5) * 100 < 75, `Attending 1 fewer class (${req5 - 1}) yields ${(((attended5 + req5 - 1) / total5) * 100).toFixed(2)}% (< 75%)`);

// Edge Case 6: Attendance below 75% and impossible to recover (Irreversible Detention)
console.log('\n  [Edge Case 6]: Attendance below 75% and impossible to recover');
// Late semester date: 2026-11-25 with only 10% attendance
const ec6 = attendanceEngine.getSemesterEndForecast(SECTION, SUBJECT, 10, '2026-11-25');
console.log(`  Conducted: ${ec6.classesConducted}, Attended: ${ec6.estimatedAttendedClasses}, Remaining: ${ec6.classesRemaining}, Max: ${ec6.maximumPossibleAttendance}%`);
assert(ec6.status === 'IRREVERSIBLE DETENTION', `Status is "IRREVERSIBLE DETENTION" (got: "${ec6.status}")`);
assert(ec6.canReach75 === false, `Can reach 75% is false`);
assert(ec6.requiredFor75 === null, `Required for 75% is null (unachievable)`);
assert(ec6.canReach90 === false, `Can reach 90% is false`);
assert(ec6.requiredFor90 === null, `Required for 90% is null (unachievable)`);

// Edge Case 7: No remaining classes (Date after all classes or semester end)
console.log('\n  [Edge Case 7]: No remaining classes (e.g. 2026-11-29)');
const ec7 = attendanceEngine.getSemesterEndForecast(SECTION, SUBJECT, 80, '2026-11-29');
assert(ec7.classesRemaining === 0, `Remaining classes is 0`);
assert(ec7.classesConducted === ec7.totalClasses, `Conducted classes equals total classes`);
assert(ec7.maximumPossibleAttendance === 80.0, `Max possible attendance equals current attendance (80%)`);
assert(ec7.status === 'SAFE', `Status is "SAFE"`);

// Edge Case 8: Planning date = semester end (2026-11-29)
console.log('\n  [Edge Case 8]: Planning date = semester end (2026-11-29)');
const ec8 = attendanceEngine.getFutureProjection(SECTION, SUBJECT, 70, '2026-11-29');
assert(ec8.totalUpcomingClasses === 0, `Total upcoming classes is 0`);
assert(ec8.canMaintain75 === false, `Cannot maintain 75% when currently 70% and 0 classes remain`);
assert(ec8.canMiss === 0, `Can miss is 0`);

// Edge Case 9: Planning date before semester start (2026-08-20)
console.log('\n  [Edge Case 9]: Planning date before semester start (2026-08-20)');
const ec9 = attendanceEngine.getSemesterEndForecast(SECTION, SUBJECT, 100, '2026-08-20');
assert(ec9.classesConducted === 0, `Classes conducted before semester start is 0`);
assert(ec9.classesRemaining === 65, `Classes remaining before semester start equals full semester (65)`);
assert(ec9.maximumPossibleAttendance === 100.0, `Max possible is 100%`);

// Edge Case 10: Invalid section
console.log('\n  [Edge Case 10]: Invalid section rejection');
assertThrows(() => {
  attendanceEngine.getSemesterEndForecast('Nonexistent Section', SUBJECT, 85, MID_DATE);
}, 'not found', 'Rejects nonexistent section name');

assertThrows(() => {
  // Try 2024-25 section
  attendanceEngine.getSemesterEndForecast('I ECE-A', '21MAB102T', 85, MID_DATE);
}, 'not found', 'Rejects excluded 2024-25 archive section');

// Edge Case 11: Invalid subject
console.log('\n  [Edge Case 11]: Invalid subject rejection');
assertThrows(() => {
  attendanceEngine.getSemesterEndForecast(SECTION, 'FAKE_COURSE_999', 85, MID_DATE);
}, 'not found in section', 'Rejects invalid subject code');

// Edge Case 12: Attendance below 0%
console.log('\n  [Edge Case 12]: Attendance below 0% rejection');
assertThrows(() => {
  attendanceEngine.getSemesterEndForecast(SECTION, SUBJECT, -5, MID_DATE);
}, 'between 0 and 100', 'Rejects negative attendance percentage');

// Edge Case 13: Attendance above 100%
console.log('\n  [Edge Case 13]: Attendance above 100% rejection');
assertThrows(() => {
  attendanceEngine.getSemesterEndForecast(SECTION, SUBJECT, 105, MID_DATE);
}, 'between 0 and 100', 'Rejects attendance percentage > 100');

// -------------------------------------------------------------
// 3. Testing Future Attendance Projection (Step 8)
// -------------------------------------------------------------
console.log('\n3. Testing Future Attendance Projection (Step 8):');
// Test with a student having 85% attendance at MID_DATE
const projSafe = attendanceEngine.getFutureProjection(SECTION, SUBJECT, 85, MID_DATE);
console.log(`  Projection for 85% at ${MID_DATE}:`);
console.log(`    Conducted: ${projSafe.classesConducted}, Attended: ${projSafe.estimatedAttendedClasses}`);
console.log(`    Upcoming: ${projSafe.totalUpcomingClasses}, Must Attend: ${projSafe.mustAttend}, Can Miss: ${projSafe.canMiss}`);
console.log(`    Proj If All Attended: ${projSafe.projectedAttendanceIfAllAttended}%`);
console.log(`    Proj If Max Missed: ${projSafe.projectedAttendanceIfMaxMissed}%`);

assert(projSafe.canMaintain75 === true, `Can maintain 75% is true`);
assert(projSafe.canMiss >= 0, `Can miss is non-negative (${projSafe.canMiss})`);
assert(projSafe.mustAttend + projSafe.canMiss === projSafe.totalUpcomingClasses, `Must attend + can miss equals total upcoming classes`);
assert(projSafe.projectedAttendanceIfMaxMissed >= 75.0, `Projected attendance if max missed (${projSafe.projectedAttendanceIfMaxMissed}%) is >= 75%`);

// -------------------------------------------------------------
// 4. Multi-Section & Multi-Subject Verification
// -------------------------------------------------------------
console.log('\n4. Multi-Section and Multi-Subject Test Run:');
const sections = timetableService.getAllSections();

for (const sec of sections) {
  const subjects = timetableService.getSubjectsForSection(sec.sectionName);
  // Pick first subject and a lab subject
  const theorySub = subjects.find(s => s.classType === 'theory');
  const labSub = subjects.find(s => s.classType === 'lab');

  for (const sub of [theorySub, labSub].filter(Boolean)) {
    const forecast = attendanceEngine.getSemesterEndForecast(sec.sectionName, sub.subjectCode, 78, '2026-10-01');
    assert(forecast.totalClasses > 0, `[${sec.sectionName}] ${sub.subjectCode} has ${forecast.totalClasses} total semester classes`);
    assert(forecast.status === 'SAFE', `[${sec.sectionName}] ${sub.subjectCode} at 78% has status "SAFE"`);
    assert(forecast.canReach75 === true, `[${sec.sectionName}] ${sub.subjectCode} canReach75 is true`);
    assert(forecast.requiredFor75 === 0, `[${sec.sectionName}] ${sub.subjectCode} requiredFor75 is 0`);
  }
}

// -------------------------------------------------------------
// Final Test Summary
// -------------------------------------------------------------
console.log('\n===============================================================');
console.log(' STP3 ATTENDANCE ENGINE TEST SUMMARY');
console.log('===============================================================');
console.log(`Total Passed Assertions: ${passedTests}`);
console.log(`Total Failed Assertions: ${failedTests}`);

if (failedTests === 0) {
  console.log('\n✓ ALL STP3 ATTENDANCE CALCULATION TESTS PASSED SUCCESSFULLY.');
} else {
  console.error(`\n✗ ${failedTests} TESTS FAILED:`);
  testErrors.forEach((e, idx) => console.error(`  ${idx + 1}. ${e}`));
  process.exit(1);
}
