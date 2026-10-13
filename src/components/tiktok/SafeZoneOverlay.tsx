import React from 'react';
import { Heart, MessageCircle, Bookmark, Share2, Music, User } from 'lucide-react';

interface SafeZoneOverlayProps {
  isVisible: boolean;
}

/**
 * Visual guide showing standard TikTok / Reels / Shorts interface UI zones:
 * - Top: Following / For You tabs and search bar
 * - Right: Avatar profile, Like heart, Comments, Bookmark, Share
 * - Bottom: Username, caption, and rotating sound disk
 */
export const SafeZoneOverlay: React.FC<SafeZoneOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden font-sans">
      {/* Top Header Exclusion Zone */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-center gap-6 text-white/70 text-xs font-bold pt-2 border-b border-dashed border-cyan-400/40">
        <span className="text-white/40">Following</span>
        <span className="text-white border-b-2 border-white pb-0.5">For You</span>
      </div>

      {/* Right Sidebar UI Exclusion Zone */}
      <div className="absolute right-2.5 bottom-24 flex flex-col items-center gap-3.5 text-white/80">
        {/* Profile Avatar */}
        <div className="w-9 h-9 rounded-full bg-slate-700/80 border-2 border-white/60 flex items-center justify-center text-white/80 shadow">
          <User className="w-4 h-4" />
        </div>

        {/* Like */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/90">
            <Heart className="w-4 h-4 fill-white/80" />
          </div>
          <span className="text-[9px] font-bold mt-0.5">142K</span>
        </div>

        {/* Comments */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/90">
            <MessageCircle className="w-4 h-4 fill-white/80" />
          </div>
          <span className="text-[9px] font-bold mt-0.5">1,280</span>
        </div>

        {/* Bookmark */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/90">
            <Bookmark className="w-4 h-4 fill-white/80" />
          </div>
          <span className="text-[9px] font-bold mt-0.5">8.4K</span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/90">
            <Share2 className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-bold mt-0.5">Share</span>
        </div>
      </div>

      {/* Bottom Description & Sound Exclusion Zone */}
      <div className="absolute bottom-3 left-3 right-14 text-white/85 text-[11px] leading-tight space-y-1">
        <p className="font-bold text-white shadow-black">@creator_handle</p>
        <p className="text-[10px] text-white/75 line-clamp-2">
          Your video short converted with ClipForgees #shorts #tiktok
        </p>
        <div className="flex items-center gap-1.5 text-[9px] text-white/70 pt-0.5">
          <Music className="w-3 h-3 animate-spin" />
          <span>Original Audio - ClipForgees</span>
        </div>
      </div>

      {/* Safe Area Center Box Boundary Lines */}
      <div className="absolute inset-x-6 top-18 bottom-32 border border-dashed border-pink-400/50 rounded-xl pointer-events-none flex flex-col justify-between p-2">
        <div className="text-[9px] font-mono font-bold text-pink-300 bg-black/60 px-1.5 py-0.5 rounded self-start">
          Safe Zone (Top)
        </div>
        <div className="text-[9px] font-mono font-bold text-pink-300 bg-black/60 px-1.5 py-0.5 rounded self-end">
          Safe Zone (Bottom)
        </div>
      </div>
    </div>
  );
};
