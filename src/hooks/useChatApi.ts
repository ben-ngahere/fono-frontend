import { useAuth0 } from '@auth0/auth0-react'
import { useState, useEffect, useCallback } from 'react'
import Pusher from 'pusher-js'

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'

// Message
interface MessagePayload {
  receiverId: string | null
  content: string
}

// History
interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  messageType: string
  createdAt: string
  readStatus: boolean
}

// Chat Progress
interface ClearChatProgress {
  deleted: number
  total: number
  errors: string[]
}

export function useChatApi(chatPartnerId: string) {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [clearingChat, setClearingChat] = useState(false)
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false) // ← Add typing state

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

  // Typing functions
  const sendTypingStart = useCallback(async () => {
    if (!isAuthenticated || !user || !chatPartnerId) return

    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      })

      await fetch(`${baseUrl}/pusher/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'start',
          targetUserId: chatPartnerId,
        }),
      })
    } catch (error) {
      console.error('Failed to send typing start event:', error)
    }
  }, [isAuthenticated, user, chatPartnerId, getAccessTokenSilently])

  const sendTypingStop = useCallback(async () => {
    if (!isAuthenticated || !user || !chatPartnerId) return

    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      })

      await fetch(`${baseUrl}/pusher/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'stop',
          targetUserId: chatPartnerId,
        }),
      })
    } catch (error) {
      console.error('Failed to send typing stop event:', error)
    }
  }, [isAuthenticated, user, chatPartnerId, getAccessTokenSilently])

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

      // Update UI instantly
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

    // Typing event listeners
    channel.bind('user-typing-start', function (data: any) {
      console.log('🟢 Received typing start event:', data)
      setIsOtherUserTyping(true)
    })

    channel.bind('user-typing-stop', function (data: any) {
      console.log('🔴 Received typing stop event:', data)
      setIsOtherUserTyping(false)
    })

    // Pusher window for debugging
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
      channel.unbind('user-typing-start')
      channel.unbind('user-typing-stop')
      pusher.unsubscribe(channelName)
    }
  }, [chatPartnerId, user, fetchChatHistory, getAccessTokenSilently])

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated to delete message.')
      }

      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        })

        const response = await fetch(`${baseUrl}/chat_messages/${messageId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to delete message')
        }

        // Remove from local state
        setMessages((current) => current.filter((msg) => msg.id !== messageId))
      } catch (error) {
        console.error('Failed to delete message:', error)
        throw error
      }
    },
    [isAuthenticated, getAccessTokenSilently, setMessages]
  )

  const clearChat = useCallback(
    async (
      onProgress?: (progress: ClearChatProgress) => void
    ): Promise<{
      success: boolean
      deleted: number
      errors: string[]
    }> => {
      if (!isAuthenticated || !chatPartnerId) {
        throw new Error('User not authenticated or no chat selected.')
      }

      setClearingChat(true)
      const errors: string[] = []
      let deletedCount = 0

      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        })

        // Get current messages to delete
        const messagesToDelete = messages
        const totalMessages = messagesToDelete.length

        if (totalMessages === 0) {
          setClearingChat(false)
          return { success: true, deleted: 0, errors: [] }
        }

        // Initial progress callback
        onProgress?.({
          deleted: 0,
          total: totalMessages,
          errors: [],
        })

        // Delete messages sequentially to avoid overwhelming the server
        for (const message of messagesToDelete) {
          try {
            const response = await fetch(
              `${baseUrl}/chat_messages/${message.id}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )

            if (!response.ok) {
              const errorMsg = `Failed to delete message ${message.id}: ${response.status}`
              errors.push(errorMsg)
              console.error(errorMsg)
            } else {
              deletedCount++
              // Remove from local state immediately
              setMessages((current) =>
                current.filter((msg) => msg.id !== message.id)
              )
            }
          } catch (error) {
            const errorMsg = `Error deleting message ${message.id}: ${error}`
            errors.push(errorMsg)
            console.error(errorMsg)
          }

          // Update progress
          onProgress?.({
            deleted: deletedCount,
            total: totalMessages,
            errors: [...errors],
          })

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 50))
        }

        console.log(
          `Chat clear completed: ${deletedCount}/${totalMessages} messages deleted`
        )

        return {
          success: errors.length === 0,
          deleted: deletedCount,
          errors,
        }
      } catch (error) {
        const errorMsg = `Failed to clear chat: ${error}`
        console.error(errorMsg)
        return {
          success: false,
          deleted: deletedCount,
          errors: [errorMsg],
        }
      } finally {
        setClearingChat(false)
      }
    },
    [isAuthenticated, chatPartnerId, getAccessTokenSilently, messages]
  )

  // Clear only users own messages
  const clearMyMessages = useCallback(async () => {
    if (!isAuthenticated || !chatPartnerId) {
      throw new Error('User not authenticated or no chat selected.')
    }

    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      })

      // Delete only users messages
      const messagesToDelete = messages.filter(
        (msg) => msg.senderId === user?.sub
      )

      await Promise.all(
        messagesToDelete.map((msg) =>
          fetch(`${baseUrl}/chat_messages/${msg.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
        )
      )

      // Remove only the users messages from local state
      setMessages((current) =>
        current.filter((msg) => msg.senderId !== user?.sub)
      )
    } catch (error) {
      console.error('Failed to clear user messages:', error)
      throw error
    }
  }, [isAuthenticated, chatPartnerId, getAccessTokenSilently, messages, user])

  return {
    messages,
    loading,
    error,
    clearingChat,
    isOtherUserTyping,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    deleteMessage,
    clearChat,
    clearMyMessages,
  }
}
