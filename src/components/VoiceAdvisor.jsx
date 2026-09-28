import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, Bot, ArrowRight, Play, Square } from 'lucide-react';

export default function VoiceAdvisor({ forecast, planningPlan, planningDate }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [advisorResponse, setAdvisorResponse] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize Speech APIs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          handleQuery(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        setSpeechSupported(true);
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Set default initial recommendation on forecast change
  useEffect(() => {
    if (forecast) {
      generateInitialSummary();
    }
  }, [forecast?.subjectCode, forecast?.currentAttendance, forecast?.classesRemaining]);

  // Voice speech output helper
  const speakText = (text) => {
    if (!voiceEnabled || !synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Generate initial summary
  const generateInitialSummary = () => {
    if (!forecast) return;
    const { subjectCode, currentAttendance, status, canReach75, requiredFor75, maxMissableFor75, classesRemaining, maximumPossibleAttendance } = forecast;
    
    let advice = '';
    if (!canReach75) {
      advice = `Irreversible detention warning for ${subjectCode}. Attendance is currently ${currentAttendance}%. Even with 100% attendance across all ${classesRemaining} remaining classes, your maximum ceiling is ${maximumPossibleAttendance.toFixed(1)}%, which is below the 75% requirement.`;
    } else if (requiredFor75 > 0) {
      advice = `Detention risk detected for ${subjectCode} at ${currentAttendance}%. You must attend the next ${requiredFor75} classes consecutively without any absence to restore your standing to 75%.`;
    } else if (status === '90% ACHIEVED') {
      advice = `Excellent standing in ${subjectCode}. Your attendance is ${currentAttendance}%, safely surpassing the 90% distinction benchmark. You can safely miss up to ${maxMissableFor75} classes before falling below 75%.`;
    } else {
      advice = `Your standing in ${subjectCode} is safe at ${currentAttendance}%. You have ${classesRemaining} classes remaining and can safely skip up to ${maxMissableFor75} classes while remaining at or above the 75% requirement.`;
    }

    setAdvisorResponse(advice);
    setLastQuery('Initial Status Assessment');
  };

  // Process user queries (either spoken or chip clicked)
  const handleQuery = (queryText) => {
    if (!forecast) return;
    setLastQuery(queryText);
    const q = queryText.toLowerCase();
    const {
      subjectCode,
      currentAttendance,
      classesConducted,
      estimatedAttendedClasses,
      classesRemaining,
      totalClasses,
      maximumPossibleAttendance,
      canReach75,
      requiredFor75,
      canReach90,
      requiredFor90,
      status,
      maxMissableFor75
    } = forecast;

    const planMiss = planningPlan ? planningPlan.canMiss : maxMissableFor75;
    const planUpcoming = planningPlan ? planningPlan.totalUpcomingClasses : classesRemaining;

    let response = '';

    if (q.includes('skip') || q.includes('miss') || q.includes('next class')) {
      if (!canReach75) {
        response = `You cannot afford to skip any classes in ${subjectCode}. Attendance is critically low at ${currentAttendance}%.`;
      } else if (planMiss === 0) {
        response = `You cannot skip your next class in ${subjectCode}. Any missed class will push your attendance below the mandatory 75% threshold.`;
      } else {
        response = `Yes, you have an attendance buffer. For ${subjectCode}, you can safely skip up to ${planMiss} of the upcoming ${planUpcoming} classes up to ${planningDate || 'semester end'} and still maintain at least 75.0% attendance.`;
      }
    } else if (q.includes('75') || q.includes('pass') || q.includes('detention') || q.includes('risk')) {
      if (!canReach75) {
        response = `Unfortunately, 75% is no longer reachable for ${subjectCode}. Maximum possible attendance is capped at ${maximumPossibleAttendance.toFixed(1)}%.`;
      } else if (requiredFor75 === 0) {
        response = `You are already compliant for ${subjectCode} with ${currentAttendance}% attendance. You have a safety cushion of ${maxMissableFor75} allowable skips.`;
      } else {
        response = `To achieve 75% in ${subjectCode}, you must attend the next ${requiredFor75} scheduled classes without missing a single period.`;
      }
    } else if (q.includes('90') || q.includes('distinction') || q.includes('honor')) {
      if (status === '90% ACHIEVED') {
        response = `You have already achieved the 90% distinction benchmark in ${subjectCode} with ${currentAttendance}% attendance!`;
      } else if (canReach90) {
        response = `You can reach 90% in ${subjectCode}! You need to attend the next ${requiredFor90} consecutive classes without absence.`;
      } else {
        response = `90% distinction is mathematically out of reach for ${subjectCode}. Even if you attend all remaining ${classesRemaining} classes, maximum attendance will reach ${maximumPossibleAttendance.toFixed(1)}%.`;
      }
    } else if (q.includes('maximum') || q.includes('max') || q.includes('ceiling')) {
      response = `If you attend all remaining ${classesRemaining} classes in ${subjectCode}, your maximum possible attendance will be ${maximumPossibleAttendance.toFixed(1)}%.`;
    } else if (q.includes('remaining') || q.includes('left') || q.includes('conducted') || q.includes('schedule')) {
      response = `For ${subjectCode}, ${classesConducted} classes have been conducted so far, and ${classesRemaining} classes remain scheduled before November 29, totaling ${totalClasses} classes.`;
    } else {
      response = `For ${subjectCode}: Current attendance is ${currentAttendance}%. Status: ${status}. You can safely skip ${maxMissableFor75} classes, or must attend ${requiredFor75} classes to hit 75%.`;
    }

    setAdvisorResponse(response);
    speakText(response);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        stopSpeaking();
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const quickInquiries = [
    'Can I skip my next class?',
    'How many classes can I miss before 75%?',
    'How do I reach 90% distinction?',
    'What is my maximum possible attendance?',
    'How many classes are remaining?'
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-tactile overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            AI Attendance Voice Advisor
          </h3>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
            Real-Time Engine
          </span>
        </div>

        {/* Audio Toggle & Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
              } else {
                setVoiceEnabled(!voiceEnabled);
              }
            }}
            title={voiceEnabled ? 'Mute Speech' : 'Enable Speech'}
            className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
          >
            {voiceEnabled ? (
              <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {speechSupported && (
            <button
              onClick={toggleMic}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Voice Input</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Quick Inquiries Chips */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
            Ask Advisor Tactical Questions:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickInquiries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuery(q)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-750 transition-colors text-left cursor-pointer flex items-center space-x-1.5"
              >
                <span>{q}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Advisor Response Terminal / Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-semibold uppercase tracking-wider">Advisor Intelligence Feed</span>
            </div>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="inline-flex items-center space-x-1 text-slate-400 hover:text-rose-400 cursor-pointer"
              >
                <Square className="w-3 h-3" />
                <span>Stop Audio</span>
              </button>
            )}
          </div>

          {lastQuery && (
            <div className="text-[11px] font-mono text-slate-400 italic">
              &gt; Query: "{lastQuery}"
            </div>
          )}

          <p className="text-sm font-sans text-slate-100 leading-relaxed pt-1">
            {advisorResponse || 'Select an inquiry chip or use voice input to consult the engine.'}
          </p>

          <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-850">
            <span>Synthesized via Web Speech API</span>
            <button
              onClick={() => speakText(advisorResponse)}
              disabled={isSpeaking || !advisorResponse}
              className="text-cyan-400 hover:text-cyan-300 disabled:opacity-40 inline-flex items-center space-x-1 cursor-pointer"
            >
              <Play className="w-3 h-3" />
              <span>Replay Audio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
