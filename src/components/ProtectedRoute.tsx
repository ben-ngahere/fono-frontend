import { useAuth0 } from '@auth0/auth0-react'
import Loading from '../Loading'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-lg shadow-xl text-center">
          <i className="fas fa-home text-6xl text-purple-600 mb-4"></i>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to fono
          </h1>
          <p className="text-gray-600 mb-6">
            Please login to access your family hub
          </p>
          <button
            onClick={() => loginWithRedirect()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Login
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
