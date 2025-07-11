// File: src/components/settings/SettingsGrid.tsx
interface SettingsCard {
  icon: string
  title: string
  description: string
  comingSoon?: boolean
  onClick?: () => void
}

export const SettingsGrid = () => {
  const settingsCards: SettingsCard[] = [
    {
      icon: 'fas fa-palette',
      title: 'Dashboard Layout',
      description: 'Customize your dashboard widgets',
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {settingsCards.map((card, index) => (
        <div
          key={index}
          onClick={card.onClick}
          className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition ${
            card.comingSoon ? 'opacity-60 cursor-default' : 'cursor-pointer'
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
  )
}
