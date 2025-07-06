import type { User } from '../hooks/useUsers' // Type checking only

interface UserListProps {
  users: User[]
  onUserSelect: (userId: string) => void
  selectedUserId?: string
}

const UserList = ({ users, onUserSelect, selectedUserId }: UserListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getLastSeenText = (lastSeen: string) => {
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  if (users.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No other family members found
      </div>
    )
  }

  return (
    <div className="space-y-2 p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        Family Members
      </h3>
      {users.map((user) => (
        <button
          key={user.user_id}
          onClick={() => onUserSelect(user.user_id)}
          className={`w-full p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-100 transition-colors ${
            selectedUserId === user.user_id
              ? 'bg-blue-50 border-blue-300 border'
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Avatar */}
          <div className="relative">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xl font-semibold text-gray-600">
                  {user.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {/* Status */}
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                user.status
              )}`}
            />
          </div>

          {/* User info */}
          <div className="flex-1 text-left">
            <div className="font-semibold text-gray-800">
              {user.display_name}
            </div>
            <div className="text-sm text-gray-500">
              {user.status === 'online' ? (
                <span className="text-green-600">Active now</span>
              ) : user.status === 'away' ? (
                <span className="text-yellow-600">Away</span>
              ) : (
                <span>Last seen {getLastSeenText(user.last_seen)}</span>
              )}
            </div>
            {user.status_message && (
              <div className="text-xs text-gray-400 italic mt-1">
                {user.status_message}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

export default UserList
