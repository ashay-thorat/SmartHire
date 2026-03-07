import { useState } from 'react'
import api from '../utils/api'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

function Dashboard() {
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

 const handleAnalyze = async () => {
  if (!resumeFile || !jobDesc) return
  setLoading(true)
  setResult(null)
  try {
    const formData = new FormData()
    formData.append('resume', resumeFile)
    formData.append('jobDescription', jobDesc)

    const { data } = await api.post('/analysis', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    setResult(data)
  } catch (err) {
    alert(err.response?.data?.message || 'Analysis failed')
  } finally {
    setLoading(false)
  }
}

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') setResumeFile(file)
  }

  const scoreColor = result
    ? result.matchScore >= 70 ? '#b45309' : result.matchScore >= 40 ? '#d97706' : '#dc2626'
    : '#b45309'

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-8 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-5xl text-[#1a1a1a] italic mb-3">Analyze Your Resume</h1>
          <p className="text-stone-500 text-sm">Upload your resume and paste a job description to get your AI match score.</p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition
              ${dragOver ? 'border-amber-400 bg-amber-50' : 'border-stone-300 bg-white hover:border-amber-300 hover:bg-amber-50/40'}`}
          >
            {resumeFile ? (
              <>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <p className="text-[#1a1a1a] font-medium text-sm">{resumeFile.name}</p>
                <p className="text-stone-400 text-xs mt-1">PDF uploaded ✓</p>
                <button onClick={() => setResumeFile(null)} className="text-red-400 text-xs mt-3 hover:text-red-500">
                  Remove
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <p className="text-[#1a1a1a] font-medium text-sm mb-1">Drop your resume here</p>
                <p className="text-stone-400 text-xs mb-5">PDF format only</p>
                <label className="bg-[#1a1a1a] hover:bg-stone-800 text-white text-xs px-5 py-2.5 rounded-full cursor-pointer transition">
                  Browse File
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => setResumeFile(e.target.files[0])} />
                </label>
              </>
            )}
          </div>

          {/* Job Description */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col">
            <label className="text-stone-600 text-xs font-medium mb-3">Job Description</label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste the job description here..."
              className="flex-1 bg-stone-50 text-[#1a1a1a] placeholder-stone-400 border border-stone-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition min-h-[180px]"
            />
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!resumeFile || !jobDesc || loading}
          className="w-full bg-[#1a1a1a] hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-medium py-4 rounded-2xl transition text-sm mb-12"
        >
          {loading ? 'Analyzing...' : 'Analyze My Resume →'}
        </button>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-16">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-stone-400 text-sm">AI is reading your resume...</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            <div className="border-t border-stone-200 mb-10" />
            <h2 className="font-serif text-3xl italic text-[#1a1a1a] mb-8">Your Results</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Score */}
              <div className="bg-white border border-stone-200 rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm">
                <p className="text-stone-500 text-xs font-medium tracking-widest uppercase mb-6">Match Score</p>
                <div className="w-32 h-32">
                  <CircularProgressbar
                    value={result.matchScore}
                    text={`${result.matchScore}%`}
                    styles={buildStyles({
                      textColor: '#1a1a1a',
                      pathColor: scoreColor,
                      trailColor: '#f5f5f4',
                      textSize: '18px',
                    })}
                  />
                </div>
                <p className="text-stone-500 text-xs mt-6 text-center leading-relaxed">
                  {result.matchScore >= 70
                    ? 'Strong match — polish and apply.'
                    : result.matchScore >= 40
                    ? 'Moderate match — improve first.'
                    : 'Weak match — significant changes needed.'}
                </p>
              </div>

              {/* Missing Skills */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                <p className="text-stone-500 text-xs font-medium tracking-widest uppercase mb-5">Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill) => (
                    <span key={skill} className="bg-red-50 text-red-700 border border-red-200 text-xs px-3 py-1.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                <p className="text-stone-500 text-xs font-medium tracking-widest uppercase mb-5">AI Suggestions</p>
                <ul className="flex flex-col gap-4">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-xs text-stone-600 leading-relaxed">
                      <span className="text-amber-600 font-bold mt-0.5 shrink-0">→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default Dashboard