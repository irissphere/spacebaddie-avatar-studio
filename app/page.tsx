'use client'

import { useState, useEffect } from 'react'
import { AvatarStudio } from '@/components/AvatarStudio'
import { CameraControls } from '@/components/CameraControls'
import { EffectPanel } from '@/components/EffectPanel'
import { LensSelector } from '@/components/LensSelector'

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

export default function Home() {
  const [studioState, setStudioState] = useState<StudioState>({
    camera: { x: 0, y: 0, zoom: 1 },
    effects: { brightness: 0, contrast: 0, saturation: 0, hue: 0 },
    lens: 'gaming'
  })

  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([])

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 6
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Particles */}
      <div className="particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              width: '2px',
              height: '2px'
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold neon-glow text-cyan-400">SPACEBADDIE</h1>
              <p className="text-sm text-cyan-300/70">Avatar Forge</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-cyan-300">Live Studio</div>
              <div className="text-xs text-cyan-400/60">spacebaddy.com</div>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent neon-glow">
            AVATAR FORGE
          </h2>
          <p className="text-xl md:text-2xl text-cyan-300 mb-8 max-w-3xl mx-auto">
            Craft legendary gaming avatars with real-time effects and AI-powered controls
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-full px-6 py-2 text-cyan-300">
              ⚡ Real-Time Effects
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-full px-6 py-2 text-purple-300">
              🤖 AI Suggestions
            </div>
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-full px-6 py-2 text-pink-300">
              🎮 Gaming Optimized
            </div>
          </div>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Avatar Display */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-8 cyber-grid">
              <AvatarStudio state={studioState} />

              {/* Quick Actions */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg shadow-cyan-500/25">
                  📹 Record Video
                </button>
                <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25">
                  📸 Screenshot
                </button>
                <button className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-500/25">
                  💾 Save Avatar
                </button>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <CameraControls
              camera={studioState.camera}
              onChange={(camera) => setStudioState(prev => ({ ...prev, camera }))}
            />

            <EffectPanel
              effects={studioState.effects}
              onChange={(effects) => setStudioState(prev => ({ ...prev, effects }))}
            />

            <LensSelector
              lens={studioState.lens}
              onChange={(lens) => setStudioState(prev => ({ ...prev, lens }))}
            />
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">∞</div>
            <div className="text-sm text-cyan-300/70">Avatars Created</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">24/7</div>
            <div className="text-sm text-purple-300/70">Live Studio</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">AI</div>
            <div className="text-sm text-green-300/70">Powered</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">⚡</div>
            <div className="text-sm text-orange-300/70">Real-Time</div>
          </div>
        </div>
      </main>
    </div>
  )
}
