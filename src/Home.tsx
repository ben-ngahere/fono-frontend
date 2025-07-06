import { useState, useMemo, useRef, useEffect } from 'react'
import { useChatApi } from './hooks/useChatApi'
import { useUsers } from './hooks/useUsers'
import { useAuth0 } from '@auth0/auth0-react'

const Home = () => {
  const { user } = useAuth0()
  const { otherUsers, currentUserProfile, loading: usersLoading } = useUsers()
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [currentMessage, setCurrentMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    loading: messagesLoading,
    error,
    sendMessage,
  } = useChatApi(selectedUserId)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId)
    setCurrentMessage('')
  }

  // Handle message sending
  const handleSendMessage = async (event: React.FormEvent) => {
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
      alert('Failed to send message. Please try again')
    }
  }

  // Handle Enter key to send message
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage(event as any)
    }
  }

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    return otherUsers.filter((user) =>
      user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [otherUsers, searchQuery])

  // Get selected user info
  const selectedUser = useMemo(
    () => otherUsers.find((u) => u.user_id === selectedUserId),
    [otherUsers, selectedUserId]
  )

  // Format message time
  const formatMessageTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (error) {
      console.error('Error formatting date:', isoString)
      return 'Invalid date'
    }
  }

  // Get status color
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

  return (
    <>
      {/* Chat List */}
      <div className="w-full lg:w-80 bg-white/95 backdrop-blur-md lg:border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Family Chat
          </h2>
          <div className="relative">
            <input
              type="search"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {usersLoading ? (
            <div className="p-4 text-center text-gray-500">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Loading family members...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <i className="fas fa-users mb-2 text-2xl"></i>
              <p>No family members found</p>
            </div>
          ) : (
            filteredUsers.map((familyMember) => (
              <div
                key={familyMember.user_id}
                onClick={() => handleUserSelect(familyMember.user_id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                  selectedUserId === familyMember.user_id
                    ? 'bg-purple-50 border-l-4 border-purple-600'
                    : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    {familyMember.avatar_url ? (
                      <img
                        src={familyMember.avatar_url}
                        alt={familyMember.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {familyMember.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                        familyMember.status
                      )}`}
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="font-medium text-gray-800">
                      {familyMember.display_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {familyMember.status === 'online'
                        ? 'Active now'
                        : familyMember.status === 'away'
                        ? 'Away'
                        : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedUserId && selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white/95 backdrop-blur-md p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.display_name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedUser.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-800">
                    {selectedUser.display_name}
                  </h3>
                  <p className="text-sm text-green-600">
                    {selectedUser.status === 'online' && 'Active now'}
                    {selectedUser.status === 'away' && 'Away'}
                    {selectedUser.status === 'offline' && 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="More options"
                >
                  <i className="fas fa-ellipsis-v text-gray-600"></i>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading && (
                <div className="text-center text-gray-500">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Loading messages...
                </div>
              )}
              {error && (
                <div className="text-center text-red-500">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  Error: {error.message}
                </div>
              )}
              {!messagesLoading && !error && messages.length === 0 && (
                <div className="text-center text-gray-500">
                  <i className="fas fa-comments text-4xl mb-3"></i>
                  <p>No messages yet. Say kia ora! 👋</p>
                </div>
              )}

              {messages.map((msg) => {
                const isSentByMe = msg.senderId === user?.sub
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      isSentByMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isSentByMe &&
                      (selectedUser.avatar_url ? (
                        <img
                          src={selectedUser.avatar_url}
                          alt={selectedUser.display_name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white text-sm">
                            {selectedUser.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ))}
                    <div
                      className={`flex flex-col ${
                        isSentByMe ? 'items-end' : 'items-start'
                      } max-w-xs lg:max-w-md`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2 shadow-sm ${
                          isSentByMe
                            ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-br-none'
                            : 'bg-white text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-1">
                        {formatMessageTime(msg.createdAt)}
                      </p>
                    </div>
                    {isSentByMe &&
                      (currentUserProfile?.avatar_url ? (
                        <img
                          src={currentUserProfile.avatar_url}
                          alt={currentUserProfile.display_name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white text-sm">
                            {currentUserProfile?.display_name
                              ?.charAt(0)
                              .toUpperCase() || 'M'}
                          </span>
                        </div>
                      ))}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white/95 backdrop-blur-md p-4 border-t border-gray-200">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center space-x-2"
              >
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Attach file"
                >
                  <i className="fas fa-paperclip text-gray-600"></i>
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Send image"
                >
                  <i className="fas fa-image text-gray-600"></i>
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!currentMessage.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white/95 backdrop-blur-md m-4 rounded-lg shadow-lg">
            <div className="text-center">
              <i className="fas fa-comments text-6xl text-gray-300 mb-4"></i>
              <p className="text-xl mb-2 text-gray-700">
                Kia ora {currentUserProfile?.display_name}!
              </p>
              <p className="text-gray-500">
                Select a whānau member to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Home
