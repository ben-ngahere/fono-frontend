import { useState, useMemo, useRef, useEffect } from 'react'
import { useChatApi } from './hooks/useChatApi'
import { useUsers } from './hooks/useUsers'
import { useAuth0 } from '@auth0/auth0-react'
import UserList from './components/UsersList'

const Home = () => {
  const { isAuthenticated, user } = useAuth0()
  const { otherUsers, currentUserProfile, loading: usersLoading } = useUsers()
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [currentMessage, setCurrentMessage] = useState('')
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
      console.log('Message sent successfully!')
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Failed to send message. Please try again')
    }
  }

  // Handle Enter key to send message
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      // Trigger form submission by calling the send logic directly
      if (currentMessage.trim() && selectedUserId) {
        sendMessage({
          receiverId: selectedUserId,
          content: currentMessage,
        })
          .then(() => {
            setCurrentMessage('')
            console.log('Message sent successfully!')
          })
          .catch((err) => {
            console.error('Failed to send message:', err)
            alert('Failed to send message. Please try again')
          })
      }
    }
  }

  // Memoized helper to format date
  const formatMessageTime = useMemo(() => {
    return (isoString: string) => {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }, [])

  // Memoized selected user info
  const selectedUser = useMemo(
    () => otherUsers.find((u) => u.user_id === selectedUserId),
    [otherUsers, selectedUserId]
  )

  return (
    <section className="min-h-screen bg-yellow-400 flex items-center justify-center">
      <div className="container mx-auto p-4">
        <h1 className="text-6xl font-extrabold text-white mb-8 text-center">
          fono
        </h1>

        {isAuthenticated ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {/* User List Column */}
            <div className="bg-white bg-opacity-90 rounded-lg shadow-lg">
              {usersLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading users...
                </div>
              ) : (
                <UserList
                  users={otherUsers}
                  onUserSelect={handleUserSelect}
                  selectedUserId={selectedUserId}
                />
              )}
            </div>

            {/* Chat Column */}
            <div className="md:col-span-2 bg-white bg-opacity-90 rounded-lg shadow-lg p-6">
              {selectedUserId ? (
                <>
                  {/* Chat Header */}
                  <div className="border-b border-gray-300 pb-3 mb-4">
                    <h3 className="text-xl font-semibold text-gray-700">
                      {selectedUser?.display_name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedUser?.status === 'online' && 'Active now'}
                      {selectedUser?.status === 'away' && 'Away'}
                      {selectedUser?.status === 'offline' && 'Offline'}
                    </p>
                  </div>

                  {/* Messages Area */}
                  <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded">
                    {messagesLoading && (
                      <p className="text-gray-500">Loading messages...</p>
                    )}
                    {error && (
                      <p className="text-red-500">Error: {error.message}</p>
                    )}
                    {!messagesLoading && !error && messages.length === 0 && (
                      <p className="text-gray-500 text-center">
                        No messages yet. Say hi! 👋
                      </p>
                    )}

                    <div className="space-y-2">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.senderId === user?.sub
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.senderId === user?.sub
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <p className="break-words">{msg.content}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {formatMessageTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="text"
                      placeholder="Type your message..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!currentMessage.trim()}
                    >
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="text-xl mb-2">
                      Welcome {currentUserProfile?.display_name}!
                    </p>
                    <p>Select a family member to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white bg-opacity-85 p-8 rounded-lg shadow-lg max-w-sm mx-auto text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Welcome to fono
            </h2>
            <p className="text-gray-500">
              Please log in to start chatting with your family.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default Home
