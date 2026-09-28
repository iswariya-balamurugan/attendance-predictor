/**
 * Automated Test Suite for STP4 Future Attendance Planning & Semester Forecast
 * Tests all 15 scenarios and mathematical optimality proofs.
 */

const futurePlanningService = require('../src/services/futurePlanningService');
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
console.log(' STP4: FUTURE ATTENDANCE PLANNING TEST SUITE');
console.log('===============================================================\n');

const SECTION = 'II - BME';
const SUBJECT = '21MAB201T'; // 5 classes/week (Tue P4, Wed P3-P4, Thu P1, Fri P2)
const CURRENT_DATE = '2026-10-15'; // Thursday mid-semester

// -------------------------------------------------------------
// 1. Planning Date Inside Semester (Scenario 1)
// -------------------------------------------------------------
console.log('1. Scenario 1: Planning Date Inside Semester (e.g. 2026-10-31)');
const plan1 = futurePlanningService.calculateFutureAttendancePlan(
  SECTION,
  SUBJECT,
  82,
  '2026-10-31',
  CURRENT_DATE
);

assert(plan1.classesConducted === 34, `Classes conducted up to ${CURRENT_DATE} is 34`);
assert(plan1.totalUpcomingClasses > 0, `Upcoming classes to 2026-10-31 (${plan1.totalUpcomingClasses}) is positive`);
assert(plan1.canReach75 === true, `Can reach 75% is true`);
assert(plan1.canMiss >= 0, `Can miss is non-negative (${plan1.canMiss})`);
assert(plan1.mustAttend + plan1.canMiss === plan1.totalUpcomingClasses, `Must attend (${plan1.mustAttend}) + can miss (${plan1.canMiss}) = total upcoming (${plan1.totalUpcomingClasses})`);
assert(plan1.projectedAttendance >= 75.0, `Projected attendance (${plan1.projectedAttendance}%) is >= 75.0%`);

// -------------------------------------------------------------
// 2. Planning Date = Semester End (Scenario 2)
// -------------------------------------------------------------
console.log('\n2. Scenario 2: Planning Date = Semester End (2026-11-29)');
const plan2 = futurePlanningService.calculateFutureAttendancePlan(
  SECTION,
  SUBJECT,
  82,
  '2026-11-29',
  CURRENT_DATE
);
assert(plan2.planningDate === '2026-11-29', `Planning date is 2026-11-29`);
assert(plan2.classesConducted + plan2.totalUpcomingClasses === 65, `Total classes evaluated equals full semester (65)`);
assert(plan2.projectedAttendance >= 75.0, `Projected attendance is >= 75%`);

// -------------------------------------------------------------
// 3. Planning Date Before Semester Start (Scenario 3)
// -------------------------------------------------------------
console.log('\n3. Scenario 3: Planning Date Before Semester Start (e.g. 2026-08-20)');
assertThrows(() => {
  futurePlanningService.calculateFutureAttendancePlan(SECTION, SUBJECT, 80, '2026-08-20', '2026-08-15');
}, 'before semester start date', 'Rejects planning date before 2026-08-29');

// -------------------------------------------------------------
// 4. Planning Date After Semester End (Scenario 4)
// -------------------------------------------------------------
console.log('\n4. Scenario 4: Planning Date After Semester End (e.g. 2026-12-05)');
assertThrows(() => {
  futurePlanningService.calculateFutureAttendancePlan(SECTION, SUBJECT, 80, '2026-12-05', CURRENT_DATE);
}, 'after semester end date', 'Rejects planning date after 2026-11-29');

// -------------------------------------------------------------
// 5. Student Already Above 75% (Scenario 5)
// -------------------------------------------------------------
console.log('\n5. Scenario 5: Student Already Above 75% (e.g. 90%)');
const plan5 = futurePlanningService.calculateFutureAttendancePlan(
  SECTION,
  SUBJECT,
  90,
  '2026-10-31',
  CURRENT_DATE
);
assert(plan5.canReach75 === true, `Can reach 75% is true`);
assert(plan5.canMiss > 0, `Student above 75% has allowable misses: ${plan5.canMiss} classes`);
assert(plan5.projectedAttendance >= 75.0, `Projected attendance if max missed is >= 75% (${plan5.projectedAttendance}%)`);

// -------------------------------------------------------------
// 6. Student Exactly at 75% (Scenario 6)
// -------------------------------------------------------------
console.log('\n6. Scenario 6: Student Exactly at 75%');
const plan6 = futurePlanningService.calculateFutureAttendancePlan(
  SECTION,
  SUBJECT,
  75,
  '2026-10-31',
  CURRENT_DATE
);
assert(plan6.canReach75 === true, `Can reach 75% is true`);
assert(plan6.projectedAttendance >= 75.0, `Projected attendance is >= 75% (${plan6.projectedAttendance}%)`);

// -------------------------------------------------------------
// 7. Student Below 75% but Recoverable (Scenario 7)
// -------------------------------------------------------------
console.log('\n7. Scenario 7: Student Below 75% but Recoverable (e.g. 65%)');
const plan7 = futurePlanningService.calculateFutureAttendancePlan(
  SECTION,
  SUBJECT,
  65,
  '2026-11-29',
  CURRENT_DATE
);
assert(plan7.canReach75 === true, `Can reach 75% is true`);
assert(plan7.status === 'DETENTION RISK', `Status is "DETENTION RISK"`);
assert(plan7.mustAttend > 0, `Must attend is positive: ${plan7.mustAttend}`);
assert(plan7.projectedAttendance >= 75.0, `Projected attendance is >= 75% (${plan7.projectedAttendance}%)`);

// -------------------------------------------------------------
// 8. Student Below 75% and Impossible to Recover (Scenario 8)
// -------------------------------------------------------------
console.log('\n8. Scenario 8: Student Below 75% and Impossible to Recover');
const plan8 = futurePlanningService.calculateFutureAttendancePlan(
  SECTION,
  SUBJECT,
  10,
  '2026-11-29',
  '2026-11-25' // Late in semester with 10% attendance
);
assert(plan8.canReach75 === false, `Can reach 75% is false`);
assert(plan8.status === 'IRREVERSIBLE DETENTION', `Status is "IRREVERSIBLE DETENTION"`);
assert(plan8.canMiss === 0, `Can miss is 0`);
assert(plan8.mustAttend === plan8.totalUpcomingClasses, `Must attend equals all upcoming classes`);
assert(plan8.projectedAttendance < 75.0, `Projected attendance is < 75% (${plan8.projectedAttendance}%)`);

// -------------------------------------------------------------
// 9. Zero Upcoming Classes (Scenario 9)
// -------------------------------------------------------------
console.log('\n9. Scenario 9: Zero Upcoming Classes (Planning Date = Current Date)');
const plan9 = futurePlanningService.calculateFutureAttendancePlan(
  SECTION,
  SUBJECT,
  80,
  CURRENT_DATE,
  CURRENT_DATE
);
assert(plan9.totalUpcomingClasses === 0, `Total upcoming classes is 0`);
assert(plan9.canMiss === 0, `Can miss is 0`);
assert(plan9.mustAttend === 0, `Must attend is 0`);
assert(plan9.canReach75 === true, `Can reach 75% is true`);
const expectedPct9 = Number(((plan9.estimatedAttendedClasses / plan9.classesConducted) * 100).toFixed(2));
assert(plan9.projectedAttendance === expectedPct9,
  `Projected attendance (${plan9.projectedAttendance}%) matches attended/conducted ratio (${expectedPct9}%)`);


// -------------------------------------------------------------
// 10. One Upcoming Class (Scenario 10)
// -------------------------------------------------------------
console.log('\n10. Scenario 10: One Upcoming Class');
// On 2026-10-15 (Thu P1 is 21MAB201T). Friday 2026-10-16 has 1 class (Fri P2).
const plan10 = futurePlanningService.calculateFutureAttendancePlan(
  SECTION,
  SUBJECT,
  80,
  '2026-10-16',
  '2026-10-15'
);
assert(plan10.totalUpcomingClasses === 1, `Total upcoming classes for tomorrow (Friday) is exactly 1`);
assert(plan10.upcomingClasses.length === 1, `Upcoming classes array length is 1`);
assert(plan10.upcomingClasses[0].period === 2, `Friday class is Period 2`);

// -------------------------------------------------------------
// 11. Multiple Upcoming Classes (Scenario 11)
// -------------------------------------------------------------
console.log('\n11. Scenario 11: Multiple Upcoming Classes');
const plan11 = futurePlanningService.calculateFutureAttendancePlan(
  SECTION,
  SUBJECT,
  80,
  '2026-10-23', // Next week (5 classes of 21MAB201T + Friday 1 class = 6 classes)
  '2026-10-15'
);
assert(plan11.totalUpcomingClasses === 6, `Total upcoming classes over 8 days is 6`);
assert(plan11.upcomingClassDates.length > 1, `Upcoming class dates has multiple entries`);

// -------------------------------------------------------------
// 12. Lab Periods (Scenario 12)
// -------------------------------------------------------------
console.log('\n12. Scenario 12: Laboratory Periods as Classes');
const LAB_SUBJECT = 'DLMS/EEC_LAB';
const planLab = futurePlanningService.calculateFutureAttendancePlan(
  SECTION,
  LAB_SUBJECT,
  80,
  '2026-10-31',
  CURRENT_DATE
);
assert(planLab.classType === 'lab', `Class type is lab`);
assert(planLab.totalUpcomingClasses > 0, `Upcoming lab classes count is positive (${planLab.totalUpcomingClasses})`);
// Verify all upcoming lab entries are lab classType
for (const entry of planLab.upcomingClasses) {
  assert(entry.classType === 'lab', `Lab entry on ${entry.date} P${entry.period} has classType "lab"`);
  assert(entry.period === 6 || entry.period === 7 || entry.period === 8 || entry.period === 9,
    `Lab entry period (${entry.period}) is valid lab slot`);
}

// -------------------------------------------------------------
// 13, 14, 15. Mathematical Proof of Optimality (Scenarios 13, 14, 15)
// -------------------------------------------------------------
console.log('\n13-15. Mathematical Proof of canMiss, mustAttend, and Projected Attendance:');

// Test across diverse attendance levels
const testLevels = [70, 75, 78, 82, 85, 90, 95];
for (const level of testLevels) {
  const plan = futurePlanningService.calculateFutureAttendancePlan(
    SECTION,
    SUBJECT,
    level,
    '2026-11-20',
    CURRENT_DATE
  );

  const T = plan.classesConducted;
  const A = plan.estimatedAttendedClasses;
  const R = plan.totalUpcomingClasses;
  const m = plan.canMiss;
  const req = plan.mustAttend;
  const total = T + R;

  // Proof 1: mustAttend + canMiss === totalUpcomingClasses
  assert(req + m === R, `[Level ${level}%] req (${req}) + m (${m}) === R (${R})`);

  // Proof 2: When canMiss classes are missed, attendance >= 75%
  const attendedIfMissM = A + (R - m);
  const pctIfMissM = (attendedIfMissM / total) * 100;
  assert(pctIfMissM >= 75.0, `[Level ${level}%] Attendance when missing ${m} classes is ${pctIfMissM.toFixed(2)}% (>= 75%)`);
  assert(plan.projectedAttendance === Number(pctIfMissM.toFixed(2)),
    `[Level ${level}%] Projected attendance matches exact calculation (${plan.projectedAttendance}%)`);

  // Proof 3: When (canMiss + 1) classes are missed, attendance MUST drop strictly below 75% (if m < R)
  if (m < R) {
    const attendedIfMissMPlus1 = A + (R - (m + 1));
    const pctIfMissMPlus1 = (attendedIfMissMPlus1 / total) * 100;
    assert(pctIfMissMPlus1 < 75.0,
      `[Level ${level}%] Missing 1 extra class (${m + 1}) strictly drops attendance to ${pctIfMissMPlus1.toFixed(2)}% (< 75%)`);
  }
}

// -------------------------------------------------------------
// 16. Enhanced Semester-End Forecast (Step 4)
// -------------------------------------------------------------
console.log('\n16. Testing Enhanced Semester-End Forecast:');
const forecast = futurePlanningService.getSemesterEndForecast(SECTION, SUBJECT, 82, CURRENT_DATE);
assert(forecast.semesterEndDate === '2026-11-29', `Forecast targets 2026-11-29`);
assert(forecast.currentAttendance === 82.0, `Current attendance is 82.0%`);
assert(forecast.classesConducted === 34, `Conducted is 34`);
assert(forecast.classesRemaining === 31, `Remaining is 31`);
assert(forecast.totalClasses === 65, `Total classes is 65`);
assert(forecast.canReach75 === true, `canReach75 is true`);
assert(forecast.requiredFor75 === 0, `requiredFor75 is 0 (already safe)`);
assert(forecast.maxMissableFor75 > 0, `Max missable for 75% is positive (${forecast.maxMissableFor75})`);
assert(forecast.status === 'SAFE', `Status is SAFE`);

// -------------------------------------------------------------
// 17. Upcoming Classes Breakdown Inspection (Step 5)
// -------------------------------------------------------------
console.log('\n17. Testing Upcoming Class Breakdown Format (Step 5):');
const upcoming = futurePlanningService.getUpcomingClasses(SECTION, '2026-10-16', '2026-10-20', SUBJECT);
assert(upcoming.length > 0, `Found ${upcoming.length} upcoming classes`);
for (const cls of upcoming) {
  assert(cls.date && cls.day && cls.period && cls.startTime && cls.endTime && cls.subject && cls.subjectCode && cls.classType && cls.section,
    `Class entry on ${cls.date} P${cls.period} contains all required fields`);
}

// -------------------------------------------------------------
// Final Test Summary
// -------------------------------------------------------------
console.log('\n===============================================================');
console.log(' STP4 FUTURE PLANNING TEST SUMMARY');
console.log('===============================================================');
console.log(`Total Passed Assertions: ${passedTests}`);
console.log(`Total Failed Assertions: ${failedTests}`);

if (failedTests === 0) {
  console.log('\n✓ ALL STP4 FUTURE ATTENDANCE PLANNING TESTS PASSED SUCCESSFULLY.');
} else {
  console.error(`\n✗ ${failedTests} TESTS FAILED:`);
  testErrors.forEach((e, idx) => console.error(`  ${idx + 1}. ${e}`));
  process.exit(1);
}
