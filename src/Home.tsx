import { useState, useEffect, useRef } from 'react'
import Pusher from 'pusher-js'
import { useChatApi } from './hooks/useChatApi'
import { useAuth0 } from '@auth0/auth0-react'

interface Message {
  senderId: string
  content: string
}

const Home = () => {
  // States to hold real-time messages
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const { sendMessage, isAuthenticated } = useChatApi()
  const { getAccessTokenSilently, user } = useAuth0()

  // Use refs to store Pusher and channel instances across renders
  const pusherRef = useRef<Pusher | null>(null)
  const channelRef = useRef<ReturnType<Pusher['subscribe']> | null>(null)

  // Pusher init
  useEffect(() => {
    const setupPusher = async () => {
      if (pusherRef.current || !isAuthenticated || !user?.sub) {
        if (!isAuthenticated || !user?.sub) {
          console.log(
            'Not authenticated or user ID missing. Pusher not initialised'
          )
        } else if (pusherRef.current) {
          console.log('Pusher already initialised, skipping re-initialisation')
        }
        return
      }

      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        })

        // Initialize Pusher + store in ref
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

        // Subscribe to channel and store in ref
        channelRef.current = pusherRef.current.subscribe(privateChannelName)

        // Bind event listeners
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

    setupPusher()

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
        channelRef.current = null // Clear the ref
      }
      if (pusherRef.current) {
        // Disconnect the Pusher instance
        pusherRef.current.disconnect()
        pusherRef.current = null
      }
      console.log('Pusher client cleanup complete')
    }
  }, [isAuthenticated, user?.sub, getAccessTokenSilently])

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

    try {
      let targetReceiverId = ''

      if (user.sub === 'google-oauth2|102141106120855017585') {
        targetReceiverId = 'github|204113180'
      } else if (user.sub === 'github|204113180') {
        targetReceiverId = 'google-oauth2|102141106120855017585'
      } else {
        console.warn('Unknown user, sending message to self for now')
        targetReceiverId = user.sub
      }

      await sendMessage({
        receiverId: targetReceiverId,
        content: currentMessage,
      })
      setCurrentMessage('')
      console.log('Message sent successfully!')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again')
    }
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
                  Real-time Messages:
                </h3>
                {realtimeMessages.length === 0 ? (
                  <p className="text-gray-500">No messages yet...</p>
                ) : (
                  <ul>
                    {realtimeMessages.map((msg, index) => (
                      <li key={index} className="mb-1 text-gray-800">
                        <strong>{msg.senderId}:</strong> {msg.content}
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
            <p className="text-gray-500 mt-4"></p>
          )}
        </div>
      </div>
    </section>
  )
}

export default Home
