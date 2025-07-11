import { useState, useEffect, useCallback, useRef } from 'react'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
}

export function useNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>('default')
  const [isVisible, setIsVisible] = useState(true)
  const [isEnabled, setIsEnabled] = useState(true)
  const visibilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  // Check notifications are supported
  const isSupported = 'Notification' in window

  // Request notification permission
  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!isSupported) {
        console.warn('Notifications not supported in this browser')
        return 'denied'
      }

      try {
        const result = await Notification.requestPermission()
        setPermission(result)
        return result
      } catch (error) {
        console.error('Failed to request notification permission:', error)
        setPermission('denied')
        return 'denied'
      }
    }, [isSupported])

  // Show a notification
  const showNotification = useCallback(
    async (options: NotificationOptions): Promise<Notification | null> => {
      // Don't show if disabled, user is active or no permission
      if (!isEnabled || isVisible || permission !== 'granted') {
        return null
      }

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/fono-icon.png',
          tag: options.tag || 'fono-message',
          requireInteraction: false,
          silent: false,
        })

        // Notification timeout
        setTimeout(() => {
          notification.close()
        }, 5000)

        // Go to what notification is about if clicked
        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        return notification
      } catch (error) {
        console.error('Failed to show notification:', error)
        return null
      }
    },
    [isEnabled, isVisible, permission]
  )

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden
      setIsVisible(visible)

      // start timeout from 0
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
      }

      // If visible, mark as active
      if (visible) {
        setIsVisible(true)
      } else {
        // If hidden, wait before marking as inactive
        visibilityTimeoutRef.current = setTimeout(() => {
          setIsVisible(false)
        }, 2000)
      }
    }

    const handleFocus = () => {
      setIsVisible(true)
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
      }
    }

    const handleBlur = () => {}

    setIsVisible(!document.hidden && document.hasFocus())

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
      }
    }
  }, [])

  // Init permission state
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission)
    }
  }, [isSupported])

  // Helper function for showing message notifications
  const showMessageNotification = useCallback(
    (senderName: string, messageContent: string, senderId?: string) => {
      // Message length
      const maxLength = 100
      const truncatedContent =
        messageContent.length > maxLength
          ? `${messageContent.substring(0, maxLength)}...`
          : messageContent

      return showNotification({
        title: senderName,
        body: truncatedContent,
        tag: `message-${senderId || 'unknown'}`, // Same user notifications stack
      })
    },
    [showNotification]
  )

  // Check if notifications should be shown
  const shouldShowNotification = useCallback(() => {
    return isSupported && permission === 'granted' && isEnabled && !isVisible
  }, [isSupported, permission, isEnabled, isVisible])

  return {
    // State
    permission,
    isSupported,
    isEnabled,
    isVisible,

    // Actions
    requestPermission,
    showNotification,
    showMessageNotification,
    setIsEnabled,

    // Helpers
    shouldShowNotification,
  }
}
