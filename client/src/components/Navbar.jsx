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
    <nav className="w-full bg-[#FAFAF8] border-b border-stone-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-[#1a1a1a] text-lg font-semibold tracking-tight">
        smart<span className="font-serif italic text-amber-700">hire</span>
      </Link>

      <div className="flex items-center gap-8">
        <Link to="/" className="text-stone-500 hover:text-stone-800 text-sm transition">Home</Link>
        <Link to="/history" className="text-stone-500 hover:text-stone-800 text-sm transition">History</Link>
        <Link to="/jobs" className="font-serif italic text-amber-700">
          Find Jobs
         </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-stone-500 text-sm">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="border border-stone-300 hover:border-stone-500 text-stone-600 text-sm px-5 py-2.5 rounded-full transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-[#1a1a1a] hover:bg-stone-800 text-white text-sm px-5 py-2.5 rounded-full transition"
          >
            Get Started
          </Link>
        )}
        
      </div>
    </nav>
  )
}

export default Navbar