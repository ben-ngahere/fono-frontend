import { useAuth0 } from '@auth0/auth0-react'
import { useState, useEffect, useCallback } from 'react'
import Pusher from 'pusher-js'

const baseUrl = '/api/v1'

// Interface for the message payload
interface MessagePayload {
  receiverId: string | null
  content: string
}

// Interface for history
interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  messageType: string
  createdAt: string
  readStatus: boolean
}

export function useChatApi(chatPartnerId: string) {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchChatHistory = useCallback(async () => {
    if (!isAuthenticated || !chatPartnerId) return

    if (messages.length === 0) {
      setLoading(true)
    }

    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      })

      const response = await fetch(
        `${baseUrl}/chat_messages?participantId=${chatPartnerId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `Failed to fetch chat history: ${response.status} - ${
            errorData.message || 'Unknown error'
          }`
        )
      }

      const data: Message[] = await response.json()
      setMessages(data)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, chatPartnerId, getAccessTokenSilently, messages.length])

  const sendMessage = useCallback(
    async (message: MessagePayload) => {
      if (!isAuthenticated || !user) {
        throw new Error('User not authenticated to send message.')
      }

      // Create a message to show in the UI immediately
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: user.sub as string,
        receiverId: message.receiverId as string,
        content: message.content,
        messageType: 'text',
        createdAt: new Date().toISOString(),
        readStatus: false,
      }

      // Update the UI instantly
      setMessages((currentMessages) => [...currentMessages, optimisticMessage])

      // Send the real message to the server in the background
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        })

        await fetch(`${baseUrl}/chat_messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...message,
            senderId: user.sub,
          }),
        })
      } catch (error) {
        console.error(
          'Failed to send message, removing optimistic message.',
          error
        )
        // If the API call fails, alert the user
        setMessages((currentMessages) =>
          currentMessages.filter((m) => m.id !== optimisticMessage.id)
        )
        // Re-throw the error so the calling component can handle it
        throw error
      }
    },
    [isAuthenticated, getAccessTokenSilently, user]
  )

  useEffect(() => {
    fetchChatHistory()

    if (!chatPartnerId || !user) return

    console.log('=== Pusher Debug ===')
    console.log('User:', user.sub)
    console.log('Chat Partner:', chatPartnerId)

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      authorizer: (channel) => {
        return {
          authorize: async (socketId, callback) => {
            console.log(
              'Authorizing channel:',
              channel.name,
              'Socket ID:',
              socketId
            )
            try {
              const accessToken = await getAccessTokenSilently({
                authorizationParams: {
                  audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                },
              })
              const response = await fetch(`${baseUrl}/pusher/auth`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  socket_id: socketId,
                  channel_name: channel.name,
                }),
              })

              if (!response.ok) {
                throw new Error(`Failed to authorize: ${response.status}`)
              }

              const authData = await response.json()
              console.log('Authorization successful for channel:', channel.name)
              callback(null, authData)
            } catch (error) {
              console.error('Authorization failed:', error)
              callback(error as Error, null)
            }
          },
        }
      },
    })

    const sanitizedUserId = user.sub?.replace(/\|/g, '_').replace(/\./g, '-')
    const channelName = `private-chat-${sanitizedUserId}`
    console.log('Subscribing to channel:', channelName)

    const channel = pusher.subscribe(channelName)

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to:', channelName)
    })

    channel.bind('pusher:subscription_error', (error: unknown) => {
      console.error('Subscription error:', error)
    })

    // When a notification comes in, refetch the entire history
    channel.bind('new-message', function () {
      console.log('New message event received!')
      fetchChatHistory()
    })

    // Store pusher on window for debugging
    ;(
      window as unknown as {
        pusher: typeof pusher
        pusherChannel: typeof channel
      }
    ).pusher = pusher
    ;(
      window as unknown as {
        pusher: typeof pusher
        pusherChannel: typeof channel
      }
    ).pusherChannel = channel

    return () => {
      channel.unbind('new-message')
      pusher.unsubscribe(channelName)
    }
  }, [chatPartnerId, user, fetchChatHistory, getAccessTokenSilently])
  return { messages, loading, error, sendMessage }
}
