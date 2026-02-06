import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox, Plane, Sky, Stars, Float, MeshWobbleMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface PlayerCarProps {
  position: [number, number, number]
  rotation: number
  color: string
  onMove: (pos: [number, number, number], rot: number) => void
  controls: { forward: boolean; backward: boolean; left: boolean; right: boolean }
}

function PlayerCar({ position, rotation, color, onMove, controls }: PlayerCarProps) {
  const carRef = useRef<THREE.Group>(null!)
  const [velocity, setVelocity] = useState(0)
  const [pos, setPos] = useState<[number, number, number]>(position)
  const [rot, setRot] = useState(rotation)

  useFrame((_, delta) => {
    if (!carRef.current) return

    let newVelocity = velocity
    let newRot = rot

    // Acceleration / Braking
    if (controls.forward) {
      newVelocity = Math.min(velocity + delta * 8, 15)
    } else if (controls.backward) {
      newVelocity = Math.max(velocity - delta * 12, -5)
    } else {
      // Friction
      newVelocity = velocity * 0.98
      if (Math.abs(newVelocity) < 0.1) newVelocity = 0
    }

    // Steering
    if (Math.abs(velocity) > 0.5) {
      const steerAmount = delta * 2.5 * Math.sign(velocity)
      if (controls.left) newRot += steerAmount
      if (controls.right) newRot -= steerAmount
    }

    // Update position
    const newX = pos[0] + Math.sin(newRot) * newVelocity * delta
    const newZ = pos[2] + Math.cos(newRot) * newVelocity * delta

    // Boundary check (keep car in city bounds)
    const boundedX = Math.max(-45, Math.min(45, newX))
    const boundedZ = Math.max(-45, Math.min(45, newZ))

    const newPos: [number, number, number] = [boundedX, 0.3, boundedZ]

    setVelocity(newVelocity)
    setPos(newPos)
    setRot(newRot)

    carRef.current.position.set(...newPos)
    carRef.current.rotation.y = newRot

    onMove(newPos, newRot)
  })

  return (
    <group ref={carRef} position={position}>
      {/* Car body */}
      <RoundedBox args={[1.2, 0.4, 2.4]} radius={0.1} position={[0, 0.2, 0]}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      {/* Roof */}
      <RoundedBox args={[1, 0.35, 1.2]} radius={0.08} position={[0, 0.55, -0.2]}>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </RoundedBox>
      {/* Windows */}
      <mesh position={[0, 0.5, 0.35]}>
        <boxGeometry args={[0.9, 0.25, 0.05]} />
        <meshStandardMaterial color="#111122" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Headlights */}
      <mesh position={[0.4, 0.2, 1.2]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.4, 0.2, 1.2]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={2} />
      </mesh>
      {/* Taillights */}
      <mesh position={[0.4, 0.2, -1.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-0.4, 0.2, -1.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.5} />
      </mesh>
      {/* Wheels */}
      {[[-0.55, 0, 0.7], [0.55, 0, 0.7], [-0.55, 0, -0.7], [0.55, 0, -0.7]].map((wheelPos, i) => (
        <mesh key={i} position={wheelPos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Building({ position, height, width, depth, color }: { position: [number, number, number]; height: number; width: number; depth: number; color: string }) {
  const windowRows = Math.floor(height / 1.5)
  const windowCols = Math.floor(width / 1.2)

  return (
    <group position={position}>
      <RoundedBox args={[width, height, depth]} radius={0.1} position={[0, height / 2, 0]}>
        <meshStandardMaterial color={color} roughness={0.7} />
      </RoundedBox>
      {/* Windows */}
      {Array.from({ length: windowRows }).map((_, row) =>
        Array.from({ length: windowCols }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[
              -width / 2 + 0.6 + col * 1.2,
              1 + row * 1.5,
              depth / 2 + 0.01
            ]}
          >
            <planeGeometry args={[0.6, 0.8]} />
            <meshStandardMaterial
              color="#ffee66"
              emissive="#ffcc00"
              emissiveIntensity={Math.random() > 0.3 ? 0.8 : 0}
            />
          </mesh>
        ))
      )}
    </group>
  )
}

function NeonSign({ position, text, color }: { position: [number, number, number]; text: string; color: string }) {
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
      <Text
        position={position}
        fontSize={1.5}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
      >
        {text}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </Text>
    </Float>
  )
}

function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 5, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.8} />
      </mesh>
      <mesh position={[0, 5.2, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={3} />
      </mesh>
      <pointLight position={[0, 5, 0]} color="#ffdd88" intensity={8} distance={15} />
    </group>
  )
}

interface CashPickupProps {
  position: [number, number, number]
  onCollect: () => void
}

function CashPickup({ position, onCollect }: CashPickupProps) {
  const ref = useRef<THREE.Mesh>(null!)
  const [collected, setCollected] = useState(false)

  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.y = state.clock.elapsedTime * 2
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.2
    }
  })

  if (collected) return null

  return (
    <mesh
      ref={ref}
      position={position}
      onClick={() => {
        setCollected(true)
        onCollect()
      }}
    >
      <boxGeometry args={[0.6, 0.4, 0.1]} />
      <meshStandardMaterial color="#22cc44" emissive="#00ff00" emissiveIntensity={1} />
    </mesh>
  )
}

interface MissionMarkerProps {
  position: [number, number, number]
  type: string
  active: boolean
  onActivate: () => void
}

function MissionMarker({ position, type, active, onActivate }: MissionMarkerProps) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }
  })

  const color = type === 'heist' ? '#ff00ff' : type === 'race' ? '#00ffff' : '#ffff00'

  return (
    <group position={position}>
      {/* Marker pillar */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.5} />
      </mesh>
      {/* Rotating icon */}
      <mesh ref={ref} position={[0, 3.5, 0]} onClick={onActivate}>
        {type === 'heist' ? (
          <octahedronGeometry args={[0.5]} />
        ) : type === 'race' ? (
          <coneGeometry args={[0.4, 0.8, 4]} />
        ) : (
          <torusGeometry args={[0.4, 0.15, 8, 16]} />
        )}
        <MeshWobbleMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 3 : 1}
          factor={0.3}
          speed={2}
        />
      </mesh>
      {/* Ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.8, 1.5, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

function PoliceCar({ targetPos }: { targetPos: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null!)
  const [pos, setPos] = useState<[number, number, number]>([
    Math.random() * 80 - 40,
    0.3,
    Math.random() * 80 - 40
  ])
  const [rot, setRot] = useState(0)
  const sirenRef = useRef<THREE.PointLight>(null!)

  useFrame((state, delta) => {
    if (!ref.current) return

    // Chase player
    const dx = targetPos[0] - pos[0]
    const dz = targetPos[2] - pos[2]
    const targetRot = Math.atan2(dx, dz)

    // Smooth rotation
    let newRot = rot
    const rotDiff = targetRot - rot
    newRot += Math.sign(rotDiff) * Math.min(Math.abs(rotDiff), delta * 2)

    // Move towards player
    const speed = 8
    const newX = pos[0] + Math.sin(newRot) * speed * delta
    const newZ = pos[2] + Math.cos(newRot) * speed * delta

    setPos([newX, 0.3, newZ])
    setRot(newRot)

    ref.current.position.set(newX, 0.3, newZ)
    ref.current.rotation.y = newRot

    // Siren flash
    if (sirenRef.current) {
      sirenRef.current.color.setHSL((state.clock.elapsedTime * 4) % 1 > 0.5 ? 0 : 0.6, 1, 0.5)
    }
  })

  return (
    <group ref={ref}>
      {/* Car body */}
      <RoundedBox args={[1.3, 0.45, 2.6]} radius={0.1} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
      </RoundedBox>
      {/* Police markings */}
      <mesh position={[0, 0.43, 0]}>
        <boxGeometry args={[1.25, 0.02, 2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Siren */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.8, 0.15, 0.3]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      <pointLight ref={sirenRef} position={[0, 0.8, 0]} intensity={5} distance={20} color="#ff0000" />
    </group>
  )
}

interface GameSceneProps {
  playerColor: string
  onCashCollect: () => void
  onMissionStart: (type: string) => void
  wantedLevel: number
  playerPos: [number, number, number]
  setPlayerPos: (pos: [number, number, number]) => void
  controls: { forward: boolean; backward: boolean; left: boolean; right: boolean }
}

export default function GameScene({
  playerColor,
  onCashCollect,
  onMissionStart,
  wantedLevel,
  playerPos,
  setPlayerPos,
  controls
}: GameSceneProps) {
  const [playerRot, setPlayerRot] = useState(0)
  const [cashPickups, setCashPickups] = useState<[number, number, number][]>([
    [5, 0.5, 5], [-10, 0.5, 8], [15, 0.5, -12], [-8, 0.5, -15], [20, 0.5, 20]
  ])

  const buildings = useMemo(() => [
    { position: [-15, 0, -15] as [number, number, number], height: 12, width: 6, depth: 6, color: '#2a2a4a' },
    { position: [15, 0, -15] as [number, number, number], height: 18, width: 8, depth: 8, color: '#3a2a3a' },
    { position: [-15, 0, 15] as [number, number, number], height: 15, width: 7, depth: 7, color: '#2a3a4a' },
    { position: [15, 0, 15] as [number, number, number], height: 10, width: 5, depth: 5, color: '#4a2a2a' },
    { position: [-25, 0, 0] as [number, number, number], height: 20, width: 8, depth: 8, color: '#2a2a3a' },
    { position: [25, 0, 0] as [number, number, number], height: 14, width: 6, depth: 6, color: '#3a3a4a' },
    { position: [0, 0, -25] as [number, number, number], height: 16, width: 10, depth: 6, color: '#2a4a4a' },
    { position: [0, 0, 25] as [number, number, number], height: 22, width: 9, depth: 9, color: '#4a3a4a' },
    { position: [-30, 0, -30] as [number, number, number], height: 25, width: 10, depth: 10, color: '#3a2a4a' },
    { position: [30, 0, 30] as [number, number, number], height: 28, width: 12, depth: 8, color: '#2a3a3a' },
  ], [])

  const handleCollectCash = (index: number) => {
    setCashPickups(prev => prev.filter((_, i) => i !== index))
    onCashCollect()
    // Respawn cash after delay
    setTimeout(() => {
      setCashPickups(prev => [...prev, [
        Math.random() * 60 - 30,
        0.5,
        Math.random() * 60 - 30
      ]])
    }, 5000)
  }

  const handleMove = (pos: [number, number, number], rot: number) => {
    setPlayerPos(pos)
    setPlayerRot(rot)
  }

  return (
    <>
      {/* Sky and atmosphere */}
      <Sky sunPosition={[100, 10, 100]} turbidity={10} rayleigh={0.5} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade />
      <fog attach="fog" args={['#0a0a1a', 30, 100]} />

      {/* Ambient lighting */}
      <ambientLight intensity={0.15} color="#6666aa" />
      <directionalLight position={[50, 50, 25]} intensity={0.3} color="#ffddaa" castShadow />

      {/* Ground */}
      <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
      </Plane>

      {/* Roads */}
      <Plane args={[8, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} />
      </Plane>
      <Plane args={[100, 8]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} />
      </Plane>

      {/* Road markings */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`mark-v-${i}`} position={[0, 0.02, -45 + i * 5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 2]} />
          <meshStandardMaterial color="#ffff44" emissive="#ffff00" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`mark-h-${i}`} position={[-45 + i * 5, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[0.3, 2]} />
          <meshStandardMaterial color="#ffff44" emissive="#ffff00" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Buildings */}
      {buildings.map((building, i) => (
        <Building key={i} {...building} />
      ))}

      {/* Neon signs */}
      <NeonSign position={[-15, 14, -15]} text="VICE" color="#ff00ff" />
      <NeonSign position={[15, 20, -15]} text="NEON" color="#00ffff" />
      <NeonSign position={[0, 24, 25]} text="CITY" color="#ff6600" />

      {/* Street lamps */}
      {[[-4, 0, -20], [4, 0, -20], [-4, 0, 20], [4, 0, 20], [-20, 0, -4], [-20, 0, 4], [20, 0, -4], [20, 0, 4]].map((pos, i) => (
        <StreetLamp key={i} position={pos as [number, number, number]} />
      ))}

      {/* Player car */}
      <PlayerCar
        position={playerPos}
        rotation={playerRot}
        color={playerColor}
        onMove={handleMove}
        controls={controls}
      />

      {/* Cash pickups */}
      {cashPickups.map((pos, i) => (
        <CashPickup key={i} position={pos} onCollect={() => handleCollectCash(i)} />
      ))}

      {/* Mission markers */}
      <MissionMarker position={[-20, 0, -20]} type="heist" active={false} onActivate={() => onMissionStart('heist')} />
      <MissionMarker position={[20, 0, -20]} type="race" active={false} onActivate={() => onMissionStart('race')} />
      <MissionMarker position={[0, 0, 30]} type="delivery" active={false} onActivate={() => onMissionStart('delivery')} />

      {/* Police cars based on wanted level */}
      {Array.from({ length: wantedLevel }).map((_, i) => (
        <PoliceCar key={i} targetPos={playerPos} />
      ))}
    </>
  )
}
