'use client'

interface EffectPanelProps {
  effects: {
    brightness: number
    contrast: number
    saturation: number
    hue: number
  }
  onChange: (effects: {
    brightness: number
    contrast: number
    saturation: number
    hue: number
  }) => void
}

export function EffectPanel({ effects, onChange }: EffectPanelProps) {
  const resetEffects = () => {
    onChange({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0
    })
  }

  const effectConfigs = [
    {
      key: 'brightness' as keyof typeof effects,
      label: '☀️ Brightness',
      min: -100,
      max: 100,
      step: 5,
      color: 'from-yellow-500 to-orange-600'
    },
    {
      key: 'contrast' as keyof typeof effects,
      label: '🔆 Contrast',
      min: -100,
      max: 100,
      step: 5,
      color: 'from-red-500 to-pink-600'
    },
    {
      key: 'saturation' as keyof typeof effects,
      label: '🌈 Saturation',
      min: -100,
      max: 100,
      step: 5,
      color: 'from-purple-500 to-indigo-600'
    },
    {
      key: 'hue' as keyof typeof effects,
      label: '🎨 Hue Shift',
      min: -180,
      max: 180,
      step: 10,
      color: 'from-green-500 to-teal-600'
    }
  ]

  const activeEffects = Object.values(effects).filter(v => v !== 0).length

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
          ⚡ Visual Effects
          <div className={`w-2 h-2 rounded-full ${activeEffects > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
        </h3>
        <button
          onClick={resetEffects}
          className="text-xs bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded px-2 py-1 text-purple-300 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {effectConfigs.map((config) => (
          <div key={config.key}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-purple-300">
                {config.label}
              </label>
              <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                {effects[config.key]}
              </span>
            </div>

            <input
              type="range"
              min={config.min}
              max={config.max}
              step={config.step}
              value={effects[config.key]}
              onChange={(e) => onChange({
                ...effects,
                [config.key]: parseInt(e.target.value)
              })}
              className={`w-full h-2 bg-gradient-to-r ${config.color} rounded-lg appearance-none cursor-pointer`}
            />

            <div className="flex justify-between text-xs text-purple-300/60 mt-1">
              <span>{config.min}</span>
              <span>{config.max}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Effect Preview */}
      <div className="mt-6 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
        <div className="text-sm text-purple-300 mb-2">🎨 Active Effects</div>
        <div className="text-xs text-purple-200/70 space-y-1">
          {activeEffects === 0 ? (
            <div className="text-purple-400/50">No effects applied</div>
          ) : (
            <>
              {effects.brightness !== 0 && (
                <div>Brightness: {effects.brightness > 0 ? '+' : ''}{effects.brightness}</div>
              )}
              {effects.contrast !== 0 && (
                <div>Contrast: {effects.contrast > 0 ? '+' : ''}{effects.contrast}</div>
              )}
              {effects.saturation !== 0 && (
                <div>Saturation: {effects.saturation > 0 ? '+' : ''}{effects.saturation}</div>
              )}
              {effects.hue !== 0 && (
                <div>Hue: {effects.hue > 0 ? '+' : ''}{effects.hue}°</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-purple-500/20">
        <div className="text-xs text-purple-300/60 text-center">
          ⚡ {activeEffects} effects active • Real-time processing
        </div>
      </div>
    </div>
  )
}
