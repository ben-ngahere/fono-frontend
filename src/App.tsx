// src/App.tsx
import { useAuth0 } from '@auth0/auth0-react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './Home'
import Profile from './Profile'
import Protected from './Protected'
import Loading from './Loading'
import ErrorPage from './ErrorPage'

function App() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user, error } =
    useAuth0()

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <ErrorPage error={error} />
  }

  return (
    <>
      {/* Navbar + Auth0 actions */}
      <nav
        className="bg-gray-800 text-white p-4"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link className="text-2xl font-bold text-white mr-6" to="/">
              fono
            </Link>
            <div className="flex space-x-4">
              <Link className="hover:text-gray-300" to="/">
                Home
              </Link>
              {isAuthenticated && (
                <Link className="hover:text-gray-300" to="/profile">
                  Profile
                </Link>
              )}
              {isAuthenticated && (
                <Link className="hover:text-gray-300" to="/protected">
                  Protected
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!isAuthenticated && (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                onClick={() => loginWithRedirect()}
              >
                Log In
              </button>
            )}
            {isAuthenticated && (
              <>
                <span className="text-white">
                  Hello, {user?.name || user?.nickname || 'User'}!
                </span>
                <button
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                  onClick={() =>
                    logout({
                      logoutParams: { returnTo: window.location.origin },
                    })
                  }
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Home />}
        />
        <Route
          path="/protected"
          element={isAuthenticated ? <Protected /> : <Home />}
        />
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>
    </>
  )
}

export default App
