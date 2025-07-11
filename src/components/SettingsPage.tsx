// File: src/pages/SettingsPage.tsx
import { ProfileSettings } from '../components/settings/ProfileSettings'
import { NotificationSettings } from '../components/settings/NotificationSettings'
import { SettingsGrid } from '../components/settings/SettingsGrid'
import { AccountActions } from '../components/settings/AccountActions'

const SettingsPage = () => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/60">Manage your FONO experience</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile Settings */}
        <ProfileSettings />

        {/* Notification Settings */}
        <NotificationSettings />

        {/* Other Settings Grid */}
        <SettingsGrid />

        {/* Account Actions */}
        <AccountActions />
      </div>
    </div>
  )
}

export default SettingsPage
