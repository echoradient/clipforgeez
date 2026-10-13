import React, { useState } from 'react';
import { Type, Volume2, VolumeX, Eye, Shield, Sliders, ChevronDown } from 'lucide-react';
import { TikTokSettings } from '../../types';

interface ShortEnhancementsPanelProps {
  settings: TikTokSettings;
  onChangeSettings: (updates: Partial<TikTokSettings>) => void;
  isProcessing?: boolean;
}

export const ShortEnhancementsPanel: React.FC<ShortEnhancementsPanelProps> = ({
  settings,
  onChangeSettings,
  isProcessing = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header Accordion Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Type className="w-5 h-5 text-cyan-400" />
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">
              Short Video Enhancements
            </h4>
            <p className="text-xs text-slate-400">
              Optional overlays, TikTok safe zone guide, and audio controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(settings.titleText || settings.captionText || settings.showSafeZone || settings.audioMode === 'mute') && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Active
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-pink-400' : ''
            }`}
          />
        </div>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="p-5 pt-0 space-y-5 border-t border-slate-800/80">
          {/* Safe Zone Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b0f19]/70 border border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-pink-400" />
              <div>
                <span className="text-xs font-bold text-white block">
                  TikTok UI Safe Zone Guides
                </span>
                <span className="text-[11px] text-slate-400">
                  Highlight areas covered by like buttons, sound, and username
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showSafeZone}
                onChange={(e) => onChangeSettings({ showSafeZone: e.target.checked })}
                disabled={isProcessing}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600" />
            </label>
          </div>

          {/* Text Overlays: Title & Caption */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Top Title Overlay (Header)
              </label>
              <input
                type="text"
                maxLength={45}
                placeholder="e.g. 5 Mind-Blowing Facts..."
                value={settings.titleText}
                onChange={(e) => onChangeSettings({ titleText: e.target.value })}
                disabled={isProcessing}
                className="w-full bg-[#07090e] border border-slate-700 focus:border-pink-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 disabled:opacity-50"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Placed neatly in the top safe zone
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Bottom Caption / Call-To-Action
              </label>
              <input
                type="text"
                maxLength={50}
                placeholder="e.g. Follow for Part 2!"
                value={settings.captionText}
                onChange={(e) => onChangeSettings({ captionText: e.target.value })}
                disabled={isProcessing}
                className="w-full bg-[#07090e] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 disabled:opacity-50"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Placed above the TikTok username zone
              </span>
            </div>
          </div>

          {/* Watermark text */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Watermark / Channel Tag (Optional)
            </label>
            <input
              type="text"
              maxLength={30}
              placeholder="e.g. @your_brand"
              value={settings.watermarkText}
              onChange={(e) => onChangeSettings({ watermarkText: e.target.value })}
              disabled={isProcessing}
              className="w-full bg-[#07090e] border border-slate-700 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 disabled:opacity-50"
            />
          </div>

          {/* Audio Controls */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Audio Track Control
              </span>

              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => onChangeSettings({ audioMode: 'keep' })}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    settings.audioMode === 'keep'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Keep Audio
                </button>
                <button
                  type="button"
                  onClick={() => onChangeSettings({ audioMode: 'mute' })}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    settings.audioMode === 'mute'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mute Audio
                </button>
              </div>
            </div>

            {settings.audioMode === 'keep' && (
              <div className="flex items-center gap-3 bg-[#0b0f19]/70 border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-400 shrink-0">Volume Multiplier:</span>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={settings.volume}
                  onChange={(e) => onChangeSettings({ volume: parseFloat(e.target.value) })}
                  disabled={isProcessing}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <span className="text-xs font-mono font-bold text-emerald-400 w-10 text-right">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
