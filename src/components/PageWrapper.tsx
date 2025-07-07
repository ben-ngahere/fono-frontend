import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import FloatingMenu from './FloatingMenu'

interface PageWrapperProps {
  children: React.ReactNode
  title?: string
}

const PageWrapper = ({ children, title }: PageWrapperProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth0()

  return (
    <div className="dashboard-container min-h-screen p-4">
      {/* Floating Menu */}
      <FloatingMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Header Bar */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="bg-white/10 backdrop-blur-md p-3 rounded-xl hover:bg-white/20 transition text-white"
        >
          <i className="fas fa-home text-xl"></i>
        </button>

        {title && <h1 className="text-2xl font-bold text-white">{title}</h1>}

        <div className="flex gap-2">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="bg-white/10 backdrop-blur-md p-3 rounded-xl hover:bg-white/20 transition text-white"
            data-menu-button
          >
            <i className="fas fa-bars text-xl"></i>
          </button>

          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
            className="bg-white/10 backdrop-blur-md p-3 rounded-xl hover:bg-red-500/20 transition text-white group"
            title="Logout"
          >
            <i className="fas fa-sign-out-alt text-xl group-hover:text-red-300"></i>
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">{children}</div>
    </div>
  )
}

export default PageWrapper
