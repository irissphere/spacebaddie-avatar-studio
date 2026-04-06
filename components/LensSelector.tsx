'use client'

interface LensSelectorProps {
  lens: string
  onChange: (lens: string) => void
}

export function LensSelector({ lens, onChange }: LensSelectorProps) {
  const lensPresets = [
    {
      id: 'gaming',
      name: '🎮 Gaming',
      description: 'High contrast, vibrant colors for streaming',
      colors: 'from-green-500 to-blue-600',
      preview: 'Pixel-perfect for gaming content'
    },
    {
      id: 'cinematic',
      name: '🎥 Cinematic',
      description: 'Film-like look with rich tones',
      colors: 'from-orange-500 to-red-600',
      preview: 'Professional video production'
    },
    {
      id: 'anime',
      name: '🎭 Anime',
      description: 'Stylized look with enhanced colors',
      colors: 'from-pink-500 to-purple-600',
      preview: 'Perfect for character art'
    },
    {
      id: 'vintage',
      name: '📽️ Vintage',
      description: 'Retro film aesthetic',
      colors: 'from-yellow-500 to-brown-600',
      preview: 'Classic cinematic feel'
    },
    {
      id: 'cyberpunk',
      name: '⚡ Cyberpunk',
      description: 'Neon glows and high contrast',
      colors: 'from-cyan-500 to-magenta-600',
      preview: 'Future tech aesthetics'
    },
    {
      id: 'portrait',
      name: '📸 Portrait',
      description: 'Soft, flattering skin tones',
      colors: 'from-rose-500 to-pink-600',
      preview: 'Professional headshots'
    }
  ]

  const currentLens = lensPresets.find(p => p.id === lens) || lensPresets[0]

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-pink-500/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-pink-400 mb-4 flex items-center gap-2">
        📷 Lens Selector
        <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
      </h3>

      {/* Current Lens Display */}
      <div className={`mb-6 p-4 bg-gradient-to-r ${currentLens.colors} rounded-lg border border-white/20`}>
        <div className="text-white font-semibold text-lg">{currentLens.name}</div>
        <div className="text-white/80 text-sm mt-1">{currentLens.description}</div>
        <div className="text-white/60 text-xs mt-2">{currentLens.preview}</div>
      </div>

      {/* Lens Grid */}
      <div className="grid grid-cols-2 gap-3">
        {lensPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onChange(preset.id)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
              lens === preset.id
                ? `bg-gradient-to-r ${preset.colors} border-white/50 shadow-lg shadow-white/20`
                : `bg-gradient-to-r ${preset.colors}/20 border-${preset.colors.split('-')[1]}-500/30 hover:border-${preset.colors.split('-')[1]}-500/50`
            }`}
          >
            <div className={`font-semibold text-sm ${lens === preset.id ? 'text-white' : 'text-white/80'}`}>
              {preset.name}
            </div>
            <div className={`text-xs mt-1 ${lens === preset.id ? 'text-white/80' : 'text-white/60'}`}>
              {preset.preview}
            </div>
          </button>
        ))}
      </div>

      {/* Lens Effects Preview */}
      <div className="mt-6 p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg">
        <div className="text-sm text-pink-300 mb-2">🔮 Lens Effects</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-pink-200/70">
            <div>🎨 Color grading</div>
            <div>📊 Contrast boost</div>
          </div>
          <div className="text-pink-200/70">
            <div>✨ Sharpening</div>
            <div>🌟 Glow effects</div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
        <div className="text-xs text-cyan-300 space-y-1">
          <div className="font-semibold">💡 Pro Tips:</div>
          <div>• Gaming lens for streaming</div>
          <div>• Cinematic for professional videos</div>
          <div>• Cyberpunk for futuristic looks</div>
        </div>
      </div>
    </div>
  )
}







