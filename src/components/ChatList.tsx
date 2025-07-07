import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import type { User } from '../hooks/useUsers'

interface ChatListProps {
  users: User[]
  selectedUserId: string
  onUserSelect: (userId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  loading: boolean
  onlineCount: number
  messageCount: number
}

const ChatList = ({
  users,
  selectedUserId,
  onUserSelect,
  searchQuery,
  onSearchChange,
  loading,
  onlineCount,
  messageCount,
}: ChatListProps) => {
  const chatListRef = useRef<HTMLDivElement>(null)

  // Animate chat list on load
  useEffect(() => {
    if (chatListRef.current && users.length > 0) {
      gsap.fromTo(
        chatListRef.current.children,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05 }
      )
    }
  }, [users])

  const getLastSeenText = (status: string) => {
    return status === 'online' ? 'Now' : 'Yesterday'
  }

  return (
    <div
      className={`${
        selectedUserId ? 'hidden md:flex' : 'flex'
      } w-full md:w-96 bg-white/10 backdrop-blur-md rounded-2xl flex-col`}
    >
      {/* Search Header */}
      <div className="p-4 border-b border-white/20">
        <div className="relative">
          <input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-full bg-white/10 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Search conversations"
          />
          <i
            className="fas fa-search absolute left-4 top-3.5 text-white/60"
            aria-hidden="true"
          ></i>
        </div>
      </div>

      {/* User List */}
      <div ref={chatListRef} className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-center text-white/60 py-8">
            <i
              className="fas fa-spinner fa-spin text-2xl"
              aria-hidden="true"
            ></i>
            <span className="sr-only">Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-white/60 py-8">
            <i className="fas fa-users text-3xl mb-2" aria-hidden="true"></i>
            <p>No family members found</p>
          </div>
        ) : (
          users.map((familyMember) => (
            <button
              key={familyMember.user_id}
              onClick={() => onUserSelect(familyMember.user_id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-2 ${
                selectedUserId === familyMember.user_id
                  ? 'bg-white/20 shadow-lg'
                  : 'hover:bg-white/10'
              }`}
              aria-label={`Chat with ${familyMember.display_name}`}
              aria-pressed={selectedUserId === familyMember.user_id}
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                  {familyMember.display_name.charAt(0).toUpperCase()}
                </div>
                {familyMember.status === 'online' && (
                  <div
                    className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                    aria-label="Online"
                  ></div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-semibold text-white truncate">
                  {familyMember.display_name}
                </h3>
                <p className="text-sm text-white/60 truncate">
                  Click to start chatting
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60">
                  {getLastSeenText(familyMember.status)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Bottom Stats */}
      <div className="p-4 border-t border-white/20">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-white">{onlineCount}</p>
            <p className="text-xs text-white/60">Online</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{messageCount}</p>
            <p className="text-xs text-white/60">Messages</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-xs text-white/60">Media</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatList
