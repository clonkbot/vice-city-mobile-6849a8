import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

interface PlayerData {
  _id: Id<"players">
  name: string
  cash: number
  respect: number
  wantedLevel: number
  totalMissions: number
  totalCrimes: number
  carColor: string
}

interface GameUIProps {
  player: PlayerData | null
  onColorChange: (color: string) => void
  showLeaderboard: boolean
  setShowLeaderboard: (show: boolean) => void
  activeMission: string | null
  missionProgress: number
}

const CAR_COLORS = [
  { name: 'Neon Pink', color: '#ff00ff' },
  { name: 'Cyber Blue', color: '#00ffff' },
  { name: 'Toxic Green', color: '#00ff00' },
  { name: 'Sunset Orange', color: '#ff6600' },
  { name: 'Blood Red', color: '#ff0033' },
  { name: 'Royal Purple', color: '#9933ff' },
  { name: 'Gold Rush', color: '#ffcc00' },
  { name: 'Midnight', color: '#1a1a3a' },
]

function WantedStars({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-xl transition-all duration-300 ${
            i < level ? 'text-yellow-400 scale-110 animate-pulse' : 'text-gray-600'
          }`}
          style={{ textShadow: i < level ? '0 0 10px #ffd700' : 'none' }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function MiniMap({ playerPos }: { playerPos: [number, number, number] }) {
  const mapSize = 80
  const scale = 1.1

  return (
    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-cyan-400/50 bg-gray-900/80">
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400" />
      </div>
      {/* Player dot */}
      <div
        className="absolute w-2 h-2 bg-pink-500 rounded-full shadow-lg animate-pulse"
        style={{
          left: `${50 + (playerPos[0] / mapSize) * scale * 50}%`,
          top: `${50 - (playerPos[2] / mapSize) * scale * 50}%`,
          boxShadow: '0 0 8px #ff00ff',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Mission markers */}
      <div
        className="absolute w-1.5 h-1.5 bg-purple-500 rounded-full"
        style={{
          left: `${50 + (-20 / mapSize) * scale * 50}%`,
          top: `${50 - (-20 / mapSize) * scale * 50}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full"
        style={{
          left: `${50 + (20 / mapSize) * scale * 50}%`,
          top: `${50 - (-20 / mapSize) * scale * 50}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
        style={{
          left: `${50 + (0 / mapSize) * scale * 50}%`,
          top: `${50 - (30 / mapSize) * scale * 50}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}

function Leaderboard({ onClose }: { onClose: () => void }) {
  const leaderboard = useQuery(api.leaderboard.getTop)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl p-6 max-w-sm w-full border border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
            TOP PLAYERS
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="space-y-2">
          {leaderboard === undefined ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No players yet</div>
          ) : (
            leaderboard.map((entry, i) => (
              <div
                key={entry._id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  i === 0 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                  i === 1 ? 'bg-gray-400/20 border border-gray-400/30' :
                  i === 2 ? 'bg-orange-600/20 border border-orange-600/30' :
                  'bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${
                    i === 0 ? 'text-yellow-400' :
                    i === 1 ? 'text-gray-300' :
                    i === 2 ? 'text-orange-400' :
                    'text-gray-500'
                  }`}>
                    #{i + 1}
                  </span>
                  <span className="text-white font-medium truncate max-w-[120px]">
                    {entry.playerName}
                  </span>
                </div>
                <span className="text-cyan-400 font-bold">{entry.score}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ColorPicker({ currentColor, onSelect, onClose }: { currentColor: string; onSelect: (color: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-pink-900/30 to-gray-900 rounded-2xl p-6 max-w-sm w-full border border-pink-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-400">
            CHOOSE YOUR RIDE
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {CAR_COLORS.map(({ name, color }) => (
            <button
              key={color}
              onClick={() => {
                onSelect(color)
                onClose()
              }}
              className={`aspect-square rounded-lg border-2 transition-all ${
                currentColor === color
                  ? 'border-white scale-110 shadow-lg'
                  : 'border-transparent hover:border-white/50 hover:scale-105'
              }`}
              style={{ backgroundColor: color, boxShadow: currentColor === color ? `0 0 20px ${color}` : 'none' }}
              title={name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function GameUI({
  player,
  onColorChange,
  showLeaderboard,
  setShowLeaderboard,
  activeMission,
  missionProgress,
}: GameUIProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const recentCrimes = useQuery(api.crimes.getRecent)

  return (
    <>
      {/* Top HUD */}
      <div className="fixed top-0 left-0 right-0 p-3 md:p-4 pointer-events-none z-10">
        <div className="flex justify-between items-start gap-2">
          {/* Left: Stats */}
          <div className="pointer-events-auto bg-black/60 backdrop-blur-md rounded-xl p-3 md:p-4 border border-cyan-500/20">
            <div className="flex flex-col gap-1 md:gap-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-lg md:text-2xl">$</span>
                <span className="text-white font-bold text-lg md:text-2xl tracking-wider">
                  {player?.cash.toLocaleString() ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-xs md:text-sm">RESPECT</span>
                <span className="text-white font-bold text-sm md:text-base">{player?.respect ?? 0}</span>
              </div>
              <WantedStars level={player?.wantedLevel ?? 0} />
            </div>
          </div>

          {/* Right: Mini map */}
          <div className="pointer-events-auto">
            <MiniMap playerPos={[0, 0, 0]} />
          </div>
        </div>
      </div>

      {/* Active Mission Banner */}
      {activeMission && (
        <div className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-md rounded-full px-4 md:px-6 py-2 border border-white/20">
            <div className="text-center">
              <div className="text-white font-bold text-xs md:text-sm uppercase tracking-wider">
                {activeMission} IN PROGRESS
              </div>
              <div className="w-32 md:w-48 h-1.5 bg-black/50 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 transition-all duration-300"
                  style={{ width: `${missionProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crime Feed */}
      <div className="fixed top-32 md:top-28 right-3 md:right-4 z-10 pointer-events-none max-w-[200px] md:max-w-xs">
        <div className="space-y-1">
          {recentCrimes?.slice(0, 3).map((crime) => (
            <div
              key={crime._id}
              className="bg-red-900/60 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1.5 text-xs border border-red-500/30 animate-pulse"
            >
              <span className="text-red-300 font-bold">{crime.playerName}</span>
              <span className="text-red-200"> {crime.crimeType}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-16 md:bottom-20 left-0 right-0 px-3 md:px-4 z-10 pointer-events-none">
        <div className="flex justify-between items-end">
          {/* Action buttons */}
          <div className="pointer-events-auto flex flex-col gap-2">
            <button
              onClick={() => setShowColorPicker(true)}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center border-2 border-white/20 shadow-lg active:scale-95 transition-transform"
              style={{ boxShadow: '0 0 20px rgba(255,0,255,0.5)' }}
            >
              <span className="text-xl md:text-2xl">🎨</span>
            </button>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border-2 border-white/20 shadow-lg active:scale-95 transition-transform"
              style={{ boxShadow: '0 0 20px rgba(0,255,255,0.5)' }}
            >
              <span className="text-xl md:text-2xl">🏆</span>
            </button>
          </div>

          {/* Mission hints */}
          <div className="pointer-events-auto bg-black/60 backdrop-blur-md rounded-xl p-2 md:p-3 border border-yellow-500/20 max-w-[150px] md:max-w-xs">
            <div className="text-yellow-400 text-[10px] md:text-xs font-bold mb-1">MISSIONS</div>
            <div className="space-y-1 text-[10px] md:text-xs">
              <div className="flex items-center gap-1 md:gap-2 text-purple-300">
                <span>◆</span> Heist
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-cyan-300">
                <span>▲</span> Race
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-yellow-300">
                <span>○</span> Delivery
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {showColorPicker && (
        <ColorPicker
          currentColor={player?.carColor ?? '#ff00ff'}
          onSelect={onColorChange}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </>
  )
}
