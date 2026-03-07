import { useState, useEffect } from 'react'
import api from '../utils/api'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

function scoreColor(score) {
  if (score >= 70) return '#b45309'
  if (score >= 40) return '#d97706'
  return '#dc2626'
}

function HistoryCard({ item }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:border-stone-300 transition">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 shrink-0">
          <CircularProgressbar
            value={item.matchScore}
            text={`${item.matchScore}%`}
            styles={buildStyles({
              textColor: '#1a1a1a',
              pathColor: scoreColor(item.matchScore),
              trailColor: '#f5f5f4',
              textSize: '24px',
            })}
          />
        </div>

        <div className="flex-1">
          <h3 className="text-[#1a1a1a] font-medium text-sm">{item.jobTitle}</h3>
          <p className="text-stone-400 text-xs mt-1">📄 {item.resumeName}</p>
          <p className="text-stone-400 text-xs mt-0.5">
            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-stone-500 hover:text-stone-800 text-xs border border-stone-200 hover:border-stone-400 px-4 py-2 rounded-full transition shrink-0"
        >
          {expanded ? 'Hide ↑' : 'Details ↓'}
        </button>
      </div>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-stone-100">
          <p className="text-stone-400 text-xs font-medium uppercase tracking-widest mb-3">Missing Skills</p>
          <div className="flex flex-wrap gap-2">
            {item.missingSkills.map((skill) => (
              <span key={skill} className="bg-red-50 text-red-700 border border-red-200 text-xs px-3 py-1.5 rounded-full">
                {skill}
              </span>
            ))}
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
    <div className="min-h-screen bg-[#FAFAF8] px-8 py-12">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <h1 className="font-serif text-5xl italic text-[#1a1a1a] mb-3">Analysis History</h1>
          <p className="text-stone-500 text-sm">All your past resume analyses in one place.</p>
        </div>

        <div className="flex gap-2 mb-8">
          {['All', 'Strong', 'Moderate', 'Weak'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs px-5 py-2 rounded-full transition font-medium
                ${filter === tab
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filtered.map((item) => <HistoryCard key={item._id} item={item} />)}
          </div>
        ) : (
          <div className="text-center py-24 text-stone-400">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-sm">No analyses found for this filter.</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default History