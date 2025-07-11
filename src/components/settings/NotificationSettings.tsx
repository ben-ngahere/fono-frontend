import { useNotifications } from '../../hooks/useNotifications'

export const NotificationSettings = () => {
  const {
    permission,
    isSupported,
    isEnabled,
    requestPermission,
    setIsEnabled,
    showMessageNotification,
  } = useNotifications()

  const handleEnableNotifications = async () => {
    if (permission === 'default') {
      const result = await requestPermission()
      if (result === 'granted') {
        setIsEnabled(true)
        showMessageNotification('FONO', 'Notifications are now enabled! 🎉')
      }
    } else if (permission === 'granted') {
      setIsEnabled(true)
      showMessageNotification('FONO', 'Notifications are now enabled! 🎉')
    }
  }

  const handleDisableNotifications = () => {
    setIsEnabled(false)
  }

  const testNotification = () => {
    showMessageNotification(
      'Test User',
      'This is a test notification to show how messages will appear.'
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
        <i className="fas fa-bell mr-3"></i>
        Notification Settings
      </h2>

      {!isSupported ? (
        <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-amber-400 mr-3"></i>
            <div>
              <h3 className="font-semibold text-amber-400 mb-1">
                Not Supported
              </h3>
              <p className="text-amber-300 text-sm">
                Your browser doesn't support desktop notifications. Try using
                Chrome, Firefox, or Safari.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center">
              <i className="fas fa-desktop text-white/60 mr-4 text-xl"></i>
              <div>
                <h3 className="text-white font-medium">
                  Desktop Notifications
                </h3>
                <p className="text-white/60 text-sm">
                  Get notified of new messages when away
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Status Badge */}
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  permission === 'granted'
                    ? 'bg-green-500/20 text-green-400'
                    : permission === 'denied'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {permission === 'granted'
                  ? 'Allowed'
                  : permission === 'denied'
                  ? 'Blocked'
                  : 'Not Set'}
              </span>

              {/* Toggle Switch */}
              {permission === 'granted' && (
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) =>
                      e.target.checked
                        ? handleEnableNotifications()
                        : handleDisableNotifications()
                    }
                    className="sr-only"
                  />
                  <div
                    className={`relative w-11 h-6 transition-colors duration-200 ease-in-out rounded-full ${
                      isEnabled ? 'bg-purple-600' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {permission === 'default' && (
              <button
                onClick={handleEnableNotifications}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition flex items-center"
              >
                <i className="fas fa-bell mr-2"></i>
                Enable Notifications
              </button>
            )}

            {permission === 'granted' && isEnabled && (
              <button
                onClick={testNotification}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition flex items-center"
              >
                <i className="fas fa-vial mr-2"></i>
                Test Notification
              </button>
            )}
          </div>

          {/* Help Text */}
          {permission === 'denied' && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <div className="flex items-start">
                <i className="fas fa-info-circle text-red-400 mr-3 mt-1"></i>
                <div>
                  <h3 className="font-semibold text-red-400 mb-2">
                    Notifications Blocked
                  </h3>
                  <p className="text-red-300 text-sm mb-3">
                    To enable notifications:
                  </p>
                  <ol className="text-red-300 text-sm space-y-1 ml-4">
                    <li>
                      1. Click the 🔒 lock icon in your browser's address bar
                    </li>
                    <li>2. Set Notifications to "Allow"</li>
                    <li>3. Refresh this page</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
