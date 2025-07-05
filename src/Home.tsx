import { useState, useEffect, useRef } from 'react'
import Pusher from 'pusher-js'
import { useChatApi } from './hooks/useChatApi'
import { useAuth0 } from '@auth0/auth0-react'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  messageType: string
  createdAt: string
  readStatus: boolean
}

const Home = () => {
  // States to hold real-time messages
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true)

  const { sendMessage, getChatHistory, isAuthenticated } = useChatApi()
  const { getAccessTokenSilently, user } = useAuth0()

  const pusherRef = useRef<Pusher | null>(null)
  const channelRef = useRef<ReturnType<Pusher['subscribe']> | null>(null)

  // useEffect for Pusher Init + Get History
  useEffect(() => {
    let chatPartnerId: string | null = null
    if (user?.sub) {
      if (user.sub === 'google-oauth2|102141106120855017585') {
        chatPartnerId = 'github|204113180'
      } else if (user.sub === 'github|204113180') {
        chatPartnerId = 'google-oauth2|102141106120855017585'
      } else {
        chatPartnerId = user.sub
      }
    }

    const setupChat = async () => {
      if (!isAuthenticated || !user?.sub || !chatPartnerId) {
        if (!isAuthenticated || !user?.sub) {
          console.log(
            'Not authenticated or user ID missing. Chat features not initialised.'
          )
        } else if (!chatPartnerId) {
          console.log(
            'Chat partner ID could not be determined. Chat history not loaded.'
          )
        }
        setIsLoadingHistory(false)
        return
      }

      // Get chat history
      if (isLoadingHistory) {
        try {
          console.log('Fetching chat history...')
          const history = await getChatHistory(chatPartnerId)
          history.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          setRealtimeMessages(history)
          console.log('Chat history loaded:', history)
        } catch (error) {
          console.error('Failed to load chat history:', error)
        } finally {
          setIsLoadingHistory(false)
        }
      }

      // Pusher init
      if (pusherRef.current) {
        console.log('Pusher already initialised, skipping re-initialisation')
        return
      }

      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        })

        pusherRef.current = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
          cluster: import.meta.env.VITE_PUSHER_CLUSTER,
          channelAuthorization: {
            endpoint: 'http://localhost:3000/v1/pusher/auth',
            transport: 'ajax',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        })

        const sanitizedUserSub = user.sub
          .replace(/\|/g, '_')
          .replace(/\./g, '-')
        const privateChannelName = `private-chat-${sanitizedUserSub}`

        channelRef.current = pusherRef.current.subscribe(privateChannelName)

        // History + real-time
        channelRef.current.bind('new-message', (data: Message) => {
          console.log('New message received via private Pusher channel:', data)
          setRealtimeMessages((prevMessages) => [...prevMessages, data])
        })

        channelRef.current.bind('pusher:subscription_succeeded', () => {
          console.log(
            `Successfully subscribed to private channel: ${privateChannelName}`
          )
        })

        channelRef.current.bind(
          'pusher:subscription_error',
          (status: number) => {
            console.error(
              `Pusher subscription error on ${privateChannelName}:`,
              status
            )
            if (status === 403) {
              alert(
                'Access denied to private chat channel. Please ensure you are logged in'
              )
            }
          }
        )
        console.log('Pusher client setup complete')
      } catch (error) {
        console.error('Error setting up Pusher:', error)
      }
    }

    setupChat()

    // Cleanup function
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind('new-message')
        const sanitizedUserSub = user?.sub
          ?.replace(/\|/g, '_')
          .replace(/\./g, '-')
        if (sanitizedUserSub) {
          pusherRef.current?.unsubscribe(`private-chat-${sanitizedUserSub}`)
        }
        channelRef.current = null
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect()
        pusherRef.current = null
      }
      console.log('Pusher client cleanup complete')
    }
  }, [
    isAuthenticated,
    user?.sub,
    getAccessTokenSilently,
    getChatHistory,
    isLoadingHistory,
  ])

  // Handle message sending
  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!currentMessage.trim()) {
      return
    }

    if (!isAuthenticated || !user?.sub) {
      alert('Please log in to send messages')
      return
    }

    let targetReceiverId = ''
    if (user.sub === 'google-oauth2|102141106120855017585') {
      targetReceiverId = 'github|204113180'
    } else if (user.sub === 'github|204113180') {
      targetReceiverId = 'google-oauth2|102141106120855017585'
    } else {
      console.warn('Unknown user, sending message to self for now')
      targetReceiverId = user.sub
    }

    try {
      const sentMessage = await sendMessage({
        receiverId: targetReceiverId,
        content: currentMessage,
      })
      setRealtimeMessages((prevMessages) => [
        ...prevMessages,
        {
          id: sentMessage.id,
          senderId: sentMessage.sender_id || user.sub,
          receiverId: sentMessage.receiver_id || targetReceiverId,
          content: currentMessage,
          messageType: sentMessage.message_type || 'text',
          createdAt: sentMessage.created_at || new Date().toISOString(),
          readStatus: sentMessage.read_status || false,
        },
      ])
      setCurrentMessage('')
      console.log('Message sent successfully!')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again')
    }
  }

  // Helper to format date
  const formatMessageTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <section className="min-h-screen bg-yellow-400 flex items-center justify-center">
      <div className="container mx-auto text-center p-4">
        {/* Heading */}
        <h1 className="text-6xl font-extrabold text-white mb-8">fono</h1>
        <div className="bg-white bg-opacity-85 p-8 rounded-lg shadow-lg max-w-sm mx-auto">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">welcome</h2>

          {/* Conditional rendering for chat elements */}
          {isAuthenticated ? (
            <>
              {/* Real-time Messages Display */}
              <div className="mt-5 text-left max-h-56 overflow-y-auto border-t border-gray-300 pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Chat History & Real-time:
                </h3>
                {isLoadingHistory ? (
                  <p className="text-gray-500">Loading chat history...</p>
                ) : realtimeMessages.length === 0 ? (
                  <p className="text-gray-500">No messages yet...</p>
                ) : (
                  <ul>
                    {realtimeMessages.map((msg, index) => (
                      <li
                        key={msg.id || index}
                        className={`mb-1 ${
                          msg.senderId === user?.sub
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-block p-2 rounded-lg ${
                            msg.senderId === user?.sub
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                          style={{ maxWidth: '80%' }}
                        >
                          <strong>
                            {msg.senderId === user?.sub ? 'You' : msg.senderId}:
                          </strong>{' '}
                          {msg.content}
                          <div className="text-xs opacity-75 mt-1">
                            {formatMessageTime(msg.createdAt)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="mt-6 space-y-4">
                <div>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500"
                    type="text"
                    placeholder={
                      isAuthenticated
                        ? 'Type your message...'
                        : 'Please log in to chat'
                    }
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    disabled={!isAuthenticated}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-lg font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isAuthenticated || !currentMessage.trim()}
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </>
          ) : (
            // Message displayed when not logged in
            <p className="text-gray-500 mt-4">
              Please log in to start chatting.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default Home
