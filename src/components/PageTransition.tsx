import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'

interface PageTransitionProps {
  children: React.ReactNode
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)

  // Random animation directions
  const getRandomAnimation = () => {
    const animations = [
      { x: '100%', y: '0%' }, // from right
      { x: '-100%', y: '0%' }, // left
      { x: '0%', y: '100%' }, // bottom
      { x: '0%', y: '-100%' }, // top
    ]
    return animations[Math.floor(Math.random() * animations.length)]
  }

  useEffect(() => {
    if (containerRef.current) {
      const { x, y } = getRandomAnimation()

      // Animate in
      gsap.fromTo(
        containerRef.current,
        {
          x,
          y,
          opacity: 0,
        },
        {
          x: '0%',
          y: '0%',
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
        }
      )
    }
  }, [location.pathname])

  return (
    <div ref={containerRef} className="page-transition-container">
      {children}
    </div>
  )
}

export default PageTransition
