import { useAuth0 } from '@auth0/auth0-react'

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading profile...</p>
      </section>
    )
  }

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-red-100 text-red-700">
        <p className="text-lg">Please log in to view your profile.</p>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Your Profile
        </h1>
        {user && (
          <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto flex flex-col items-center">
            {user.picture && (
              <img
                src={user.picture}
                alt="Profile"
                className="w-32 h-32 rounded-full mb-6 border-4 border-blue-500 shadow-lg"
              />
            )}
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              {user.name || 'No Name'}
            </h2>
            {user.email && (
              <p className="text-gray-600 mb-4">Email: {user.email}</p>
            )}
            {user.email_verified !== undefined && (
              <p
                className={`text-sm ${
                  user.email_verified ? 'text-green-600' : 'text-red-600'
                } mb-4`}
              >
                Email Verified: {user.email_verified ? 'Yes' : 'No'}
              </p>
            )}
            <div className="bg-gray-100 p-4 rounded-md w-full text-left overflow-x-auto">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Raw User Data:
              </h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Profile
