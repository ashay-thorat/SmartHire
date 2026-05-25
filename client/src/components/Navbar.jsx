import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="w-full bg-black border-b border-gray-800 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-yellow-400 text-lg font-bold tracking-tight">
        smart<span className="font-serif italic text-amber-700">hire</span>
      </Link>

      <div className="flex items-center gap-8">
        <Link to="/" className="text-yellow-400 hover:text-yellow-200 text-sm font-bold transition">Home</Link>
        {user && (
          <>
            <Link to="/dashboard" className="text-yellow-400 hover:text-yellow-200 text-sm font-bold transition">Dashboard</Link>
            <Link to="/history" className="text-yellow-400 hover:text-yellow-200 text-sm font-bold transition">History</Link>
            {(user.role === 'recruiter' || user.role === 'admin') && (
              <Link to="/recruiter" className="text-yellow-400 hover:text-yellow-200 text-sm font-bold transition">Recruiter Panel</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin" className="text-yellow-400 hover:text-yellow-200 text-sm font-bold transition">Admin</Link>
            )}
          </>
        )}
        <Link to="/jobs" className="font-serif italic text-yellow-400 hover:text-yellow-200 transition text-sm">
          Find Jobs
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-yellow-400 text-sm font-bold">Hi, {user.displayName || user.email?.split('@')[0]}</span>
            <button
              onClick={handleLogout}
              className="border border-yellow-500 hover:border-yellow-700 text-yellow-400 text-sm px-5 py-2.5 rounded-full transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-yellow-500 hover:bg-yellow-600 text-black text-sm px-5 py-2.5 rounded-full transition"
          >
            Get Started
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar