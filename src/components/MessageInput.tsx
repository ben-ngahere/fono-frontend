import type { FormEvent } from 'react'
import { useRef, useCallback } from 'react'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  disabled?: boolean
  onTypingStart?: () => void
  onTypingStop?: () => void
}

const MessageInput = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  onTypingStart,
  onTypingStop,
}: MessageInputProps) => {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  // Handle typing detection
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onChange(newValue)

      // If user starts typing and wasn't already typing
      if (!isTypingRef.current && newValue.trim()) {
        isTypingRef.current = true
        onTypingStart?.()
        console.log('🟢 Started typing')
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set new timeout to stop typing after 3 seconds of inactivity
      if (newValue.trim()) {
        typingTimeoutRef.current = setTimeout(() => {
          isTypingRef.current = false
          onTypingStop?.()
          console.log('🔴 Stopped typing (timeout)')
        }, 3000)
      } else {
        // If input is empty, stop typing immediately
        isTypingRef.current = false
        onTypingStop?.()
        console.log('🔴 Stopped typing (empty)')
      }
    },
    [onChange, onTypingStart, onTypingStop]
  )

  // Handle form submission - stop typing immediately
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      isTypingRef.current = false
      onTypingStop?.()
      console.log('🔴 Stopped typing (message sent)')
      onSubmit(e)
    },
    [onSubmit, onTypingStop]
  )

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      const form = event.currentTarget.closest('form')
      if (form) {
        form.requestSubmit()
      }
    }
  }

  return (
    <div className="p-4 border-t border-white/20">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
          aria-label="Add attachment"
        >
          <i className="fas fa-plus-circle text-xl" aria-hidden="true"></i>
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Type a message..."
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={disabled}
            className="w-full px-5 py-3 pr-24 rounded-full bg-white/10 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
            aria-label="Message input"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              className="p-2 text-white/60 hover:text-white transition"
              aria-label="Add emoji"
            >
              <i className="fas fa-smile" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              className="p-2 text-white/60 hover:text-white transition"
              aria-label="Attach file"
            >
              <i className="fas fa-paperclip" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              className="p-2 text-white/60 hover:text-white transition"
              aria-label="Take photo"
            >
              <i className="fas fa-camera" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
          aria-label="Send message"
        >
          <i className="fas fa-paper-plane text-xl" aria-hidden="true"></i>
        </button>
      </form>
    </div>
  )
}

export default MessageInput
