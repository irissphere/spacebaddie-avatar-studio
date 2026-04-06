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
              <div className="text-xs text-cyan-400/60">spacebaddie.com</div>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            SPACEBADDIE AVATAR STUDIO
          </h2>
          <p className="text-lg md:text-xl text-cyan-300 mb-6 max-w-2xl mx-auto">
            Create badass gaming avatars with real-time controls & AI effects
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="bg-cyan-500/20 border border-cyan-500/40 rounded-full px-4 py-1 text-cyan-300 text-sm">
              ⚡ LIVE EFFECTS
            </span>
            <span className="bg-purple-500/20 border border-purple-500/40 rounded-full px-4 py-1 text-purple-300 text-sm">
              🎮 GAMER FOCUSED
            </span>
            <span className="bg-pink-500/20 border border-pink-500/40 rounded-full px-4 py-1 text-pink-300 text-sm">
              🚀 INSTANT EXPORT
            </span>
          </div>
        </div>

        {/* Main Avatar Display - CENTERED & PROMINENT */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/10">
            <AvatarStudio state={studioState} />

            {/* Quick Actions - Below Canvas */}
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-5 py-2 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg shadow-cyan-500/25 text-sm">
                🎬 RECORD
              </button>
              <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-5 py-2 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25 text-sm">
                📸 SNAPSHOT
              </button>
              <button className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 px-5 py-2 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-500/25 text-sm">
                💾 SAVE
              </button>
            </div>
          </div>
        </div>

        {/* Control Panels - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* MASSIVE AUTOMATE CTA - CENTER STAGE */}
        <div className="text-center py-12 px-6">
          <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/30 rounded-3xl p-8 mb-8">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              🎯 READY TO GO PRO?
            </h3>
            <p className="text-lg md:text-xl text-cyan-300 mb-6 max-w-3xl mx-auto">
              Transform your creativity into automated content machines. Join creators using AI to scale their gaming empires.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="bg-green-500/20 border border-green-500/40 rounded-full px-4 py-2 text-green-300 text-sm">
                🤖 AI Automation
              </div>
              <div className="bg-blue-500/20 border border-blue-500/40 rounded-full px-4 py-2 text-blue-300 text-sm">
                📈 Scale Instantly
              </div>
              <div className="bg-purple-500/20 border border-purple-500/40 rounded-full px-4 py-2 text-purple-300 text-sm">
                ⚡ Pro Tools
              </div>
            </div>

            <a
              href="https://xom3.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-black text-3xl md:text-4xl px-16 py-8 rounded-3xl shadow-2xl shadow-purple-500/50 transform hover:scale-110 transition-all duration-300 hover:shadow-purple-500/70 animate-pulse border-4 border-white/20"
            >
              🚀 AUTOMATE NOW 🚀
            </a>

            <p className="text-cyan-400 text-lg mt-6 font-semibold">
              → xom3.io ← Your Next Level
            </p>
          </div>
        </div>

        {/* Custom Footer */}
        <div className="text-center py-8 border-t border-cyan-500/20">
          <div className="text-cyan-400/60 text-sm mb-4">
            Built by creators, for creators. SpaceBaddie - Where gaming meets automation.
          </div>
          <div className="flex justify-center items-center gap-4 text-xs text-cyan-300/50">
            <span>⚡ Live Studio</span>
            <span>•</span>
            <span>🎮 Gaming First</span>
            <span>•</span>
            <span>🤖 AI Powered</span>
            <span>•</span>
            <span>🚀 Ready to Scale</span>
          </div>
        </div>
      </main>
    </div>
  )
}
