import { useState, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useUsers } from '../../hooks/useUsers'

export const ProfileSettings = () => {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
        <i className="fas fa-user-circle mr-3"></i>
        Profile Settings
      </h2>

      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Picture */}
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

            <p className="text-white/60 text-sm mt-2">Click to change avatar</p>
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
  )
}
