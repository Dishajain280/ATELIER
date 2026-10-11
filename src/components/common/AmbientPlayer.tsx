import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music, Play, Pause, SkipForward, Volume2, VolumeX, Sparkles, ChevronDown, Check } from 'lucide-react';

interface AmbientPlayerProps {
  soundscape?: 'none' | 'lofi' | string;
  creatorName: string;
}

interface TrackInfo {
  title: string;
  album: string;
  mood: string;
  frequencies: number[];
  style: 'kalimba' | 'pad' | 'rhodes' | 'piano' | 'breeze';
}

const TRACKS: TrackInfo[] = [
  {
    title: 'Morning Dew',
    album: 'Gentle Awakening',
    mood: 'Soft kalimba chimes in F-major pentatonic',
    frequencies: [349.23, 440.00, 523.25, 659.25, 698.46, 783.99], // F4, A4, C5, E5, F5, G5
    style: 'kalimba',
  },
  {
    title: 'Soft Echoes',
    album: 'Ambient Dreams',
    mood: 'Swelling warm pads & subtle harmonic undertones',
    frequencies: [174.61, 261.63, 329.63, 392.00, 440.00], // F3, C4, E4, G4, A4 (Fmaj9)
    style: 'pad',
  },
  {
    title: 'Gentle Flow',
    album: 'Tranquil Waters',
    mood: 'Slow acoustic chime tones over warm serene drone',
    frequencies: [196.00, 246.94, 293.66, 392.00, 493.88], // G3, B3, D4, G4, B4 (Gmaj7)
    style: 'rhodes',
  },
  {
    title: 'Quiet Reflection',
    album: 'Peaceful Moments',
    mood: 'Contemplative soft piano chords & gentle decay',
    frequencies: [220.00, 261.63, 329.63, 392.00, 523.25], // A3, C4, E4, G4, C5 (Am7)
    style: 'piano',
  },
  {
    title: 'Calm Breeze',
    album: 'Restful Skies',
    mood: 'Ethereal atmosphere tuned to 432Hz harmonic peace',
    frequencies: [216.00, 272.16, 324.00, 432.00, 544.32], // A3=432Hz harmonics
    style: 'breeze',
  },
];

export const AmbientPlayer: React.FC<AmbientPlayerProps> = ({
  soundscape = 'none',
  creatorName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [showTrackList, setShowTrackList] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNodesRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const intervalRef = useRef<number | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // Initialize or get Web Audio context
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
        masterGain.connect(ctx.destination);
        audioCtxRef.current = ctx;
        masterGainRef.current = masterGain;
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, [isMuted, volume]);

  // Stop active notes safely
  const stopAllNotes = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const ctx = audioCtxRef.current;
    if (ctx) {
      activeNodesRef.current.forEach(({ osc, gain }) => {
        try {
          gain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
          setTimeout(() => {
            try {
              osc.stop();
              osc.disconnect();
            } catch (e) {
              // ignore already stopped
            }
          }, 300);
        } catch (e) {
          // ignore
        }
      });
      activeNodesRef.current = [];
    }
  }, []);

  // Play a gentle note with soothing envelope
  const triggerSoothingNote = useCallback((freq: number, duration: number, style: string) => {
    const ctx = getAudioContext();
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    try {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Warm low-pass filter to keep sound soft and gentle
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(style === 'breeze' ? 380 : 650, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      osc.type = style === 'breeze' || style === 'pad' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Connect: Osc -> Filter -> NoteGain -> MasterGain
      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(master);

      const now = ctx.currentTime;
      // Gentle attack to avoid any harsh transients
      const attack = style === 'pad' ? 1.8 : style === 'breeze' ? 2.5 : 0.6;
      const peakVol = style === 'pad' ? 0.08 : 0.06;

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(peakVol, now + attack);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.start(now);
      osc.stop(now + duration + 0.1);

      activeNodesRef.current.push({ osc, gain: noteGain });

      // Clean up reference after note finishes
      setTimeout(() => {
        activeNodesRef.current = activeNodesRef.current.filter(n => n.osc !== osc);
        try {
          osc.disconnect();
          noteGain.disconnect();
          filter.disconnect();
        } catch (e) {
          // ignore
        }
      }, (duration + 0.5) * 1000);
    } catch (err) {
      console.warn("Audio trigger issue:", err);
    }
  }, [getAudioContext]);

  // Play ambient chord or pattern
  const startAmbientEngine = useCallback(() => {
    stopAllNotes();
    const ctx = getAudioContext();
    if (!ctx) return;

    const track = TRACKS[currentTrackIndex];

    // Trigger initial gentle harmony
    const freqs = track.frequencies;
    const playChord = () => {
      // Pick 2-3 soft notes from the pentatonic / modal scale
      const numNotes = track.style === 'pad' ? 3 : 2;
      const shuffled = [...freqs].sort(() => 0.5 - Math.random());
      shuffled.slice(0, numNotes).forEach((f, idx) => {
        const stagger = idx * 0.4;
        setTimeout(() => {
          triggerSoothingNote(f, track.style === 'pad' ? 5.5 : 3.8, track.style);
        }, stagger * 1000);
      });
    };

    // Play immediately
    playChord();

    // Schedule subsequent gentle pulses every 3.8 - 4.5 seconds
    intervalRef.current = window.setInterval(() => {
      playChord();
    }, track.style === 'pad' ? 4800 : 3600);
  }, [currentTrackIndex, getAudioContext, stopAllNotes, triggerSoothingNote]);

  // Handle Play / Pause lifecycle
  useEffect(() => {
    if (isPlaying) {
      startAmbientEngine();
    } else {
      stopAllNotes();
    }
    return () => {
      stopAllNotes();
    };
  }, [isPlaying, currentTrackIndex, startAmbientEngine, stopAllNotes]);

  // Volume & Mute listener
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const target = isMuted ? 0 : volume;
      masterGainRef.current.gain.setTargetAtTime(target, audioCtxRef.current.currentTime, 0.05);
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (nextState) {
      getAudioContext();
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    if (!isPlaying) {
      setIsPlaying(true);
      getAudioContext();
    }
  };

  if (!soundscape || soundscape === 'none') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-neutral-900/95 backdrop-blur-md border border-amber-500/30 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3.5 max-w-sm">
        <div className="relative">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-stone-700 flex items-center justify-center shadow-lg transition-transform ${isPlaying ? 'scale-105' : 'opacity-85'}`}>
            <Music className={`w-5 h-5 text-white ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          {isPlaying && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
        </div>

        <div className="flex-1 min-w-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wider uppercase text-amber-400 font-semibold flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3" /> Lo-Fi Ambient Soundscape
            </span>
            <button
              onClick={() => setShowTrackList(!showTrackList)}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Toggle Playlist"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTrackList ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <p className="text-xs font-bold text-white truncate mt-0.5">{currentTrack.title}</p>
          <p className="text-[10px] text-neutral-400 truncate">{currentTrack.album} · {currentTrack.mood}</p>
        </div>

        <div className="flex items-center gap-1.5 border-l border-neutral-800 pl-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center transition-transform hover:scale-105 shadow-md cursor-pointer"
            title={isPlaying ? 'Pause Ambient Sound' : 'Play Soothing Ambient Sound'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Next Soothing Track"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        </div>

        {/* Playlist Drawer */}
        {showTrackList && (
          <div className="absolute bottom-full right-0 mb-3 w-80 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
            <div className="text-[11px] font-semibold text-neutral-400 px-3 py-1.5 border-b border-neutral-800 flex items-center justify-between">
              <span>Curated Soothing Ambient Collection</span>
              <span className="text-[10px] font-mono text-amber-400">5 Gentle Tracks</span>
            </div>
            <div className="py-1 space-y-0.5 max-h-60 overflow-y-auto">
              {TRACKS.map((track, idx) => (
                <button
                  key={track.title}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setShowTrackList(false);
                    if (!isPlaying) {
                      setIsPlaying(true);
                      getAudioContext();
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentTrackIndex === idx ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'hover:bg-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate">{track.title}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{track.mood}</p>
                  </div>
                  {currentTrackIndex === idx && (
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="px-3 pt-2 pb-1 border-t border-neutral-800 text-[10px] text-neutral-500 flex items-center justify-between">
              <span>100% Gentle & Royalty-Free</span>
              <span>For {creatorName}'s Portfolio</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

