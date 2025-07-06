import { useAuth0 } from '@auth0/auth0-react'
import { useState, useEffect, useCallback } from 'react'

const baseUrl = '/api/v1'

export interface User {
  user_id: string
  email: string
  display_name: string
  avatar_url?: string
  status: 'online' | 'offline' | 'away'
  status_message?: string
  last_seen: string
}

export function useUsers() {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0()
  const [users, setUsers] = useState<User[]>([])
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Get all users
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      })

      const response = await fetch(`${baseUrl}/users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data: User[] = await response.json()
      setUsers(data)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, getAccessTokenSilently])

  // Get or create current user profile
  const fetchCurrentUserProfile = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      })

      const response = await fetch(`${baseUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const data: User = await response.json()
      setCurrentUserProfile(data)

      // Update status to online
      try {
        await fetch(`${baseUrl}/users/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status: 'online' }),
        })
      } catch (error) {
        console.error('Error updating status:', error)
      }
    } catch (e) {
      console.error('Error fetching user profile:', e)
    }
  }, [isAuthenticated, user, getAccessTokenSilently])

  // Update user profile
  const updateProfile = useCallback(
    async (
      updates: Partial<
        Pick<User, 'display_name' | 'avatar_url' | 'status_message'>
      >
    ) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated')
      }

      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        })

        const response = await fetch(`${baseUrl}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          throw new Error('Failed to update profile')
        }

        const updatedProfile: User = await response.json()
        setCurrentUserProfile(updatedProfile)

        // Refresh users list to show updated info
        await fetchUsers()

        return updatedProfile
      } catch (error) {
        console.error('Error updating profile:', error)
        throw error
      }
    },
    [isAuthenticated, getAccessTokenSilently, fetchUsers]
  )

  // Update user status
  const updateUserStatus = useCallback(
    async (status: 'online' | 'offline' | 'away') => {
      if (!isAuthenticated) return

      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        })

        await fetch(`${baseUrl}/users/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status }),
        })
      } catch (error) {
        console.error('Error updating status:', error)
      }
    },
    [isAuthenticated, getAccessTokenSilently]
  )

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUserProfile()
      fetchUsers()
    }
  }, [isAuthenticated, fetchCurrentUserProfile, fetchUsers])

  // Set user offline on unmount
  useEffect(() => {
    return () => {
      if (isAuthenticated) {
        updateUserStatus('offline')
      }
    }
  }, [isAuthenticated, updateUserStatus])

  // Get other users
  const otherUsers = users.filter((u) => u.user_id !== user?.sub)

  return {
    users,
    otherUsers,
    currentUserProfile,
    loading,
    error,
    updateProfile,
    updateUserStatus,
    refetchUsers: fetchUsers,
  }
}
