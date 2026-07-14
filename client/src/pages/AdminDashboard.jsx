import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { api } from '../store/authStore'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'

function AdminDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [stats, setStats] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 20

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b']; // emerald for candidates, blue for recruiters, amber for admins

  useEffect(() => {
    if (!user || user.role !== 'admin') return

    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get(`/admin/users?page=${page}&limit=${limit}`),
          api.get('/admin/stats'),
        ])
        setUsers(usersRes.data.users)
        setTotalPages(usersRes.data.totalPages)
        setStats(statsRes.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, page])

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId)
    setError('')
    try {
      const { data } = await api.put(`/admin/users/${userId}/role`, { role: newRole })
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: data.role } : u)))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is irreversible.')) {
      return
    }
    setActionLoading(userId)
    setError('')
    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(users.filter((u) => u.id !== userId))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
    } finally {
      setActionLoading(null)
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-border-subtle rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 mx-auto mb-6">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-accent mb-2">Access Denied</h2>
          <p className="text-text-muted text-sm mb-6">
            You do not have the required administrative permissions to access this control panel.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full btn-primary py-2.5 text-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const roleData = stats ? [
    { name: 'Candidates', value: stats.candidates || 0 },
    { name: 'Recruiters', value: stats.recruiters || 0 },
    { name: 'Admins', value: (stats.totalUsers || 0) - (stats.candidates || 0) - (stats.recruiters || 0) }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Admin Suite
            </span>
            <h1 className="font-heading font-extrabold text-3xl text-accent mt-3">
              User Directory & Control
            </h1>
            <p className="text-text-muted text-sm mt-2">
              Manage platform credentials, update access permissions, and revoke accounts.
            </p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white px-6 py-5 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-center">
                <p className="text-3xl font-heading font-extrabold text-accent">{stats.totalUsers}</p>
                <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">Total Users</p>
              </div>
              <div className="bg-white px-6 py-5 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-center">
                <p className="text-3xl font-heading font-extrabold text-emerald-600">{stats.candidates}</p>
                <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">Candidates</p>
              </div>
              <div className="bg-white px-6 py-5 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-center">
                <p className="text-3xl font-heading font-extrabold text-blue-600">{stats.recruiters}</p>
                <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">Recruiters</p>
              </div>
              <div className="bg-white px-6 py-5 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-center">
                <p className="text-3xl font-heading font-extrabold text-accent">{stats.totalJobs || 0}</p>
                <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">Active Jobs</p>
              </div>
              <div className="bg-white px-6 py-5 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-center">
                <p className="text-3xl font-heading font-extrabold text-accent">{stats.totalApplications || 0}</p>
                <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">Applications</p>
              </div>
              <div className="bg-white px-6 py-5 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-center">
                <p className="text-3xl font-heading font-extrabold text-amber-600">{stats.totalEvaluations || 0}</p>
                <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">AI Evaluations</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border-subtle shadow-sm p-4 h-64 flex flex-col">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 text-center">User Roles Distribution</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#1f2937', fontWeight: 600 }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white border border-border-subtle rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-text-muted text-sm font-medium">Retrieving user roster...</p>
          </div>
        ) : (
          <div className="bg-white border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-accent text-white text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold">User Details</th>
                    <th scope="col" className="px-6 py-4 font-bold">Registered Date</th>
                    <th scope="col" className="px-6 py-4 font-bold">Current Role</th>
                    <th scope="col" className="px-6 py-4 font-bold">Provider</th>
                    <th scope="col" className="px-6 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-text-muted bg-white">
                  {users.map((item) => {
                    const isSelf = item.id === user.id
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center font-bold text-primary border border-sky-100">
                              {item.name ? item.name[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-accent flex items-center gap-1.5">
                                {item.name || 'Anonymous User'}
                                {isSelf && (
                                  <span className="text-[10px] font-medium bg-sky-50 text-primary border border-sky-200 rounded px-1.5">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-text-muted mt-0.5">{item.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-text-muted">
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            item.role === 'admin'
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : item.role === 'recruiter'
                              ? 'bg-blue-50 border-blue-200 text-blue-800'
                              : 'bg-slate-50 border-slate-200 text-text-muted'
                          }`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            JWT Auth
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          <div className="flex items-center justify-end gap-3">
                            <select
                              value={item.role}
                              disabled={isSelf || actionLoading === item.id}
                              onChange={(e) => handleRoleChange(item.id, e.target.value)}
                              className="bg-slate-50 text-text-muted border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-sky-200 transition text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="candidate">Candidate</option>
                              <option value="recruiter">Recruiter</option>
                              <option value="admin">Admin</option>
                            </select>

                            <button
                              onClick={() => handleDeleteUser(item.id)}
                              disabled={isSelf || actionLoading === item.id}
                              className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete account"
                            >
                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-xs text-text-muted">
                  Page <span className="font-semibold text-accent">{page}</span> of <span className="font-semibold text-accent">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-text-muted hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-text-muted hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard