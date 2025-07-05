// fono-frontend/src/hooks/useChatApi.ts
import { useAuth0 } from '@auth0/auth0-react'

const baseUrl = '/api/v1'

// Interface for the message payload
interface MessagePayload {
  receiverId: string | null
  content: string
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

  return { sendMessage, isAuthenticated }
}
