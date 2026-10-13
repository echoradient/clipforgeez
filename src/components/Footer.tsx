import React from 'react';
import { Logo } from './Logo';
import { Shield, Zap, Lock, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#06080d] mt-20 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Value Pillars */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-800/60">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-1">100% Private & Local</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your videos never leave your machine. Processing is executed securely inside your browser's WebAssembly sandbox.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-1">Stream-Copy Speed</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Utilizes lossless container slicing where possible, splitting multi-gigabyte footage in seconds without quality loss.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-1">Zero Cloud Dependency</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                No sign-up, no monthly subscriptions, and no queue waiting. Download individual MP4 clips or an entire ZIP bundle anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-sm font-semibold text-slate-300">
              ClipForgees — Fast, private, browser-based video splitting.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span>Powered by FFmpeg WebAssembly</span>
            <span aria-hidden="true">·</span>
            <span>Client-Side Processing</span>
            <span aria-hidden="true">·</span>
            <span>MP4 Lossless Slicing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
