import { useState } from 'react'
import { useChatApi } from './hooks/useChatApi'
import { useAuth0 } from '@auth0/auth0-react'

const Home = () => {
  const { isAuthenticated, user } = useAuth0()
  const [currentMessage, setCurrentMessage] = useState('')

  // Hardcoded chat partner logic for testing
  let chatPartnerId = ''
  if (user?.sub) {
    if (user.sub === 'google-oauth2|102141106120855017585') {
      chatPartnerId = 'github|204113180'
    } else if (user.sub === 'github|204113180') {
      chatPartnerId = 'google-oauth2|102141106120855017585'
    }
  }

  const { messages, loading, error, sendMessage } = useChatApi(chatPartnerId)

  // Handle message sending
  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentMessage.trim() || !chatPartnerId) return

    try {
      await sendMessage({
        receiverId: chatPartnerId,
        content: currentMessage,
      })
      setCurrentMessage('')
      console.log('Message sent successfully!')
    } catch (err) {
      console.error('Failed to send message:', err)
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
        <h1 className="text-6xl font-extrabold text-white mb-8">fono</h1>
        <div className="bg-white bg-opacity-85 p-8 rounded-lg shadow-lg max-w-sm mx-auto">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">welcome</h2>

          {isAuthenticated ? (
            <>
              <div className="mt-5 text-left max-h-56 overflow-y-auto border-t border-gray-300 pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Chat with {chatPartnerId ? 'your partner' : '...'}
                </h3>
                {loading && <p className="text-gray-500">Loading chat...</p>}
                {error && (
                  <p className="text-red-500">Error: {error.message}</p>
                )}
                {!loading && !error && messages.length === 0 && (
                  <p className="text-gray-500">No messages yet. Say hi!</p>
                )}
                <ul>
                  {messages.map((msg) => (
                    <li
                      key={msg.id}
                      className={`mb-1 ${
                        msg.senderId === user?.sub ? 'text-right' : 'text-left'
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
                        {msg.content}
                        <div className="text-xs opacity-75 mt-1">
                          {formatMessageTime(msg.createdAt)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <form onSubmit={handleSendMessage} className="mt-6 space-y-4">
                <div>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500"
                    type="text"
                    placeholder="Type your message..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    disabled={!isAuthenticated || !chatPartnerId}
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
