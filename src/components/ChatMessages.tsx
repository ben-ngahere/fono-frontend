import { useEffect, useRef, useState } from 'react'
import type { User } from '../hooks/useUsers'
import { formatTime } from '../utils/dateHelpers'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  messageType: string
  createdAt: string
  readStatus: boolean
}

interface ChatMessagesProps {
  messages: Message[]
  currentUserId?: string
  selectedUser: User | undefined
  users: User[]
  loading: boolean
  error?: Error | null
  onDeleteMessage?: (messageId: string) => void
}

const ChatMessages = ({
  messages,
  currentUserId,
  selectedUser,
  users,
  loading,
  error,
  onDeleteMessage,
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  )
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Helper function to get display name for any user
  const getUserDisplayName = (userId: string): string => {
    if (userId === currentUserId) {
      return 'You'
    }

    const user = users.find((u) => u.user_id === userId)
    return user?.display_name || 'User'
  }

  // Handle long press for mobile
  const handleTouchStart = (messageId: string, isSentByMe: boolean) => {
    if (!isSentByMe) return

    longPressTimer.current = setTimeout(() => {
      setSelectedMessageId(messageId)
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleDeleteClick = (messageId: string) => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId)
    }
    setSelectedMessageId(null)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setSelectedMessageId(null)
    if (selectedMessageId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [selectedMessageId])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/60">
          <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
          Loading messages...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-red-400">
          <i className="fas fa-exclamation-circle mr-2" aria-hidden="true"></i>
          Error loading messages: {error.message}
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/60 py-12">
          <i className="fas fa-comments text-5xl mb-4" aria-hidden="true"></i>
          <p className="text-lg">No messages yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="space-y-4">
        {messages.map((msg, index) => {
          const isSentByMe = msg.senderId === currentUserId
          const previousMessage = index > 0 ? messages[index - 1] : null
          const isFirstInGroup =
            !previousMessage || previousMessage.senderId !== msg.senderId
          const showName = !isSentByMe && isFirstInGroup

          console.log('Message debug:')
          console.log('  messageId:', msg.id)
          console.log('  senderId:', msg.senderId)
          console.log('  currentUserId:', currentUserId)
          console.log('  isSentByMe:', isSentByMe)
          console.log('  content:', msg.content.substring(0, 20) + '...')
          console.log('  onDeleteMessage exists:', !!onDeleteMessage)
          console.log('  ---')

          return (
            <div key={msg.id} className={`${isFirstInGroup ? 'mt-4' : 'mt-1'}`}>
              {showName && (
                <p className="text-xs text-white/60 mb-1 ml-10">
                  {getUserDisplayName(msg.senderId)}
                </p>
              )}
              <div
                className={`flex items-end gap-2 ${
                  isSentByMe ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Avatar for received messages */}
                {!isSentByMe &&
                  (isFirstInGroup ? (
                    selectedUser?.avatar_url ? (
                      <img
                        src={selectedUser.avatar_url}
                        alt={selectedUser.display_name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                        {selectedUser?.display_name?.charAt(0).toUpperCase() ||
                          '?'}
                      </div>
                    )
                  ) : (
                    <div className="w-8" />
                  ))}

                <div
                  className={`group flex flex-col ${
                    isSentByMe ? 'items-end' : 'items-start'
                  } max-w-[70%]`}
                >
                  <div
                    className="relative"
                    onTouchStart={() => handleTouchStart(msg.id, isSentByMe)}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div
                      className={`px-4 py-2 ${
                        isSentByMe
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl rounded-br-md'
                          : 'bg-white/20 backdrop-blur-md text-white rounded-2xl rounded-bl-md'
                      }`}
                    >
                      <p className="break-words">{msg.content}</p>
                    </div>

                    {/* Delete button: desktop hover */}
                    {isSentByMe && onDeleteMessage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedMessageId(msg.id)
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg flex items-center justify-center"
                        aria-label="Delete message"
                      >
                        <i
                          className="fas fa-trash text-xs"
                          aria-hidden="true"
                        ></i>
                      </button>
                    )}

                    {/* Menu: selected message */}
                    {selectedMessageId === msg.id && (
                      <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                        <button
                          onClick={() => handleDeleteClick(msg.id)}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <i
                            className="fas fa-trash text-sm"
                            aria-hidden="true"
                          ></i>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white/40">
                      {formatTime(msg.createdAt)}
                    </p>
                    {isSentByMe && (
                      <i
                        className="fas fa-check-double text-xs text-white/40"
                        aria-hidden="true"
                      ></i>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatMessages
