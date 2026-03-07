import { useState, useRef, useCallback } from 'react'
import api from '../utils/api'

function JobCard({ job }) {
  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:border-amber-300 hover:shadow-md transition block"
    >
      <div className="flex items-start gap-4">
        {job.logo ? (
          <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-xl object-contain border border-stone-100 p-1" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl">
            🏢
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-[#1a1a1a] font-semibold text-sm">{job.title}</h3>
          <p className="text-stone-500 text-xs mt-1">{job.company}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-stone-400 text-xs">📍 {job.location}</span>
            <span className="text-stone-400 text-xs">🕒 {job.type}</span>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-full">
              {job.platform}
            </span>
          </div>
          <p className="text-stone-400 text-xs mt-3 leading-relaxed line-clamp-2">{job.description}</p>
        </div>
        <span className="text-amber-600 text-sm shrink-0">→</span>
      </div>
    </a>
  )
}

function ResumeProfile({ profile }) {
  if (!profile) return null
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
      <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-3">Resume Parsed</p>
      <p className="text-[#1a1a1a] font-semibold text-base">{profile.name}</p>
      {profile.currentRole && (
        <p className="text-stone-500 text-sm mt-0.5">{profile.currentRole}</p>
      )}
      {profile.summary && (
        <p className="text-stone-500 text-xs mt-2 leading-relaxed">{profile.summary}</p>
      )}
      {profile.topSkills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {profile.topSkills.map((skill, i) => (
            <span key={i} className="bg-white border border-amber-200 text-amber-800 text-xs px-2.5 py-0.5 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function Jobs() {
  const [mode, setMode] = useState('manual') // 'manual' | 'resume'

  // Manual search state
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [skills, setSkills] = useState('')
  const [searched, setSearched] = useState(false)

  // Resume state
  const [resumeFile, setResumeFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [resumeProfile, setResumeProfile] = useState(null)
  const [resumeError, setResumeError] = useState(null)
  const fileInputRef = useRef(null)

  // ── Manual Search ──────────────────────────────────────────
  const handleSearch = async () => {
    if (!query) return
    setLoading(true)
    setSearched(true)
    try {
      const { data } = await api.post('/jobs/search', { query, skills })
      setJobs(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Resume Upload ──────────────────────────────────────────
  const handleFile = (file) => {
    if (!file) return
    const valid = /\.(pdf|doc|docx|txt)$/i.test(file.name)
    if (!valid) {
      setResumeError('Please upload a PDF, DOC, DOCX, or TXT file.')
      return
    }
    setResumeError(null)
    setResumeFile(file)
    setResumeProfile(null)
    setJobs([])
    setSearched(false)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const handleResumeSearch = async () => {
    if (!resumeFile) return
    setLoading(true)
    setSearched(true)
    setResumeError(null)
    try {
      // Send the file as multipart form data to your backend
      const formData = new FormData()
      formData.append('resume', resumeFile)

      const { data } = await api.post('/jobs/search-by-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // Backend returns: { profile: {...}, jobs: [...] }
      if (data.profile) setResumeProfile(data.profile)
      setJobs(data.jobs || [])
    } catch (err) {
      console.error(err)
      setResumeError('Failed to process resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setJobs([])
    setSearched(false)
    setResumeProfile(null)
    setResumeError(null)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-8 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-5xl italic text-[#1a1a1a] mb-3">Job Finder</h1>
          <p className="text-stone-500 text-sm">Find relevant jobs from LinkedIn, Indeed, Naukri and more.</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-0 mb-6 bg-white border border-stone-200 rounded-xl overflow-hidden w-fit shadow-sm">
          <button
            onClick={() => switchMode('manual')}
            className={`px-5 py-2.5 text-sm font-medium transition ${
              mode === 'manual'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-stone-500 hover:bg-stone-50'
            }`}
          >
            Manual Search
          </button>
          <button
            onClick={() => switchMode('resume')}
            className={`px-5 py-2.5 text-sm font-medium transition flex items-center gap-1.5 ${
              mode === 'resume'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-stone-500 hover:bg-stone-50'
            }`}
          >
            <span>📄</span> Upload Resume
          </button>
        </div>

        {/* Search Box */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm mb-8">

          {mode === 'manual' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-stone-600 text-xs font-medium block mb-1.5">Job Title / Role</label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. Full Stack Developer"
                    className="w-full bg-stone-50 text-[#1a1a1a] placeholder-stone-400 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                  />
                </div>
                <div>
                  <label className="text-stone-600 text-xs font-medium block mb-1.5">Your Skills (comma separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. React, Node.js, MongoDB"
                    className="w-full bg-stone-50 text-[#1a1a1a] placeholder-stone-400 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={!query || loading}
                className="w-full bg-[#1a1a1a] hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition text-sm"
              >
                {loading ? 'Searching...' : 'Find Jobs →'}
              </button>
            </>
          ) : (
            <>
              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition mb-4 ${
                  isDragging
                    ? 'border-amber-400 bg-amber-50'
                    : resumeFile
                    ? 'border-green-300 bg-green-50'
                    : 'border-stone-200 bg-stone-50 hover:border-amber-300 hover:bg-amber-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                {resumeFile ? (
                  <>
                    <p className="text-2xl mb-2">✅</p>
                    <p className="text-[#1a1a1a] text-sm font-medium">{resumeFile.name}</p>
                    <p className="text-stone-400 text-xs mt-1">
                      {(resumeFile.size / 1024).toFixed(1)} KB · Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl mb-3">📄</p>
                    <p className="text-[#1a1a1a] text-sm font-medium">Drop your resume here</p>
                    <p className="text-stone-400 text-xs mt-1">or click to browse · PDF, DOC, DOCX, TXT</p>
                  </>
                )}
              </div>

              {resumeError && (
                <p className="text-red-500 text-xs mb-4">{resumeError}</p>
              )}

              <button
                onClick={handleResumeSearch}
                disabled={!resumeFile || loading}
                className="w-full bg-[#1a1a1a] hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition text-sm"
              >
                {loading ? 'Analyzing Resume...' : 'Find Jobs from Resume →'}
              </button>
            </>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Resume Profile Card */}
        {!loading && <ResumeProfile profile={resumeProfile} />}

        {/* Empty State */}
        {!loading && searched && jobs.length === 0 && (
          <div className="text-center py-24 text-stone-400">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-sm">No jobs found. Try different keywords.</p>
          </div>
        )}

        {/* Results */}
        {!loading && jobs.length > 0 && (
          <>
            <p className="text-stone-500 text-sm mb-4">{jobs.length} jobs found</p>
            <div className="flex flex-col gap-4">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default Jobs