import { useState, useEffect } from 'react'
import { api } from '../store/authStore'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { FileText, Sparkles } from 'lucide-react'

function scoreColor(score) {
  if (score >= 70) return '#059669'
  if (score >= 40) return '#d97706'
  return '#dc2626'
}

function HistoryCard({ item }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm hover:border-sky-100 transition">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 shrink-0">
          <CircularProgressbar
            value={item.matchScore}
            text={`${item.matchScore}%`}
            styles={buildStyles({
              textColor: '#1a1a2e',
              pathColor: scoreColor(item.matchScore),
              trailColor: '#f1f5f9',
              textSize: '24px',
            })}
          />
        </div>

        <div className="flex-1">
          <h3 className="font-heading font-bold text-sm text-accent">{item.jobTitle}</h3>
          <p className="text-text-muted text-xs mt-1 flex items-center gap-1">
            <FileText className="h-3 w-3" /> {item.resumeName}
          </p>
          <p className="text-text-muted text-xs mt-0.5">
            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-text-muted hover:text-accent text-xs border border-slate-200 hover:border-primary px-4 py-2 rounded-full transition shrink-0 font-semibold"
        >
          {expanded ? 'Hide' : 'Details'}
        </button>
      </div>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">Missing Skills</p>
          <div className="flex flex-wrap gap-2">
            {item.missingSkills.length > 0 ? item.missingSkills.map((skill) => (
              <span key={skill} className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-3 py-1.5 rounded-full font-medium">
                {skill}
              </span>
            )) : (
              <span className="text-xs text-emerald-600 font-semibold">No missing skills identified</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function History() {
  const [history, setHistory] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/history')
        setHistory(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const filtered = history.filter((item) => {
    if (filter === 'Strong') return item.matchScore >= 70
    if (filter === 'Moderate') return item.matchScore >= 40 && item.matchScore < 70
    if (filter === 'Weak') return item.matchScore < 40
    return true
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans">
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-3xl text-accent flex items-center gap-2.5">
          <Sparkles className="h-7 w-7 text-primary animate-pulse" />
          Analysis History
        </h1>
        <p className="text-text-muted text-sm mt-1">All your past resume analyses in one place.</p>
      </div>

      <div className="flex gap-2 mb-8">
        {['All', 'Strong', 'Moderate', 'Weak'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`text-xs px-5 py-2 rounded-full transition font-semibold cursor-pointer ${
              filter === tab
                ? 'bg-accent text-white'
                : 'bg-white border border-slate-200 text-text-muted hover:border-primary hover:text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-border-subtle rounded-2xl shadow-sm">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-text-muted font-medium">Loading history...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => <HistoryCard key={item._id} item={item} />)}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-border-subtle rounded-2xl shadow-sm">
          <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="text-sm font-semibold text-accent">No analyses found</p>
          <p className="text-xs text-text-muted mt-1">
            {filter === 'All' ? 'Run your first resume evaluation to see results here.' : `No ${filter.toLowerCase()} matches found.`}
          </p>
        </div>
      )}
    </div>
  )
}

export default History