import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles, Layers, Mic, Volume2, Play, Pause, Maximize2, Frame, Sliders, Check } from 'lucide-react';
import { Artwork } from '../../types/index.js';

interface LightboxProps {
  artwork: Artwork | null;
  onClose: () => void;
  onRequestCommission?: (artwork: Artwork) => void;
}

type WallBackground = 'gallery' | 'scandinavian' | 'brutalist';
type ArtworkScale = 'sm' | 'md' | 'lg';

export const Lightbox: React.FC<LightboxProps> = ({
  artwork,
  onClose,
  onRequestCommission,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isARModalOpen, setIsARModalOpen] = useState(false);
  const [wallBg, setWallBg] = useState<WallBackground>('gallery');
  const [artScale, setArtScale] = useState<ArtworkScale>('md');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isARModalOpen) {
          setIsARModalOpen(false);
        } else {
          window.speechSynthesis?.cancel();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.speechSynthesis?.cancel();
    };
  }, [onClose, isARModalOpen]);

  // Audio walkthrough playback simulation and Speech Synthesis
  useEffect(() => {
    let timer: any;
    if (isPlayingAudio) {
      timer = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 2;
        });
      }, 400);
    }
    return () => clearInterval(timer);
  }, [isPlayingAudio]);

  const toggleAudioWalkthrough = () => {
    if (!('speechSynthesis' in window)) {
      setIsPlayingAudio(!isPlayingAudio);
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setAudioProgress(0);
    } else {
      window.speechSynthesis.cancel();
      const walkthroughText = `Artist audio walkthrough for ${artwork?.title}. Crafted with ${artwork?.medium}. ${artwork?.description} ${artwork?.processNotes ? `Studio process notes: ${artwork.processNotes}` : ''}`;
      const utterance = new SpeechSynthesisUtterance(walkthroughText);
      utterance.rate = 0.92; // Calm, deliberate curator cadence
      utterance.pitch = 0.98;
      
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setAudioProgress(0);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setAudioProgress(0);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  if (!artwork) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-[#121210]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fadeIn"
        onClick={() => {
          window.speechSynthesis?.cancel();
          onClose();
        }}
      >
        <button
          onClick={() => {
            window.speechSynthesis?.cancel();
            onClose();
          }}
          className="absolute top-6 right-6 text-neutral-400 hover:text-white transition-colors p-2 rounded-full bg-white/5 hover:bg-white/10 z-10 cursor-pointer"
          aria-label="Close viewer"
        >
          <X className="w-6 h-6" />
        </button>

        <div 
          className="max-w-6xl w-full h-[90vh] grid grid-cols-1 md:grid-cols-12 gap-8 items-center overflow-y-auto md:overflow-hidden p-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Media Frame & AR Preview Trigger */}
          <div className="md:col-span-8 h-full flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="relative max-h-[75vh] max-w-full flex items-center justify-center overflow-hidden rounded-sm shadow-2xl">
              <img
                src={artwork.images[0]}
                alt={artwork.title}
                className="max-h-[72vh] max-w-full object-contain transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* AR Virtual Wall Preview Button overlay */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => setIsARModalOpen(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2 border border-white/20 cursor-pointer shadow-lg"
              >
                <Frame className="w-4 h-4 text-amber-400" />
                <span>Virtual Wall / AR Preview</span>
              </button>
            </div>
          </div>

          {/* Curatorial Details Pane */}
          <div className="md:col-span-4 text-neutral-100 flex flex-col justify-center space-y-5 pr-4 max-h-[85vh] overflow-y-auto">
            <div>
              <div className="text-xs uppercase tracking-widest text-neutral-400 mb-2">
                <span>{artwork.year}</span>
                <span className="mx-2">·</span>
                <span className="capitalize">{artwork.status.replace('_', ' ')}</span>
              </div>
              <h2 className="font-editorial text-3xl md:text-4xl font-normal leading-tight text-white">
                {artwork.title}
              </h2>
            </div>

            {/* Interactive Audio Walkthrough / Studio Voice Note (Real Web Speech API Voice Synthesis) */}
            <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Live Studio Audio Walkthrough</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Curatorial Narration</span>
              </div>
              <p className="text-xs text-neutral-300 font-light leading-relaxed">
                Click play to listen to the live studio voice narration explaining the conceptual vision of "{artwork.title}".
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={toggleAudioWalkthrough}
                  className="w-9 h-9 bg-white text-neutral-900 hover:bg-neutral-200 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  title={isPlayingAudio ? "Pause Walkthrough" : "Play Walkthrough"}
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                </button>
                <div className="flex-1 bg-neutral-800 h-2 rounded-full overflow-hidden relative">
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-amber-400 transition-all duration-300"
                    style={{ width: `${isPlayingAudio ? (audioProgress >= 100 ? 100 : audioProgress) : 0}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 w-12 text-right">
                  {isPlayingAudio ? 'Playing...' : 'Voice Note'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 border-y border-neutral-800 py-3.5 text-sm text-neutral-300">
              <div>
                <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-0.5">Medium & Technique</span>
                <span className="font-medium text-neutral-200">{artwork.medium}</span>
              </div>
              {artwork.dimensions && (
                <div>
                  <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-0.5">Dimensions</span>
                  <span className="font-mono text-xs text-neutral-200">{artwork.dimensions}</span>
                </div>
              )}
              {artwork.price && (
                <div>
                  <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-0.5">Acquisition / Value</span>
                  <span className="font-mono text-base text-neutral-100 tabular-nums">
                    ${artwork.price.toLocaleString()} {artwork.currency || 'USD'}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm leading-relaxed text-neutral-300 font-light">
              {artwork.description}
            </p>

            {/* Process & Behind-the-Scenes */}
            {artwork.processNotes && (
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Process & Studio Notes</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  {artwork.processNotes}
                </p>
              </div>
            )}

            {/* Provenance & Exhibition */}
            {artwork.provenance && (
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-sm space-y-1">
                <div className="flex items-center gap-1.5 text-neutral-300 text-xs font-medium uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Provenance & Exhibitions</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  {artwork.provenance}
                </p>
              </div>
            )}

            {artwork.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                {artwork.tags.map((tag, idx) => (
                  <span key={tag}>
                    {tag}{idx < artwork.tags.length - 1 ? ' ·' : ''}
                  </span>
                ))}
              </div>
            )}

            {onRequestCommission && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    onClose();
                    onRequestCommission(artwork);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-neutral-900 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors rounded-sm cursor-pointer"
                >
                  <span>Commission Similar Work</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AR / Virtual Wall Preview Modal */}
      {isARModalOpen && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-4 md:p-8 animate-fadeIn"
          onClick={() => setIsARModalOpen(false)}
        >
          <div className="absolute top-6 left-6 flex items-center gap-3">
            <span className="bg-white/10 px-3 py-1.5 rounded-full text-white text-xs font-mono uppercase tracking-wider backdrop-blur-md border border-white/20">
              Virtual Wall Simulator (AR)
            </span>
          </div>

          <button
            onClick={() => setIsARModalOpen(false)}
            className="absolute top-6 right-6 text-neutral-400 hover:text-white transition-colors p-2 rounded-full bg-white/10 hover:bg-white/20 z-10 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Interactive Wall Background Container */}
          <div 
            className={`w-full max-w-5xl h-[70vh] rounded-lg shadow-2xl relative overflow-hidden flex items-center justify-center transition-all duration-500 ${
              wallBg === 'gallery'
                ? 'bg-neutral-100 border-8 border-neutral-300'
                : wallBg === 'scandinavian'
                ? 'bg-[#E5DFD3] border-8 border-[#C9BFA8]'
                : 'bg-[#2A2A28] border-8 border-[#1A1A18]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Lighting / Interior atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

            {/* Framed Artwork in Room */}
            <div className={`relative shadow-2xl transition-all duration-500 p-3 bg-white border border-neutral-300/60 ${
              artScale === 'sm' ? 'max-w-[280px]' : artScale === 'md' ? 'max-w-[480px]' : 'max-w-[680px]'
            }`}>
              <img
                src={artwork.images[0]}
                alt={artwork.title}
                className="max-h-[50vh] object-contain shadow-inner"
                referrerPolicy="no-referrer"
              />
              <div className="mt-2 text-center">
                <p className="font-editorial text-neutral-900 text-sm font-medium">{artwork.title}</p>
                <p className="font-mono text-[10px] text-neutral-500">{artwork.medium} · {artwork.year}</p>
              </div>
            </div>
          </div>

          {/* Wall & Scale Controls Bar */}
          <div 
            className="mt-6 flex flex-wrap items-center justify-center gap-6 bg-neutral-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-neutral-800 text-xs text-neutral-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold">Wall Environment:</span>
              <button
                onClick={() => setWallBg('gallery')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${wallBg === 'gallery' ? 'bg-white text-neutral-900 font-medium' : 'hover:text-white'}`}
              >
                White Gallery
              </button>
              <button
                onClick={() => setWallBg('scandinavian')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${wallBg === 'scandinavian' ? 'bg-white text-neutral-900 font-medium' : 'hover:text-white'}`}
              >
                Warm Living Room
              </button>
              <button
                onClick={() => setWallBg('brutalist')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${wallBg === 'brutalist' ? 'bg-white text-neutral-900 font-medium' : 'hover:text-white'}`}
              >
                Brutalist Loft
              </button>
            </div>

            <div className="w-px h-4 bg-neutral-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold">Scale:</span>
              <button
                onClick={() => setArtScale('sm')}
                className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${artScale === 'sm' ? 'bg-amber-400 text-neutral-900 font-medium' : 'hover:text-white'}`}
              >
                Intimate
              </button>
              <button
                onClick={() => setArtScale('md')}
                className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${artScale === 'md' ? 'bg-amber-400 text-amber-900 font-medium' : 'hover:text-white'}`}
              >
                Standard
              </button>
              <button
                onClick={() => setArtScale('lg')}
                className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${artScale === 'lg' ? 'bg-amber-400 text-neutral-900 font-medium' : 'hover:text-white'}`}
              >
                Museum Scale
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
