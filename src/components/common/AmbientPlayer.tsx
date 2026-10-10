import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipForward, Volume2, VolumeX, Sparkles, ChevronDown, AlertCircle } from 'lucide-react';

interface AmbientPlayerProps {
  soundscape?: 'none' | 'lofi' | string;
  creatorName: string;
}

export const AmbientPlayer: React.FC<AmbientPlayerProps> = ({
  soundscape = 'none',
  creatorName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTrackList, setShowTrackList] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tracks = [
    { title: 'Morning Coffee', album: 'Study Session', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { title: 'Rainy Window', album: 'Midnight Thoughts', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { title: 'City Lights', album: 'Late Night Chill', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { title: 'Soft Breeze', album: 'Summer Vibes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { title: 'Quiet Moment', album: 'Focus Time', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  ];

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      // If the track source changed, we need to load it
      if (audioRef.current.src !== currentTrack.url) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.load();
      }
      
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.5;
    }
  }, [isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  if (!soundscape || soundscape === 'none') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <audio 
        ref={audioRef}
        loop
      />
      <div className="bg-neutral-900/95 backdrop-blur-md border border-amber-500/30 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3.5 max-w-sm">
        <div className="relative">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center shadow-lg ${isPlaying ? 'animate-spin-slow' : ''}`}>
            <Music className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wider uppercase text-amber-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Lo-Fi Essentials
            </span>
            <button
              onClick={() => setShowTrackList(!showTrackList)}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTrackList ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <p className="text-xs font-bold text-white truncate mt-0.5">{currentTrack.title}</p>
          <p className="text-[10px] text-neutral-400 truncate">{currentTrack.album}</p>
        </div>

        <div className="flex items-center gap-1.5 border-l border-neutral-800 pl-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center transition-transform hover:scale-105 shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        </div>

        {showTrackList && (
          <div className="absolute bottom-full right-0 mb-3 w-72 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-2 z-50">
            <div className="text-[11px] font-semibold text-neutral-400 px-3 py-1.5 border-b border-neutral-800 flex items-center justify-between">
              <span>Lo-Fi Essentials Playlist (5 Songs)</span>
            </div>
            <div className="py-1 space-y-0.5 max-h-56 overflow-y-auto">
              {tracks.map((track, idx) => (
                <button
                  key={track.title}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setShowTrackList(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    currentTrackIndex === idx ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'hover:bg-neutral-800 text-neutral-300'
                  }`}
                >
                  <div>
                    <p>{track.title}</p>
                    <p className="text-[10px] text-neutral-400">{track.album}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {!isPlaying && (
        <div className="absolute bottom-full right-0 mb-4 bg-amber-500/20 border border-amber-500/50 text-amber-200 px-3 py-2 rounded-lg text-[10px] flex items-center gap-2 animate-pulse">
          <AlertCircle className="w-4 h-4" />
          Click Play to start the music.
        </div>
      )}
    </div>
  );
};
