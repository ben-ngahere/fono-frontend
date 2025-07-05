const Protected = () => {
  return (
    <section className="min-h-screen bg-green-100 flex items-center justify-center py-12">
      <div className="container mx-auto text-center px-4">
        <h1 className="text-4xl font-bold text-green-800 mb-4">
          Protected Content
        </h1>
        <p className="text-lg text-green-700">
          This content is only visible if you are logged in.
        </p>
        <p className="text-md text-green-600 mt-4">
          Soon, this page will fetch data from your authenticated backend API!
        </p>
      </div>
    </section>
  )
}

export default Protected
