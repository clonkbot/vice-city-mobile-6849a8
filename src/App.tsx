import { useState, useEffect, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import GameScene from './components/GameScene'
import GameUI from './components/GameUI'
import MobileControls from './components/MobileControls'

function getSessionId() {
  let sessionId = localStorage.getItem('vice-city-session')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('vice-city-session', sessionId)
  }
  return sessionId
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-pulse">
          VICE CITY
        </h1>
        <p className="text-gray-400 text-sm md:text-base">Loading the streets...</p>
        <div className="mt-8 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StartScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState('')

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/80 to-gray-900 flex items-center justify-center z-50 p-4">
      <div className="text-center max-w-md w-full">
        <h1
          className="text-5xl md:text-7xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-500 to-cyan-500"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            textShadow: '0 0 40px rgba(255,0,255,0.5), 0 0 80px rgba(0,255,255,0.3)'
          }}
        >
          VICE CITY
        </h1>
        <p className="text-pink-300 text-lg md:text-xl mb-8 tracking-widest">MOBILE</p>

        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-pink-500/20">
          <input
            type="text"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="w-full bg-gray-800/80 border-2 border-pink-500/30 rounded-xl px-4 py-3 text-white text-center text-lg focus:outline-none focus:border-pink-500 transition-colors placeholder:text-gray-500"
          />

          <button
            onClick={() => onStart(name || `Player_${Math.random().toString(36).slice(2, 6)}`)}
            className="w-full mt-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all active:scale-95"
            style={{ boxShadow: '0 0 30px rgba(255,0,255,0.4)' }}
          >
            START GAME
          </button>

          <div className="mt-6 text-gray-400 text-xs md:text-sm">
            <p className="mb-2">🎮 <span className="text-cyan-400">CONTROLS</span></p>
            <p>Mobile: Use on-screen buttons</p>
            <p>Desktop: WASD or Arrow keys</p>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4 text-2xl">
          <span className="animate-pulse" style={{ animationDelay: '0s' }}>🚗</span>
          <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>💰</span>
          <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>🌃</span>
        </div>
      </div>
    </div>
  )
}

function Game({ sessionId, playerName }: { sessionId: string; playerName: string }) {
  const [controls, setControls] = useState({ forward: false, backward: false, left: false, right: false })
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0.3, 0])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [activeMission, setActiveMission] = useState<string | null>(null)
  const [missionProgress, setMissionProgress] = useState(0)

  // Convex queries and mutations
  const player = useQuery(api.players.get, { sessionId })
  const getOrCreatePlayer = useMutation(api.players.getOrCreate)
  const updateStats = useMutation(api.players.updateStats)
  const updateCarColor = useMutation(api.players.updateCarColor)
  const reportCrime = useMutation(api.crimes.report)
  const logMission = useMutation(api.crimes.logMission)

  // Initialize player
  useEffect(() => {
    getOrCreatePlayer({ sessionId, name: playerName })
  }, [sessionId, playerName, getOrCreatePlayer])

  // Handle cash collection
  const handleCashCollect = useCallback(async () => {
    if (!player) return
    await updateStats({
      playerId: player._id,
      cashDelta: 100 + Math.floor(Math.random() * 100),
      respectDelta: 5,
      wantedDelta: Math.random() > 0.7 ? 1 : 0,
      missionCompleted: false,
      crimeCommitted: true,
    })
    await reportCrime({
      playerId: player._id,
      playerName: player.name,
      crimeType: 'grabbed cash',
      location: 'Downtown',
    })
  }, [player, updateStats, reportCrime])

  // Handle mission start
  const handleMissionStart = useCallback(async (type: string) => {
    if (activeMission || !player) return
    setActiveMission(type)
    setMissionProgress(0)

    // Simulate mission progress
    const interval = setInterval(() => {
      setMissionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    // Complete mission after 5 seconds
    setTimeout(async () => {
      clearInterval(interval)
      const rewards = {
        heist: { cash: 5000, respect: 50 },
        race: { cash: 2000, respect: 30 },
        delivery: { cash: 1000, respect: 20 },
      }
      const reward = rewards[type as keyof typeof rewards] || { cash: 1000, respect: 10 }

      await updateStats({
        playerId: player._id,
        cashDelta: reward.cash,
        respectDelta: reward.respect,
        wantedDelta: type === 'heist' ? 2 : type === 'race' ? 1 : 0,
        missionCompleted: true,
        crimeCommitted: type === 'heist',
      })

      await logMission({
        playerId: player._id,
        missionType: type,
        cashEarned: reward.cash,
        respectEarned: reward.respect,
      })

      await reportCrime({
        playerId: player._id,
        playerName: player.name,
        crimeType: `completed ${type}`,
        location: 'Vice City',
      })

      setActiveMission(null)
      setMissionProgress(0)
    }, 5000)
  }, [activeMission, player, updateStats, logMission, reportCrime])

  // Handle car color change
  const handleColorChange = useCallback(async (color: string) => {
    if (!player) return
    await updateCarColor({ playerId: player._id, color })
  }, [player, updateCarColor])

  return (
    <>
      <div className="fixed inset-0 bg-black">
        <Canvas
          camera={{ position: [0, 15, 20], fov: 60 }}
          shadows
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <GameScene
              playerColor={player?.carColor || '#ff00ff'}
              onCashCollect={handleCashCollect}
              onMissionStart={handleMissionStart}
              wantedLevel={player?.wantedLevel || 0}
              playerPos={playerPos}
              setPlayerPos={setPlayerPos}
              controls={controls}
            />
          </Suspense>
          <OrbitControls
            target={playerPos}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 6}
            maxDistance={40}
            minDistance={10}
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>
      </div>

      <GameUI
        player={player || null}
        onColorChange={handleColorChange}
        showLeaderboard={showLeaderboard}
        setShowLeaderboard={setShowLeaderboard}
        activeMission={activeMission}
        missionProgress={missionProgress}
      />

      <MobileControls onControlChange={setControls} />

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="text-center py-1.5 text-[10px] md:text-xs text-gray-500/60">
          Requested by <span className="text-gray-400/70">@stringer_kade</span> · Built by <span className="text-gray-400/70">@clonkbot</span>
        </div>
      </footer>
    </>
  )
}

export default function App() {
  const [gameState, setGameState] = useState<'loading' | 'start' | 'playing'>('loading')
  const [playerName, setPlayerName] = useState('')
  const sessionId = getSessionId()

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setGameState('start'), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleStart = (name: string) => {
    setPlayerName(name)
    setGameState('playing')
  }

  if (gameState === 'loading') {
    return <LoadingScreen />
  }

  if (gameState === 'start') {
    return <StartScreen onStart={handleStart} />
  }

  return <Game sessionId={sessionId} playerName={playerName} />
}
