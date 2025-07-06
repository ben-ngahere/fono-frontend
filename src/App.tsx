import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import Loading from './Loading'
import ErrorPage from './ErrorPage'
import AppLayout from './components/AppLayout'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'

// Placeholder components for future features
const MediaPage = () => (
  <div className="flex-1 flex items-center justify-center bg-white/95 backdrop-blur-md m-4 rounded-lg shadow-lg">
    <div className="text-center">
      <i className="fas fa-photo-video text-6xl text-gray-300 mb-4"></i>
      <h2 className="text-2xl font-semibold text-gray-700">Media Browser</h2>
      <p className="text-gray-500 mt-2">Coming soon - Jellyfin integration</p>
    </div>
  </div>
)

const DocumentsPage = () => (
  <div className="flex-1 flex items-center justify-center bg-white/95 backdrop-blur-md m-4 rounded-lg shadow-lg">
    <div className="text-center">
      <i className="fas fa-folder text-6xl text-gray-300 mb-4"></i>
      <h2 className="text-2xl font-semibold text-gray-700">Documents</h2>
      <p className="text-gray-500 mt-2">
        Coming soon - Family document storage
      </p>
    </div>
  </div>
)

const StreamPage = () => (
  <div className="flex-1 flex items-center justify-center bg-white/95 backdrop-blur-md m-4 rounded-lg shadow-lg">
    <div className="text-center">
      <i className="fas fa-tv text-6xl text-gray-300 mb-4"></i>
      <h2 className="text-2xl font-semibold text-gray-700">Stream</h2>
      <p className="text-gray-500 mt-2">Coming soon - Watch together</p>
    </div>
  </div>
)

const VaultPage = () => (
  <div className="flex-1 flex items-center justify-center bg-white/95 backdrop-blur-md m-4 rounded-lg shadow-lg">
    <div className="text-center">
      <i className="fas fa-shield-alt text-6xl text-gray-300 mb-4"></i>
      <h2 className="text-2xl font-semibold text-gray-700">Secure Vault</h2>
      <p className="text-gray-500 mt-2">Coming soon - Extra secure storage</p>
    </div>
  </div>
)

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Home />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/media"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MediaPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DocumentsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stream"
        element={
          <ProtectedRoute>
            <AppLayout>
              <StreamPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vault"
        element={
          <ProtectedRoute>
            <AppLayout>
              <VaultPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/loading" element={<Loading />} />
      <Route
        path="/error"
        element={<ErrorPage error={new Error('Unknown error')} />}
      />
    </Routes>
  )
}

export default App
