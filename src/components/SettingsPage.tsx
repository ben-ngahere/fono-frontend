import { useState, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useUsers } from '../hooks/useUsers'

const SettingsPage = () => {
  const { user } = useAuth0()
  const { currentUserProfile, updateProfile } = useUsers()
  const [displayName, setDisplayName] = useState(
    currentUserProfile?.display_name || ''
  )
  const [statusMessage, setStatusMessage] = useState(
    currentUserProfile?.status_message || ''
  )
  const [isLoading, setIsLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSaveMessage('')

    try {
      await updateProfile({
        display_name: displayName,
        status_message: statusMessage,
        avatar_url: previewImage || currentUserProfile?.avatar_url,
      })

      setSaveMessage('Profile updated successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch {
      setSaveMessage('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In production, you'd upload to a server/storage
      // For now, we'll use a data URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const settingsCards = [
    {
      icon: 'fas fa-user-circle',
      title: 'Profile Settings',
      description: 'Update your display name and avatar',
    },
    {
      icon: 'fas fa-palette',
      title: 'Dashboard Layout',
      description: 'Customize your dashboard widgets',
      comingSoon: true,
    },
    {
      icon: 'fas fa-bell',
      title: 'Notifications',
      description: 'Manage notification preferences',
      comingSoon: true,
    },
    {
      icon: 'fas fa-lock',
      title: 'Privacy & Security',
      description: 'Manage your privacy settings',
      comingSoon: true,
    },
    {
      icon: 'fas fa-database',
      title: 'Data & Storage',
      description: 'View storage usage and manage data',
      comingSoon: true,
    },
    {
      icon: 'fas fa-info-circle',
      title: 'About FONO',
      description: 'Version info and credits',
      comingSoon: true,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Settings Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/60">Manage your FONO experience</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <i className="fas fa-user-circle mr-3"></i>
          Profile Settings
        </h2>

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                {previewImage ||
                currentUserProfile?.avatar_url ||
                user?.picture ? (
                  <img
                    src={
                      previewImage ||
                      currentUserProfile?.avatar_url ||
                      user?.picture
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold">
                    {(
                      displayName ||
                      currentUserProfile?.display_name ||
                      user?.name ||
                      'U'
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition group-hover:scale-110"
                >
                  <i className="fas fa-camera"></i>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <p className="text-white/60 text-sm mt-2">
                Click to change avatar
              </p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-white mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={
                    currentUserProfile?.display_name || 'Enter your name'
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Status Message</label>
                <input
                  type="text"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <p className="text-white/40 text-sm mt-1">
                  {statusMessage.length}/100 characters
                </p>
              </div>

              <div>
                <label className="block text-white mb-2">Email</label>
                <input
                  type="email"
                  value={currentUserProfile?.email || user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-white/5 text-white/60 cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>

                {saveMessage && (
                  <p
                    className={`text-sm ${
                      saveMessage.includes('success')
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {saveMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsCards.map((card, index) => (
          <div
            key={index}
            className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition cursor-pointer ${
              card.comingSoon ? 'opacity-60' : ''
            }`}
          >
            <i className={`${card.icon} text-3xl text-white mb-4`}></i>
            <h3 className="text-lg font-semibold text-white mb-2">
              {card.title}
            </h3>
            <p className="text-white/60 text-sm">{card.description}</p>
            {card.comingSoon && (
              <div className="mt-3">
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white/80">
                  Coming Soon
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Account Actions */}
      <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Account Actions
        </h3>
        <div className="space-y-3">
          <button className="w-full md:w-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition">
            <i className="fas fa-download mr-2"></i>
            Export My Data
          </button>
          <button className="w-full md:w-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition ml-0 md:ml-3">
            <i className="fas fa-trash mr-2"></i>
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
