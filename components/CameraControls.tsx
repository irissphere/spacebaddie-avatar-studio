'use client'

import { useState } from 'react'

interface CameraControlsProps {
  camera: {
    x: number
    y: number
    zoom: number
  }
  onChange: (camera: { x: number; y: number; zoom: number }) => void
}

export function CameraControls({ camera, onChange }: CameraControlsProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) / (rect.width / 2)
    const deltaY = (e.clientY - centerY) / (rect.height / 2)

    // Constrain to circle
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const constrainedX = distance > 1 ? deltaX / distance : deltaX
    const constrainedY = distance > 1 ? deltaY / distance : deltaY

    onChange({
      ...camera,
      x: constrainedX,
      y: constrainedY
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetCamera = () => {
    onChange({ x: 0, y: 0, zoom: 1 })
  }

  const presetPositions = [
    { name: 'Front', x: 0, y: 0 },
    { name: 'Left', x: -1, y: 0 },
    { name: 'Right', x: 1, y: 0 },
    { name: 'Top', x: 0, y: -1 },
    { name: 'Bottom', x: 0, y: 1 }
  ]

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
        🎮 Camera Control
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </h3>

      {/* Joystick */}
      <div className="mb-6">
        <div
          className="relative w-32 h-32 mx-auto bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 rounded-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid lines */}
          <div className="absolute inset-4 border border-cyan-500/30 rounded-full"></div>
          <div className="absolute inset-8 border border-cyan-500/20 rounded-full"></div>

          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

          {/* Joystick indicator */}
          <div
            className="absolute w-4 h-4 bg-cyan-400 rounded-full border-2 border-white shadow-lg transition-all duration-75"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(${camera.x * 40 - 8}px, ${camera.y * 40 - 8}px)`
            }}
          ></div>
        </div>

        <div className="text-center mt-2 text-sm text-cyan-300/70">
          Drag to orbit camera
        </div>
      </div>

      {/* Zoom Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-cyan-300 mb-2">
          🔍 Zoom Level
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={camera.zoom}
          onChange={(e) => onChange({ ...camera, zoom: parseFloat(e.target.value) })}
          className="w-full h-2 bg-cyan-500/20 rounded-lg appearance-none cursor-pointer slider-cyan"
        />
        <div className="text-center mt-1 text-sm text-cyan-400">
          {camera.zoom.toFixed(1)}x
        </div>
      </div>

      {/* Preset Positions */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-cyan-300 mb-2">
          🎯 Quick Positions
        </label>
        <div className="grid grid-cols-2 gap-2">
          {presetPositions.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onChange({ ...camera, x: preset.x, y: preset.y })}
              className="px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-300 text-sm transition-all duration-200 hover:border-cyan-500/50"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetCamera}
        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-4 py-2 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/25"
      >
        🔄 Reset Camera
      </button>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-cyan-500/20">
        <div className="text-xs text-cyan-300/60 space-y-1">
          <div>X: {camera.x.toFixed(2)}</div>
          <div>Y: {camera.y.toFixed(2)}</div>
          <div>Zoom: {camera.zoom.toFixed(1)}x</div>
        </div>
      </div>
    </div>
  )
}
