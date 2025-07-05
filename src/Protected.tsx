import { useState, useEffect } from 'react'
import { useProtectedApi } from './apiClient'

const Protected = () => {
  const { getProtected } = useProtectedApi()
  const [data, setData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const fetchedData = await getProtected()
        setData(fetchedData)
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
        console.error('Failed to fetch protected data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProtectedData()
  }, [getProtected])

  if (isLoading) {
    return (
      <section className="min-h-screen bg-green-100 flex items-center justify-center py-12">
        <p className="text-lg text-green-700">Loading protected data...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="min-h-screen bg-red-100 flex items-center justify-center py-12">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl font-bold text-red-800 mb-4">
            Error fetching protected data
          </h1>
          <p className="text-lg text-red-700">{error}</p>
          <p className="text-md text-red-600 mt-4">
            Ensure your backend is running and you are logged in.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-green-100 flex items-center justify-center py-12">
      <div className="container mx-auto text-center px-4">
        <h1 className="text-4xl font-bold text-green-800 mb-4">
          Protected Content
        </h1>
        <p className="text-lg text-green-700">
          {data || 'No protected data received.'}
        </p>
      </div>
    </section>
  )
}

export default Protected
