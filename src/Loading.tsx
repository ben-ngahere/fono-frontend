const Loading = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-800">
      <div className="text-center">
        <p className="text-white text-3xl mb-4">Loading application...</p>
        <div className="w-64 bg-gray-700 rounded-full h-4 overflow-hidden mx-auto">
          <div
            className="bg-blue-500 h-full rounded-full animate-pulse"
            style={{ width: '100%' }}
          ></div>
        </div>
      </div>
    </section>
  )
}

export default Loading
