import { useEffect, useRef, useCallback } from 'react'

interface MobileControlsProps {
  onControlChange: (controls: { forward: boolean; backward: boolean; left: boolean; right: boolean }) => void
}

export default function MobileControls({ onControlChange }: MobileControlsProps) {
  const controlsRef = useRef({ forward: false, backward: false, left: false, right: false })

  const updateControls = useCallback((key: keyof typeof controlsRef.current, value: boolean) => {
    controlsRef.current[key] = value
    onControlChange({ ...controlsRef.current })
  }, [onControlChange])

  // Keyboard controls for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          updateControls('forward', true)
          break
        case 's':
        case 'arrowdown':
          updateControls('backward', true)
          break
        case 'a':
        case 'arrowleft':
          updateControls('left', true)
          break
        case 'd':
        case 'arrowright':
          updateControls('right', true)
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          updateControls('forward', false)
          break
        case 's':
        case 'arrowdown':
          updateControls('backward', false)
          break
        case 'a':
        case 'arrowleft':
          updateControls('left', false)
          break
        case 'd':
        case 'arrowright':
          updateControls('right', false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [updateControls])

  const handleTouchStart = (control: keyof typeof controlsRef.current) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    updateControls(control, true)
  }

  const handleTouchEnd = (control: keyof typeof controlsRef.current) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    updateControls(control, false)
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 z-20 pointer-events-none px-4">
      <div className="flex justify-between items-end max-w-lg mx-auto">
        {/* Left side - Steering */}
        <div className="pointer-events-auto flex gap-2">
          <button
            onTouchStart={handleTouchStart('left')}
            onTouchEnd={handleTouchEnd('left')}
            onMouseDown={handleTouchStart('left')}
            onMouseUp={handleTouchEnd('left')}
            onMouseLeave={handleTouchEnd('left')}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border-2 border-cyan-400/30 active:border-cyan-400 active:scale-95 transition-all select-none touch-none"
            style={{ boxShadow: '0 0 15px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.1)' }}
          >
            <span className="text-2xl md:text-3xl text-cyan-400">◀</span>
          </button>
          <button
            onTouchStart={handleTouchStart('right')}
            onTouchEnd={handleTouchEnd('right')}
            onMouseDown={handleTouchStart('right')}
            onMouseUp={handleTouchEnd('right')}
            onMouseLeave={handleTouchEnd('right')}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border-2 border-cyan-400/30 active:border-cyan-400 active:scale-95 transition-all select-none touch-none"
            style={{ boxShadow: '0 0 15px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.1)' }}
          >
            <span className="text-2xl md:text-3xl text-cyan-400">▶</span>
          </button>
        </div>

        {/* Right side - Throttle/Brake */}
        <div className="pointer-events-auto flex flex-col gap-2">
          <button
            onTouchStart={handleTouchStart('forward')}
            onTouchEnd={handleTouchEnd('forward')}
            onMouseDown={handleTouchStart('forward')}
            onMouseUp={handleTouchEnd('forward')}
            onMouseLeave={handleTouchEnd('forward')}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-600 to-green-900 flex items-center justify-center border-2 border-green-400/30 active:border-green-400 active:scale-95 transition-all select-none touch-none"
            style={{ boxShadow: '0 0 15px rgba(0,255,0,0.3), inset 0 2px 10px rgba(255,255,255,0.1)' }}
          >
            <span className="text-xl md:text-2xl text-green-300 font-bold">GAS</span>
          </button>
          <button
            onTouchStart={handleTouchStart('backward')}
            onTouchEnd={handleTouchEnd('backward')}
            onMouseDown={handleTouchStart('backward')}
            onMouseUp={handleTouchEnd('backward')}
            onMouseLeave={handleTouchEnd('backward')}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center border-2 border-red-400/30 active:border-red-400 active:scale-95 transition-all select-none touch-none"
            style={{ boxShadow: '0 0 15px rgba(255,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.1)' }}
          >
            <span className="text-lg md:text-xl text-red-300 font-bold">BRAKE</span>
          </button>
        </div>
      </div>
    </div>
  )
}
