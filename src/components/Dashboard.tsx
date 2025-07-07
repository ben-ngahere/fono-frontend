import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useUsers } from '../hooks/useUsers'
import FloatingMenu from './FloatingMenu'

const Dashboard = () => {
  const { user } = useAuth0()
  const { otherUsers, currentUserProfile } = useUsers()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const hour = currentTime.getHours()
    if (hour < 12) setGreeting('Morena')
    else if (hour < 17) setGreeting('Kia ora')
    else setGreeting('Good evening')
  }, [currentTime])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="dashboard-container">
      <div className="min-h-screen p-4">
        {/* Floating Menu */}
        <FloatingMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
        {/* Top Bar */}
        <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
          {/* Weather Widget - Transparent */}
          <div className="text-white p-6 rounded-2xl backdrop-blur-md bg-white/10 w-80 relative">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg opacity-90">Auckland</h3>
                  <p className="text-4xl font-bold">23°C</p>
                  <p className="text-sm opacity-80">Partly Cloudy</p>
                </div>
                <div className="text-6xl opacity-80">
                  <i className="fas fa-cloud-sun"></i>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <i className="fas fa-arrow-up"></i> 25°
                </div>
                <div>
                  <i className="fas fa-arrow-down"></i> 18°
                </div>
                <div>
                  <i className="fas fa-tint"></i> 45%
                </div>
                <div>
                  <i className="fas fa-wind"></i> 12km/h
                </div>
              </div>
            </div>
          </div>

          {/* Family Title */}
          <div className="bg-white/95 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl">
            <h1 className="text-3xl font-bold text-gray-800 text-center">
              <i className="fas fa-home text-purple-600 mr-2"></i>
              {greeting},{' '}
              {currentUserProfile?.display_name || user?.name || 'Whānau'}!
            </h1>
            <p className="text-center text-gray-600 text-sm mt-1">
              {formatDate(currentTime)}
            </p>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="bg-white/95 backdrop-blur-md p-3 rounded-xl hover:bg-white transition shadow-lg group"
            data-menu-button
          >
            <i className="fas fa-bars text-purple-600 text-xl group-hover:scale-110 transition-transform"></i>
          </button>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Calendar */}
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentTime.toLocaleDateString('en-NZ', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <i className="fas fa-chevron-left text-gray-600"></i>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <i className="fas fa-chevron-right text-gray-600"></i>
                  </button>
                </div>
              </div>

              {/* Simple Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-sm font-semibold text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}
                {/* Calendar days - simplified for now */}
                {Array.from({ length: 35 }, (_, i) => (
                  <div
                    key={i}
                    className={`
                    p-3 rounded-lg text-center cursor-pointer transition-all
                    ${
                      i === currentTime.getDate() + 2
                        ? 'bg-purple-100 border-2 border-purple-400 font-bold text-purple-700'
                        : 'bg-white hover:bg-purple-50'
                    }
                  `}
                  >
                    {i > 2 && i < 33 ? i - 2 : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  This Month
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      <i className="fas fa-image mr-2"></i>Photos Shared
                    </span>
                    <span className="font-bold text-purple-600">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      <i className="fas fa-message mr-2"></i>Messages
                    </span>
                    <span className="font-bold text-purple-600">0</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  <i className="fas fa-camera-retro mr-2"></i>Random Memory
                </h3>
                <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center">
                  <p className="text-gray-500">Photos coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            {/* Activity Feed */}
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-bell mr-2 text-purple-600"></i>
                Activity Feed
              </h3>
              <div className="text-center text-gray-500 py-8">
                <i className="fas fa-inbox text-4xl mb-2"></i>
                <p>No new activity</p>
              </div>
            </div>

            {/* Family Presence */}
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                <i className="fas fa-users mr-2 text-purple-600"></i>
                Family Online
              </h3>
              <div className="space-y-3">
                {otherUsers.map((member) => (
                  <div key={member.user_id} className="flex items-center gap-3">
                    <div className="relative">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.display_name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white text-sm">
                            {member.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          member.status === 'online'
                            ? 'bg-green-500'
                            : 'bg-gray-400'
                        }`}
                      ></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {member.display_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {member.status === 'online' ? 'Active now' : 'Offline'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
