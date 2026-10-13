import React, { useState } from 'react';
import { ChevronDown, Shield, Scissors, Film, Download, Cpu, HardDrive } from 'lucide-react';

export const InfoSections: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const workflowSteps = [
    {
      num: '01',
      title: 'Import Any Long Footage',
      desc: 'Drag and drop standard video files (MP4, MOV, WebM, AVI, MKV). Your file stays completely on your device with 0 bytes uploaded to any server.',
      icon: Film,
    },
    {
      num: '02',
      title: 'Select Segment Duration',
      desc: 'Choose 5, 10, 15, 30 minutes, or dial in custom minutes and seconds. ClipForgees calculates the exact number of clips and timecodes instantly.',
      icon: Scissors,
    },
    {
      num: '03',
      title: 'Lossless Local Slicing',
      desc: 'FFmpeg running inside browser WebAssembly cuts the video streams at packet-level speed. Watch live progress for each part.',
      icon: Cpu,
    },
    {
      num: '04',
      title: 'Download & Share',
      desc: 'Preview generated clips right in your browser. Download single MP4s directly or grab every part neatly packed into a single ZIP archive.',
      icon: Download,
    },
  ];

  const faqs = [
    {
      q: 'Are my videos uploaded to a cloud server?',
      a: 'No, never. ClipForgees utilizes FFmpeg compiled directly to WebAssembly (ffmpeg.wasm). All container slicing, demuxing, and MP4 generation execute 100% inside your browser sandbox on your device.',
    },
    {
      q: 'How fast is the video splitting process?',
      a: 'ClipForgees leverages stream copy (-c copy) whenever possible. Instead of re-encoding every frame, it slices the existing H.264/AAC streams directly. A 1-hour video can often be split in just 10 to 30 seconds.',
    },
    {
      q: 'What happens to the final clip if the video length is not evenly divisible?',
      a: 'ClipForgees automatically handles uneven splits cleanly! For example, if your video is 52 minutes long and you choose 10-minute clips, it creates 5 full 10-minute clips and 1 final 2-minute clip.',
    },
    {
      q: 'What is the maximum file size supported?',
      a: 'Because WebAssembly operates inside browser memory limits (typically ~2GB for 32-bit WASM allocations), we recommend videos under 1.8GB for optimal performance. Most 1080p videos under 2-3 hours fit well within this range.',
    },
    {
      q: 'Can I download the clips on mobile devices?',
      a: 'Yes! Generated clips can be previewed directly on iOS and Android devices, and you can download individual MP4 files or download all clips at once.',
    },
  ];

  return (
    <div className="space-y-16 mt-20">
      {/* Workflow Steps Section */}
      <section id="workflow" className="scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest">
            Architecture & Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Engineered for Speed and Local Privacy
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            No cloud rendering queues, no subscriptions, and zero privacy compromise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-violet-500/30 transition-all duration-300 relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-extrabold text-slate-700 group-hover:text-violet-400 transition-colors">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-2">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Privacy Guarantee Deep Dive */}
      <section id="privacy" className="scroll-mt-20">
        <div className="glass-panel rounded-2xl p-8 sm:p-10 border border-cyan-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Shield className="w-4 h-4" />
              <span>Zero-Telemetry Guarantee</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight mb-3">
              Why Browser-Native Video Splitting Matters
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Conventional online video splitters require uploading gigabytes of your personal recordings, podcasts, and confidential meeting captures to third-party servers. ClipForgees shifts the heavy lifting to your local CPU using WebAssembly, ensuring your footage never travels over the network.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#0b0f19]/80 border border-slate-800 rounded-xl p-3.5">
                <span className="font-bold text-white block mb-1">Zero Server Storage</span>
                <span className="text-slate-400">Files exist solely in your temporary browser RAM and vanish when you close the tab.</span>
              </div>
              <div className="bg-[#0b0f19]/80 border border-slate-800 rounded-xl p-3.5">
                <span className="font-bold text-white block mb-1">Instant Processing</span>
                <span className="text-slate-400">No waiting in slow cloud transcoding queues or upload bottlenecks.</span>
              </div>
              <div className="bg-[#0b0f19]/80 border border-slate-800 rounded-xl p-3.5">
                <span className="font-bold text-white block mb-1">Full MP4 Preservation</span>
                <span className="text-slate-400">Audio/video stream bitrate and resolution remain uncompressed where supported.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="scroll-mt-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-mono font-semibold text-violet-400 uppercase tracking-widest">
            Answers & Details
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-xl border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-violet-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
