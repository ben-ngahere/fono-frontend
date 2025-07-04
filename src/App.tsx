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
      <nav
        className="navbar is-dark"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand">
          <Link className="navbar-item" to="/">
            <h1 className="title is-4 has-text-white">fono</h1>
          </Link>
        </div>
        <div id="navbarBasicExample" className="navbar-menu">
          <div className="navbar-start">
            <Link className="navbar-item" to="/">
              Home
            </Link>
            {isAuthenticated && (
              <Link className="navbar-item" to="/profile">
                Profile
              </Link>
            )}
            {isAuthenticated && (
              <Link className="navbar-item" to="/protected">
                Protected
              </Link>
            )}
          </div>
          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                {!isAuthenticated && (
                  <button
                    className="button is-primary"
                    onClick={() => loginWithRedirect()}
                  >
                    Log In
                  </button>
                )}
                {isAuthenticated && (
                  <>
                    <span className="navbar-item has-text-white">
                      Hello, {user?.name || user?.nickname || 'User'}!
                    </span>
                    <button
                      className="button is-light"
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
          </div>
        </div>
      </nav>

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
