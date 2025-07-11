import { useEffect, useState } from 'react'

interface TypingIndicatorProps {
  userName?: string
  isVisible: boolean
}

const TypingIndicator = ({
  userName = 'Someone',
  isVisible,
}: TypingIndicatorProps) => {
  const [dots, setDots] = useState('.')

  // Animate "dots"
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '.') return '..'
        if (prev === '..') return '...'
        return '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="flex items-end gap-2 justify-start mb-2">
      {/* Avatar space to align with other messages */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400/50 to-pink-400/50 flex items-center justify-center">
        <span className="text-white text-xs">...</span>
      </div>

      {/* Typing bubble */}
      <div className="bg-white/10 backdrop-blur-md text-white rounded-2xl rounded-bl-md px-4 py-2 max-w-[70%]">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-white/80">
            {userName} is typing
          </span>
          <span className="text-lg font-bold tracking-wider text-white min-w-[24px]">
            {dots}
          </span>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
