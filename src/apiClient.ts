import { useAuth0 } from '@auth0/auth0-react'

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'

// Public Greeting
export async function getGreeting(): Promise<string> {
  const response = await fetch(`${baseUrl}/greeting`)
  if (!response.ok) {
    throw new Error('Failed to fetch greeting')
  }
  const data = await response.json()
  return data.greeting
}

// Get protected data
export function useProtectedApi() {
  const { getAccessTokenSilently } = useAuth0()

  const getProtected = async (): Promise<string> => {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      })
      console.log('Access Token obtained:', accessToken)

      const response = await fetch(`${baseUrl}/protected`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(
          `API request failed with status ${response.status}: ${
            errorData.message || 'Unknown error'
          }`
        )
      }

      const data = await response.json()
      return data.message
    } catch (error) {
      console.error('Error fetching protected data:', error)
      throw error
    }
  }
  return { getProtected }
}
