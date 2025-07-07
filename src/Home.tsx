import { useState, useMemo } from 'react'
import { useChatApi } from './hooks/useChatApi'
import { useUsers } from './hooks/useUsers'
import { useAuth0 } from '@auth0/auth0-react'
import ChatList from './components/ChatList'
import ChatMessages from './components/ChatMessages'
import MessageInput from './components/MessageInput'
import type { User } from './hooks/useUsers'
import type { FormEvent } from 'react'

const Home = () => {
  const { user } = useAuth0()
  const { otherUsers, loading: usersLoading } = useUsers()
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [currentMessage, setCurrentMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserInfo, setShowUserInfo] = useState(false)

  const {
    messages,
    loading: messagesLoading,
    error,
    sendMessage,
  } = useChatApi(selectedUserId)

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId)
    setCurrentMessage('')
    setShowUserInfo(false)
  }

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentMessage.trim() || !selectedUserId) return

    try {
      await sendMessage({
        receiverId: selectedUserId,
        content: currentMessage,
      })
      setCurrentMessage('')
    } catch (err) {
      console.error('Failed to send message:', err)
      // In production, show user-friendly error notification
    }
  }

  // Filtered users based on search
  const filteredUsers = useMemo(() => {
    return otherUsers.filter((user) =>
      user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [otherUsers, searchQuery])

  // Selected user details
  const selectedUser = useMemo(
    () => otherUsers.find((u) => u.user_id === selectedUserId),
    [otherUsers, selectedUserId]
  )

  // Online users count
  const onlineCount = useMemo(
    () => otherUsers.filter((u) => u.status === 'online').length,
    [otherUsers]
  )

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Chat List */}
      <ChatList
        users={filteredUsers}
        selectedUserId={selectedUserId}
        onUserSelect={handleUserSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        loading={usersLoading}
        onlineCount={onlineCount}
        messageCount={messages.length}
      />

      {/* Chat Area */}
      {selectedUserId && selectedUser ? (
        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl flex flex-col">
          {/* Chat Header */}
          <ChatHeader
            selectedUser={selectedUser}
            onBackClick={() => setSelectedUserId('')}
            onInfoClick={() => setShowUserInfo(!showUserInfo)}
          />

          {/* Messages */}
          <ChatMessages
            messages={messages}
            currentUserId={user?.sub}
            selectedUser={selectedUser}
            loading={messagesLoading}
            error={error}
          />

          {/* Input */}
          <MessageInput
            value={currentMessage}
            onChange={setCurrentMessage}
            onSubmit={handleSendMessage}
            disabled={!selectedUserId}
          />
        </div>
      ) : (
        /* No Chat Selected */
        <div className="hidden md:flex flex-1 bg-white/10 backdrop-blur-md rounded-2xl items-center justify-center">
          <div className="text-center text-white/60">
            <i className="fas fa-comments text-6xl mb-4" aria-hidden="true"></i>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Welcome to Family Chat
            </h2>
            <p>Select a conversation to start messaging</p>
          </div>
        </div>
      )}

      {/* User Info Sidebar */}
      {showUserInfo && selectedUser && (
        <UserInfoSidebar
          user={selectedUser}
          onClose={() => setShowUserInfo(false)}
        />
      )}
    </div>
  )
}

// Chat Header Component
interface ChatHeaderProps {
  selectedUser: User
  onBackClick: () => void
  onInfoClick: () => void
}

const ChatHeader = ({
  selectedUser,
  onBackClick,
  onInfoClick,
}: ChatHeaderProps) => (
  <div className="bg-white/5 backdrop-blur-md p-4 rounded-t-2xl border-b border-white/20 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <button
        onClick={onBackClick}
        className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg"
        aria-label="Back to chat list"
      >
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
      </button>
      <button
        className="flex items-center gap-3"
        onClick={onInfoClick}
        aria-label="View user info"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
          {selectedUser.display_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-white">
            {selectedUser.display_name}
          </h3>
          <p className="text-sm text-white/60">
            {selectedUser.status === 'online' ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Active now
              </span>
            ) : (
              'Offline'
            )}
          </p>
        </div>
      </button>
    </div>

    <div className="flex items-center gap-2">
      <button
        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
        aria-label="Voice call"
      >
        <i className="fas fa-phone text-xl" aria-hidden="true"></i>
      </button>
      <button
        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
        aria-label="Video call"
      >
        <i className="fas fa-video text-xl" aria-hidden="true"></i>
      </button>
      <button
        onClick={onInfoClick}
        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
        aria-label="Chat info"
      >
        <i className="fas fa-info-circle text-xl" aria-hidden="true"></i>
      </button>
    </div>
  </div>
)

// User Info Sidebar Component
interface UserInfoSidebarProps {
  user: User
  onClose: () => void
}

const UserInfoSidebar = ({ user }: UserInfoSidebarProps) => (
  <div className="w-80 bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-6">
    <div className="text-center">
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.display_name}
          className="w-24 h-24 mx-auto rounded-full mb-4"
        />
      ) : (
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold mb-4">
          {user.display_name.charAt(0).toUpperCase()}
        </div>
      )}
      <h3 className="text-xl font-semibold text-white">{user.display_name}</h3>
      <p className="text-white/60">Family Member</p>
    </div>

    <div className="space-y-4">
      <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition">
        <i className="fas fa-image mr-2" aria-hidden="true"></i> View Shared
        Media
      </button>
      <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition">
        <i className="fas fa-bell mr-2" aria-hidden="true"></i> Mute
        Notifications
      </button>
      <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition">
        <i className="fas fa-search mr-2" aria-hidden="true"></i> Search in
        Conversation
      </button>
    </div>
  </div>
)

export default Home
