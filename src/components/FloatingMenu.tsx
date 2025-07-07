import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'

interface FloatingMenuProps {
  isOpen: boolean
  onClose: () => void
}

const FloatingMenu = ({ isOpen, onClose }: FloatingMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })

  const menuItems = [
    { icon: 'fas fa-comments', label: 'Chat', path: '/chat' },
    { icon: 'fas fa-photo-video', label: 'Media', path: '/media' },
    { icon: 'fas fa-folder', label: 'Documents', path: '/documents' },
    { icon: 'fas fa-tv', label: 'Stream', path: '/stream' },
    { icon: 'fas fa-shield-alt', label: 'Vault', path: '/vault' },
    { icon: 'fas fa-cog', label: 'Settings', path: '/settings' },
  ]

  useEffect(() => {
    // Get menu button position
    const menuButton = document.querySelector('[data-menu-button]')
    if (menuButton) {
      const rect = menuButton.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right,
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && menuRef.current && backdropRef.current) {
      // Animate backdrop
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      )

      // Animate menu
      gsap.fromTo(
        menuRef.current,
        {
          opacity: 0,
          scale: 0.95,
          y: -20,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'back.out(1.2)',
        }
      )
    }
  }, [isOpen])

  const handleNavigate = (path: string) => {
    // Close menu immediately and navigate
    onClose()
    // Small delay to allow close animation
    setTimeout(() => {
      navigate(path)
    }, 50)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        ref={menuRef}
        className="absolute bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 min-w-[200px]"
        style={{
          top: `${menuPosition.top}px`,
          right: `${menuPosition.right}px`,
        }}
      >
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all group"
          >
            <i
              className={`${item.icon} text-lg w-5 text-center group-hover:scale-110 transition-transform`}
            ></i>
            <span className="text-left">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default FloatingMenu
