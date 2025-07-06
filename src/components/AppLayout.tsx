import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useLocation, Link } from 'react-router-dom'

interface AppLayoutProps {
  children: React.ReactNode
}

type NavItem = {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, logout } = useAuth0()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navItems: NavItem[] = [
    { id: 'chat', label: 'Chat', icon: 'fas fa-comments', path: '/' },
    { id: 'media', label: 'Media', icon: 'fas fa-photo-video', path: '/media' },
    {
      id: 'documents',
      label: 'Documents',
      icon: 'fas fa-folder',
      path: '/documents',
    },
    { id: 'stream', label: 'Stream', icon: 'fas fa-tv', path: '/stream' },
    { id: 'vault', label: 'Vault', icon: 'fas fa-shield-alt', path: '/vault' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-600 to-purple-800">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 backdrop-blur rounded-lg shadow-lg"
      >
        <i
          className={`fas ${
            isSidebarOpen ? 'fa-times' : 'fa-bars'
          } text-gray-700`}
        ></i>
      </button>

      {/* Sidebar */}
      <div
        className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white/95 backdrop-blur-md flex flex-col
        border-r border-white/20 shadow-xl lg:shadow-none
      `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200/50">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-home text-purple-600 mr-2"></i>
            fono
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                flex items-center p-3 rounded-lg transition-all duration-200
                ${
                  isActive(item.path)
                    ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-600 pl-2'
                    : 'hover:bg-gray-100 text-gray-700'
                }
              `}
            >
              <i className={`${item.icon} text-lg w-6`}></i>
              <span className="ml-3 font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-purple-600 text-white text-xs rounded-full px-2 py-1">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200/50">
          <div className="flex items-center">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-green-600">Online</p>
            </div>
            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt text-gray-600"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {children}
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AppLayout
