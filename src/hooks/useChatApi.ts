// fono-frontend/src/hooks/useChatApi.ts
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

    setLoading(true)
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
  }, [isAuthenticated, chatPartnerId, getAccessTokenSilently])

  const sendMessage = async (message: MessagePayload) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated to send message.')
    }

    const accessToken = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    })

    const messageWithSender = {
      ...message,
      senderId: user?.sub,
    }

    const response = await fetch(`${baseUrl}/chat_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(messageWithSender),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        `Failed to send message: ${response.status} - ${
          errorData.message || 'Unknown error'
        }`
      )
    }
    // No need to process the response, Pusher will trigger a refresh
  }

  useEffect(() => {
    fetchChatHistory()

    if (!chatPartnerId || !user) return

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      authEndpoint: '/api/v1/pusher/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${getAccessTokenSilently()}`,
        },
      },
    })

    const sanitizedUserId = user.sub?.replace(/\|/g, '_').replace(/\./g, '-')
    const channelName = `private-chat-${sanitizedUserId}`
    const channel = pusher.subscribe(channelName)

    const handleNewMessage = () => {
      // When a notification comes in, refetch the entire history
      fetchChatHistory()
    }

    channel.bind('new-message', handleNewMessage)

    return () => {
      channel.unbind('new-message', handleNewMessage)
      pusher.unsubscribe(channelName)
    }
  }, [chatPartnerId, user, fetchChatHistory, getAccessTokenSilently])

  return { messages, loading, error, sendMessage }
}
