'use client'

import { useRef, useEffect, useState } from 'react'

interface StudioState {
  camera: {
    x: number
    y: number
    zoom: number
  }
  effects: {
    brightness: number
    contrast: number
    saturation: number
    hue: number
  }
  lens: string
}

interface AvatarStudioProps {
  state: StudioState
}

export function AvatarStudio({ state }: AvatarStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply camera transforms
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(state.camera.zoom, state.camera.zoom)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)
    ctx.translate(state.camera.x * 50, state.camera.y * 50)

    drawCyberpunkAvatar(ctx, canvas.width, canvas.height, state.effects)

    ctx.restore()

    // Draw UI overlay
    drawUIOoverlay(ctx, canvas.width, canvas.height, state)

  }, [state])

  const drawCyberpunkAvatar = (ctx: CanvasRenderingContext2D, width: number, height: number, effects: any) => {
    const centerX = width / 2
    const centerY = height / 2

    // Space background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 400)
    bgGradient.addColorStop(0, '#1a0033')
    bgGradient.addColorStop(1, '#000011')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // Stars
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 2 + 1
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    // Cyberpunk Character
    const bodyGradient = ctx.createLinearGradient(centerX - 100, centerY - 100, centerX + 100, centerY + 200)
    bodyGradient.addColorStop(0, '#00d4ff')
    bodyGradient.addColorStop(0.5, '#9d4edd')
    bodyGradient.addColorStop(1, '#ff0080')
    ctx.fillStyle = bodyGradient

    // Body
    ctx.beginPath()
    ctx.ellipse(centerX, centerY + 50, 80, 120, 0, 0, Math.PI * 2)
    ctx.fill()

    // Head with cybernetic enhancements
    ctx.fillStyle = '#2a2a2a'
    ctx.beginPath()
    ctx.arc(centerX, centerY - 50, 60, 0, Math.PI * 2)
    ctx.fill()

    // Glowing eyes
    ctx.shadowColor = '#00d4ff'
    ctx.shadowBlur = 20
    ctx.fillStyle = '#00d4ff'
    ctx.beginPath()
    ctx.arc(centerX - 25, centerY - 55, 8, 0, Math.PI * 2)
    ctx.arc(centerX + 25, centerY - 55, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // Cybernetic implants
    ctx.strokeStyle = '#ff0080'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(centerX - 40, centerY - 80)
    ctx.lineTo(centerX - 20, centerY - 90)
    ctx.moveTo(centerX + 40, centerY - 80)
    ctx.lineTo(centerX + 20, centerY - 90)
    ctx.stroke()

    // Energy sword
    ctx.fillStyle = '#00ff88'
    ctx.fillRect(centerX - 120, centerY + 20, 20, 100)

    // Energy glow
    ctx.shadowColor = '#00ff88'
    ctx.shadowBlur = 15
    ctx.fillStyle = '#00ff88'
    ctx.fillRect(centerX - 125, centerY + 15, 30, 15)
    ctx.shadowBlur = 0

    // Character name
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px Orbitron, monospace'
    ctx.textAlign = 'center'
    ctx.fillText('CYBER SAMURAI', centerX, centerY + 200)
  }

  const drawUIOoverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, state: StudioState) => {
    // Camera info
    ctx.fillStyle = 'rgba(0, 212, 255, 0.8)'
    ctx.font = '14px Rajdhani, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`🎯 Camera: X:${state.camera.x.toFixed(2)} Y:${state.camera.y.toFixed(2)}`, 20, 40)

    // Effects info
    ctx.fillStyle = 'rgba(157, 78, 221, 0.8)'
    ctx.fillText(`⚡ Effects: ${Object.values(state.effects).filter(v => v !== 0).length} active`, 20, 65)

    // Lens info
    ctx.fillStyle = 'rgba(255, 0, 128, 0.8)'
    ctx.fillText(`📷 Lens: ${state.lens}`, 20, 90)

    // Recording indicator
    if (isRecording) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.9)'
      ctx.fillRect(width - 200, 20, 180, 50)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px Rajdhani, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🔴 RECORDING', width - 110, 50)
    }
  }

  const takeScreenshot = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'cyber-avatar.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  const startRecording = () => {
    setIsRecording(true)
    // Simulate recording for demo
    setTimeout(() => setIsRecording(false), 3000)
  }

  return (
    <div className="relative">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-cyan-400 neon-glow">AVATAR CANVAS</h3>
        <p className="text-cyan-300/70">Real-time rendering with cyberpunk effects</p>
      </div>

      <div className="relative bg-black/50 border-2 border-cyan-500/50 rounded-xl overflow-hidden hologram">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-96 object-contain"
          style={{ aspectRatio: '4/3' }}
        />

        {/* Control hints */}
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3">
          <div className="text-xs text-cyan-300 space-y-1">
            <div className="font-semibold">🎮 CONTROLS:</div>
            <div>• Drag camera to orbit</div>
            <div>• Adjust zoom level</div>
            <div>• Apply real-time effects</div>
            <div>• Switch lens modes</div>
          </div>
        </div>

        {/* Tech stats */}
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-3">
          <div className="text-xs text-purple-300 space-y-1">
            <div>⚡ FPS: 60</div>
            <div>🎨 Effects: {Object.values(state.effects).filter(v => v !== 0).length}</div>
            <div>🔍 Zoom: {(state.camera.zoom * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={takeScreenshot}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-4 py-2 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg shadow-cyan-500/25"
        >
          📸 Capture
        </button>
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${
            isRecording
              ? 'bg-red-600 text-white shadow-red-500/25 animate-pulse'
              : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-purple-500/25'
          }`}
        >
          {isRecording ? '🔴 Recording...' : '🎬 Record'}
        </button>
      </div>
    </div>
  )
}
