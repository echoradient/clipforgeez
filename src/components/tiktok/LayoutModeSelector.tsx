import React from 'react';
import { Crop, Layers, Palette, Monitor, Smartphone, Volume2, VolumeX } from 'lucide-react';
import { TikTokLayoutMode, TikTokResolution, TikTokSettings } from '../../types';

interface LayoutModeSelectorProps {
  settings: TikTokSettings;
  onChangeSettings: (updates: Partial<TikTokSettings>) => void;
  isProcessing?: boolean;
}

export const LayoutModeSelector: React.FC<LayoutModeSelectorProps> = ({
  settings,
  onChangeSettings,
  isProcessing = false,
}) => {
  const layoutModes: {
    id: TikTokLayoutMode;
    title: string;
    badge: string;
    desc: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'smart_crop',
      title: 'Smart Crop',
      badge: 'Most Popular',
      desc: 'Crop horizontal video into full 9:16 vertical frame with adjustable focal position.',
      icon: Crop,
    },
    {
      id: 'blurred_bg',
      title: 'Fit with Blurred Background',
      badge: 'Safest',
      desc: 'Full horizontal video remains visible, with zoomed blurred video filling top & bottom.',
      icon: Layers,
    },
    {
      id: 'solid_bg',
      title: 'Fit with Solid Background',
      badge: 'Letterboxed',
      desc: 'Full horizontal video remains visible, filled with black, navy, or purple color.',
      icon: Palette,
    },
  ];

  const solidColors = [
    { name: 'Pure Black', hex: '#000000' },
    { name: 'Dark Navy', hex: '#070a14' },
    { name: 'Dark Purple', hex: '#170b24' },
    { name: 'Dark Slate', hex: '#0f172a' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Crop className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            Vertical Layout & Crop Behavior
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Choose how the horizontal footage fills the 9:16 vertical smartphone frame.
        </p>
      </div>

      {/* Three Layout Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {layoutModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = settings.layoutMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChangeSettings({ layoutMode: mode.id })}
              disabled={isProcessing}
              className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-cyan-600/10 border-purple-500 shadow-lg shadow-purple-900/30 ring-1 ring-purple-500'
                  : 'bg-[#0b0f19]/80 border-slate-800/80 hover:border-slate-700 hover:bg-[#0f1424]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {mode.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{mode.title}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{mode.desc}</p>
              </div>

              {/* Visual Mini Diagram */}
              <div className="mt-3 w-full h-12 bg-black/60 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden relative">
                {mode.id === 'smart_crop' && (
                  <div className="w-6 h-10 border-2 border-dashed border-pink-400 rounded-sm bg-pink-500/20 flex items-center justify-center text-[8px] text-pink-300">
                    9:16
                  </div>
                )}
                {mode.id === 'blurred_bg' && (
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-cyan-900/40 to-purple-900/40 blur-xs" />
                    <div className="relative w-11 h-6 bg-slate-200/90 rounded-xs shadow-md border border-white/40" />
                  </div>
                )}
                {mode.id === 'solid_bg' && (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: settings.solidBgColor }}
                  >
                    <div className="w-11 h-6 bg-slate-200/90 rounded-xs shadow-md" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Solid Background Color Palette Picker (only when Solid Background is selected) */}
      {settings.layoutMode === 'solid_bg' && (
        <div className="bg-[#0b0f19]/80 border border-slate-800 rounded-xl p-4">
          <label className="block text-xs font-bold text-slate-300 mb-2">
            Select Background Bar Color
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {solidColors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => onChangeSettings({ solidBgColor: c.hex })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer ${
                  settings.solidBgColor === c.hex
                    ? 'border-pink-500 bg-pink-950/40 text-white'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <span>{c.name}</span>
              </button>
            ))}

            <input
              type="color"
              value={settings.solidBgColor}
              onChange={(e) => onChangeSettings({ solidBgColor: e.target.value })}
              title="Custom background color"
              className="w-8 h-8 rounded-lg bg-transparent border border-slate-700 cursor-pointer p-0.5"
            />
          </div>
        </div>
      )}

      {/* Output Resolution & Format Selector */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Output Resolution
            </h4>
            <p className="text-[11px] text-slate-400">
              Select target render dimensions for the vertical short
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeSettings({ resolution: '1080x1920' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                settings.resolution === '1080x1920'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              1080 × 1920 (Full HD)
            </button>
            <button
              type="button"
              onClick={() => onChangeSettings({ resolution: '720x1280' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                settings.resolution === '720x1280'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              720 × 1280 (HD Faster)
            </button>
          </div>
        </div>

        {/* Format Summary pill */}
        <div className="p-3 bg-gradient-to-r from-purple-950/30 to-cyan-950/30 border border-purple-500/20 rounded-xl text-xs flex items-center justify-between text-slate-300">
          <span className="font-mono text-cyan-300">
            Output: MP4 | Vertical 9:16 | {settings.resolution.replace('x', ' × ')} | TikTok-ready
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
            H.264 + AAC
          </span>
        </div>
      </div>
    </div>
  );
};
