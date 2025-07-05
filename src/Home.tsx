// import { useState } from 'react'
// import { getGreeting } from '../apiClient.ts'
// import { useQuery } from '@tanstack/react-query'

const Home = () => {
  return (
    <section className="min-h-screen bg-yellow-400 flex items-center justify-center">
      <div className="container mx-auto text-center p-4">
        {/* Heading */}
        <h1 className="text-6xl font-extrabold text-white mb-8">fono</h1>
        <div className="bg-white bg-opacity-85 p-8 rounded-lg shadow-lg max-w-sm mx-auto">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">welcome</h2>

          {/* Login/Register Buttons */}
          <div className="mb-4">
            <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
              Login
            </button>{' '}
          </div>
          <div>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
              Register
            </button>{' '}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Home
