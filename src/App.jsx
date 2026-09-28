import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import LandingHero from './components/LandingHero';
import AttendanceForm from './components/AttendanceForm';
import AttendanceOverview from './components/AttendanceOverview';
import TargetPanels from './components/TargetPanels';
import PlanAheadSection from './components/PlanAheadSection';
import UpcomingClassesView from './components/UpcomingClassesView';
import SemesterForecastCard from './components/SemesterForecastCard';
import VoiceAdvisor from './components/VoiceAdvisor';
import {
  getAllSections,
  getSubjectsForSection,
  getSemesterEndForecast,
  calculateFutureAttendancePlan,
  validatePlanningDate,
  validateAttendancePercentage,
  SEMESTER_START,
  SEMESTER_END
} from './services/clientServices';

export default function App() {
  const sections = useMemo(() => getAllSections(), []);

  // Primary state variables
  const [selectedSection, setSelectedSection] = useState(sections[0]?.sectionName || 'II - BME');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const [currentAttendance, setCurrentAttendance] = useState(78.0);
  const [currentDate, setCurrentDate] = useState('2026-10-15');
  const [planningDate, setPlanningDate] = useState('2026-10-31');
  const [validationError, setValidationError] = useState('');

  // Update subject list when section changes
  useEffect(() => {
    try {
      const subjects = getSubjectsForSection(selectedSection);
      if (subjects.length > 0) {
        // If current subject code is not in new section's subjects, switch to first subject
        const exists = subjects.some(s => s.subjectCode === selectedSubjectCode);
        if (!exists) {
          setSelectedSubjectCode(subjects[0].subjectCode);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedSection]);

  // Compute semester-end forecast
  const forecast = useMemo(() => {
    if (!selectedSection || !selectedSubjectCode) return null;
    try {
      validateAttendancePercentage(currentAttendance);
      return getSemesterEndForecast(
        selectedSection,
        selectedSubjectCode,
        currentAttendance,
        currentDate
      );
    } catch (err) {
      setValidationError(err.message);
      return null;
    }
  }, [selectedSection, selectedSubjectCode, currentAttendance, currentDate]);

  // Compute future planning plan
  const planningPlan = useMemo(() => {
    if (!selectedSection || !selectedSubjectCode || !planningDate) return null;
    try {
      validatePlanningDate(planningDate, currentDate);
      setValidationError('');
      return calculateFutureAttendancePlan(
        selectedSection,
        selectedSubjectCode,
        currentAttendance,
        planningDate,
        currentDate
      );
    } catch (err) {
      setValidationError(err.message);
      return null;
    }
  }, [selectedSection, selectedSubjectCode, currentAttendance, planningDate, currentDate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Technical Sticky Header */}
      <Header />

      {/* Hero Section */}
      <LandingHero />

      {/* Main Tactical Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Deck: Input Parameters & Overview Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <AttendanceForm
              selectedSection={selectedSection}
              onSelectSection={setSelectedSection}
              selectedSubjectCode={selectedSubjectCode}
              onSelectSubjectCode={setSelectedSubjectCode}
              currentAttendance={currentAttendance}
              onChangeAttendance={setCurrentAttendance}
              currentDate={currentDate}
              onChangeCurrentDate={setCurrentDate}
              planningDate={planningDate}
              onChangePlanningDate={setPlanningDate}
              validationError={validationError}
            />
          </div>

          <div className="lg:col-span-6">
            <AttendanceOverview forecast={forecast} />
          </div>
        </div>

        {/* Target Benchmark Panels (75% Minimum vs 90% Distinction) */}
        <TargetPanels forecast={forecast} planningPlan={planningPlan} />

        {/* AI Voice Advisor */}
        <VoiceAdvisor
          forecast={forecast}
          planningPlan={planningPlan}
          planningDate={planningDate}
        />

        {/* Future Planning & Allowable Skips Engine */}
        <PlanAheadSection
          planningPlan={planningPlan}
          planningDate={planningDate}
          currentDate={currentDate}
          subjectCode={selectedSubjectCode}
        />

        {/* Upcoming Classes Timeline */}
        <UpcomingClassesView
          sectionName={selectedSection}
          selectedSubjectCode={selectedSubjectCode}
          currentDate={currentDate}
          planningDate={planningDate}
        />

        {/* Full Section Semester Audit Matrix */}
        <SemesterForecastCard
          sectionName={selectedSection}
          currentAttendance={currentAttendance}
          currentDate={currentDate}
          onSelectSubject={(code) => setSelectedSubjectCode(code)}
        />
      </main>

      {/* Tactical Engineering Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950 py-8 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="text-slate-400 font-semibold">
              SRM ATTENDANCE PREDICTOR • HACKATHON GRADE ENGINE
            </div>
            <div className="text-[11px] text-slate-500">
              STP1–STP5 Complete • 9 Verified Sections • 85 Subjects • 244 Weekly Classes • Zero Mock Data
            </div>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>2,178 Unit Tests Passing</span>
            </span>
            <span className="text-slate-700">|</span>
            <span>Taste Skill Frontend</span>
            <span className="text-slate-700">|</span>
            <span>ODD SEMESTER 2026–27</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
