import { useState, useEffect } from 'react'
import Pusher from 'pusher-js'

interface Message {
  senderId: string
  content: string
}

const Home = () => {
  // State to hold real-time messages
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([])

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

  return (
    <section className="min-h-screen bg-yellow-400 flex items-center justify-center">
      <div className="container mx-auto text-center p-4">
        {/* Heading */}
        <h1 className="text-6xl font-extrabold text-white mb-8">fono</h1>
        <div className="bg-white bg-opacity-85 p-8 rounded-lg shadow-lg max-w-sm mx-auto">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">welcome</h2>

          {/* Real-time Messages Display Area */}
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
        </div>
      </div>
    </section>
  )
}

export default Home
