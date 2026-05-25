import React, { useState, useEffect } from 'react';
import { useRecruiterStore } from '../store/recruiterStore.js';
import { useAuthStore } from '../store/authStore.js';
import {
  Sparkles,
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Lightbulb
} from 'lucide-react';

// SVG Radial Gauge Component
function RadialGauge({ value = 0, label, color = '#f97316', size = 100 }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  let trackColor = color;
  if (value < 40) trackColor = '#f43f5e';
  else if (value < 70) trackColor = '#f59e0b';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Background track */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1f1f24" strokeWidth="9" />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        {/* Center text */}
        <text x="50" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill="#ffffff" fontFamily="Sora, sans-serif">
          {value}
        </text>
      </svg>
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">{label}</span>
    </div>
  );
}

export default function RecruiterEvaluate() {
  const { evaluateResume, fetchEvalHistory, evalHistory, latestScore, loading, error } = useRecruiterStore();
  const [jobRole, setJobRole] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [localScore, setLocalScore] = useState(null);

  useEffect(() => {
    fetchEvalHistory();
  }, [fetchEvalHistory]);

  useEffect(() => {
    if (latestScore) setLocalScore(latestScore);
  }, [latestScore]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') setFile(dropped);
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const validateFile = (file) => {
    if (!file) return 'No file selected';
    if (file.type !== 'application/pdf') return 'Only PDF files are supported';
    if (file.size > MAX_FILE_SIZE) return 'File size must be under 10MB';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jobRole.trim() || !candidateName.trim()) return;

    const validationError = validateFile(file);
    if (validationError) {
      useAuthStore.setState({ error: validationError });
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobRole', jobRole);
    formData.append('candidateName', candidateName);
    try {
      const score = await evaluateResume(formData);
      setLocalScore(score);
    } catch (err) { /* handled by store */ }
  };

  const verdictIsHire = localScore?.verdict === 'hire';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-3xl text-accent flex items-center gap-2.5">
          <Sparkles className="h-7 w-7 text-primary animate-pulse" />
          AI Resume Evaluator
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Upload any candidate PDF resume, specify the target role, and LLaMA-3.3 70B will score skills, education, experience, and ATS compatibility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Upload Form — Left */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-6">
            <h3 className="font-heading font-bold text-base text-accent mb-4">Evaluation Input</h3>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Resume Drop Zone */}
              <div>
                <label className="text-accent text-[10px] font-bold block mb-1.5 uppercase tracking-wider">
                  Candidate Resume PDF
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center text-center cursor-pointer transition ${
                    dragOver ? 'border-primary bg-sky-50' : 'border-slate-200 hover:border-primary hover:bg-slate-50'
                  }`}
                >
                  {file ? (
                    <div className="flex flex-col items-center">
                      <FileText className="h-8 w-8 text-primary mb-2" />
                      <p className="text-xs font-semibold text-accent truncate max-w-[180px]">{file.name}</p>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-[10px] text-rose-500 hover:underline mt-1.5"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-2">
                      <UploadCloud className="h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-accent mb-1">Drop PDF here</p>
                      <p className="text-[10px] text-text-muted mb-3">PDF format only</p>
                      <label className="btn-primary py-1.5 px-4 text-[10px] font-semibold cursor-pointer shadow-sm">
                        Browse File
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Candidate Name */}
              <div>
                <label className="text-accent text-[10px] font-bold block mb-1.5 uppercase tracking-wider">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="premium-input text-sm"
                  required
                />
              </div>

              {/* Target Role */}
              <div>
                <label className="text-accent text-[10px] font-bold block mb-1.5 uppercase tracking-wider">
                  Target Job Role
                </label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Senior React Developer"
                  className="premium-input text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!file || !jobRole.trim() || !candidateName.trim() || loading}
                className="btn-primary w-full py-3 text-sm font-semibold shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Evaluating with LLaMA...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Run AI Evaluation
                  </>
                )}
              </button>
            </form>
          </div>


          {/* Eval History */}
          {evalHistory.length > 0 && (
            <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-5">
              <h3 className="font-heading font-bold text-sm text-accent mb-3">Past Evaluations</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {evalHistory.map((score) => (
                  <button
                    key={score.id}
                    onClick={() => setLocalScore(score)}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-sky-50/50 border border-slate-100 hover:border-sky-100 rounded-xl transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-accent leading-none">{score.candidateName}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{score.jobRole}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-heading font-extrabold text-accent">{score.overallScore}</span>
                        <p className={`text-[10px] font-bold ${score.verdict === 'hire' ? 'text-emerald-700' : 'text-rose-500'}`}>
                          {score.verdict === 'hire' ? '✓ Hire' : '✗ No-Hire'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Score Results — Right */}
        <div className="lg:col-span-3">
          {!localScore ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white border border-border-subtle rounded-2xl shadow-sm text-center p-10">
              <Sparkles className="h-16 w-16 text-slate-200 mb-5" />
              <h3 className="font-heading font-bold text-lg text-accent mb-2">Awaiting Evaluation</h3>
              <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                Upload a candidate's PDF resume and specify the target job role. LLaMA-3.3 AI will score skills, experience, education, and ATS compatibility in seconds.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Verdict Banner */}
              <div className={`rounded-2xl p-5 border flex items-center justify-between gap-4 ${
                verdictIsHire
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-rose-50 border-rose-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {verdictIsHire
                      ? <ThumbsUp className="h-5 w-5 text-emerald-600" />
                      : <ThumbsDown className="h-5 w-5 text-rose-500" />
                    }
                    <span className={`font-heading font-extrabold text-lg ${verdictIsHire ? 'text-emerald-800' : 'text-rose-700'}`}>
                      {verdictIsHire ? 'Recommended to Hire' : 'Not Recommended'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-text-muted">{localScore.candidateName} → {localScore.jobRole}</p>
                </div>
                <div className="shrink-0 text-center">
                  <p className="text-4xl font-heading font-extrabold text-accent leading-none">{localScore.overallScore}</p>
                  <p className="text-[10px] text-text-muted mt-0.5 font-semibold">/100 OVERALL</p>
                </div>
              </div>

              {/* Score Gauges Grid */}
              <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-6">
                <h3 className="font-heading font-bold text-base text-accent mb-6">Score Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 place-items-center">
                  <RadialGauge value={localScore.skillsScore} label="Skills" />
                  <RadialGauge value={localScore.experienceScore} label="Experience" />
                  <RadialGauge value={localScore.educationScore} label="Education" />
                  <RadialGauge value={localScore.atsScore} label="ATS Score" />
                </div>

                {/* Progress bars beneath */}
                <div className="mt-6 space-y-3.5 pt-4 border-t border-slate-100">
                  {[
                    { label: 'Skills Match', value: localScore.skillsScore },
                    { label: 'Experience Relevance', value: localScore.experienceScore },
                    { label: 'Education Qualification', value: localScore.educationScore },
                    { label: 'ATS Keyword Compatibility', value: localScore.atsScore },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-accent font-bold">{label}</span>
                        <span className="text-[10px] text-text-muted font-semibold">{value} / 100</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            value >= 70 ? 'bg-emerald-400' : value >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions list */}
              {localScore.suggestions?.length > 0 && (
                <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-6">
                  <h3 className="font-heading font-bold text-base text-accent mb-4 flex items-center gap-2">
                    <Lightbulb className="h-4.5 w-4.5 text-amber-500" />
                    AI Recommendations
                  </h3>
                  <ul className="space-y-3">
                    {localScore.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-text-muted leading-relaxed">
                        <span className="bg-sky-100 text-primary rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
