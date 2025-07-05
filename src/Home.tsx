import { useState, useEffect } from 'react'
import Pusher from 'pusher-js'
import { useChatApi } from './hooks/useChatApi'

interface Message {
  senderId: string
  content: string
}

const Home = () => {
  // State to hold real-time messages
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const { sendMessage, isAuthenticated } = useChatApi()

  // Pusher init
  useEffect(() => {
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    })

    const channelName = 'public-chat'
    const channel = pusher.subscribe(channelName)

    channel.bind('new-message', (data: Message) => {
      console.log('New message received via Pusher:', data)
      setRealtimeMessages((prevMessages) => [...prevMessages, data])
    })

    // Cleanup function
    return () => {
      pusher.unsubscribe(channelName)
      pusher.disconnect()
    }
  }, [])

  // Handle message sending
  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!currentMessage.trim()) {
      return
    }

    if (!isAuthenticated) {
      alert('Please log in to send messages')
      return
    }

    try {
      // Call API to send the message
      await sendMessage({ receiverId: null, content: currentMessage })
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
