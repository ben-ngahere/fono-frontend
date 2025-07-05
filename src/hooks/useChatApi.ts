// fono-frontend/src/hooks/useChatApi.ts
import { useAuth0 } from '@auth0/auth0-react'

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

export function useChatApi() {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0()

  const sendMessage = async (message: MessagePayload) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated to send message.')
    }

    try {
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
        console.error('API Error sending message:', errorData)
        throw new Error(
          `Failed to send message: ${response.status} - ${
            errorData.message || 'Unknown error'
          }`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // History, Read Status
  const getChatHistory = async (chatPartnerId: string): Promise<Message[]> => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated to fetch chat history.')
    }
    if (!chatPartnerId) {
      throw new Error('Chat partner ID is required to fetch history.')
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
        console.error('API Error fetching chat history:', errorData)
        throw new Error(
          `Failed to fetch chat history: ${response.status} - ${
            errorData.message || 'Unknown error'
          }`
        )
      }

      const data: Message[] = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching chat history:', error)
      throw error
    }
  }

  return { sendMessage, getChatHistory, isAuthenticated, user }
}
