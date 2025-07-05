interface ErrorPageProps {
  error: Error
}

const ErrorPage = ({ error }: ErrorPageProps) => {
  return (
    <section className="min-h-screen bg-red-700 flex items-center justify-center py-12">
      <div className="container mx-auto text-center px-4">
        <p className="text-white text-4xl font-bold mb-4">An Error Occurred</p>
        <p className="text-white text-lg mb-6">{error.message}</p>
        {error.stack && (
          <pre className="bg-red-800 text-red-200 p-6 rounded-lg text-left max-w-3xl mx-auto overflow-x-auto text-sm">
            {error.stack}
          </pre>
        )}
      </div>
    </section>
  )
}

export default ErrorPage
