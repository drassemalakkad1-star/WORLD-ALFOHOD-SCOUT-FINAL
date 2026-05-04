import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Music, Volume2, RotateCcw, Keyboard as KeyboardIcon, 
  Play, Pause, GraduationCap, Sparkles, BookOpen 
} from "lucide-react";

const NOTES = [
  { key: 'C', freq: 261.63, type: 'white', label: 'Do' },
  { key: 'C#', freq: 277.18, type: 'black', label: 'Do#' },
  { key: 'D', freq: 293.66, type: 'white', label: 'Re' },
  { key: 'D#', freq: 311.13, type: 'black', label: 'Re#' },
  { key: 'E', freq: 329.63, type: 'white', label: 'Mi' },
  { key: 'F', freq: 349.23, type: 'white', label: 'Fa' },
  { key: 'F#', freq: 369.99, type: 'black', label: 'Fa#' },
  { key: 'G', freq: 392.00, type: 'white', label: 'Sol' },
  { key: 'G#', freq: 415.30, type: 'black', label: 'Sol#' },
  { key: 'A', freq: 440.00, type: 'white', label: 'La' },
  { key: 'A#', freq: 466.16, type: 'black', label: 'La#' },
  { key: 'B', freq: 493.88, type: 'white', label: 'Si' },
  { key: 'C2', freq: 523.25, type: 'white', label: 'Do+' },
];

const SCOUT_SONG = [
  { key: 'C', duration: 400 }, { key: 'C', duration: 400 }, { key: 'G', duration: 400 }, { key: 'G', duration: 400 },
  { key: 'A', duration: 400 }, { key: 'A', duration: 400 }, { key: 'G', duration: 800 },
  { key: 'F', duration: 400 }, { key: 'F', duration: 400 }, { key: 'E', duration: 400 }, { key: 'E', duration: 400 },
  { key: 'D', duration: 400 }, { key: 'D', duration: 400 }, { key: 'C', duration: 800 },
];

const KEY_MAP: Record<string, string> = {
  'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F',
  't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B', 'k': 'C2'
};

export function PianoGame() {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const playTimeout = useRef<any>(null);

  const initAudio = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  }, []);

  const playNote = useCallback((key: string, duration: number = 1.5) => {
    initAudio();
    const ctx = audioContext.current!;
    const note = NOTES.find(n => n.key === key);
    if (!note) return;

    setActiveKey(key);
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Professional sound profile (slightly richer than simple triangle)
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(note.freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);

    // Visual feedback duration
    setTimeout(() => setActiveKey(prev => prev === key ? null : prev), 300);
  }, [initAudio]);

  const playAutoSong = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (playTimeout.current) clearTimeout(playTimeout.current);
      return;
    }

    initAudio();
    setIsPlaying(true);
    
    let delay = 0;
    SCOUT_SONG.forEach((note, index) => {
      playTimeout.current = setTimeout(() => {
        if (!isPlaying) return;
        playNote(note.key, 1.0);
        if (index === SCOUT_SONG.length - 1) setIsPlaying(false);
      }, delay);
      delay += note.duration;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const noteKey = KEY_MAP[e.key.toLowerCase()];
      if (noteKey && !e.repeat) playNote(noteKey);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playNote]);

  return (
    <div className="flex flex-col gap-10 w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-1000">
      {/* Header Panel */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-b-[12px] border-indigo-50 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Music size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 rotate-3 group-hover:rotate-0 transition-transform">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">أكاديمية الأنغام</h2>
          <p className="text-slate-500 font-bold text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            تعلم عزف الألحان الكشفية والوطنية بنظام التعليم التلقائي الذكي.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={playAutoSong} 
              className={`h-16 px-10 rounded-2xl text-xl font-black gap-3 transition-all ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
            >
              {isPlaying ? <Pause /> : <Play />}
              {isPlaying ? 'إيقاف التعليم' : 'ابدأ تعليمي لحناً'}
            </Button>
            <Button variant="outline" onClick={() => {}} className="h-16 px-8 rounded-2xl font-black gap-3 border-2">
              <BookOpen /> مكتبة الألحان
            </Button>
          </div>
        </div>
      </div>

      {/* Grand Piano Interface */}
      <div className="relative bg-slate-900 pt-20 pb-16 px-12 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border-t-[24px] border-slate-800">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-slate-600 font-black tracking-[0.5em] text-xs uppercase opacity-40">
          <Sparkles size={14} /> Global Leopard Piano <Sparkles size={14} />
        </div>

        <div className="flex justify-center relative select-none">
          {NOTES.map((note) => (
            <div
              key={note.key}
              onMouseDown={() => playNote(note.key)}
              className={`
                relative cursor-pointer transition-all duration-150 flex items-end justify-center pb-10 font-black text-[10px]
                ${note.type === 'white' 
                  ? `w-14 sm:w-16 md:w-20 h-80 bg-white border-x border-slate-200 rounded-b-2xl z-10 text-slate-300 hover:bg-slate-50 
                     ${activeKey === note.key ? 'h-[310px] bg-indigo-50 shadow-inner translate-y-2 border-b-8 border-indigo-400' : 'shadow-[0_10px_0_0_#e2e8f0]'}` 
                  : `w-10 sm:w-12 h-48 bg-slate-800 rounded-b-xl -mx-5 sm:-mx-6 z-20 text-slate-500 hover:bg-slate-700 
                     ${activeKey === note.key ? 'h-[185px] bg-indigo-900 translate-y-2 border-b-4 border-indigo-300' : 'shadow-[0_8px_0_0_#0f172a]'}`
                }
              `}
            >
              <div className={`absolute bottom-4 uppercase tracking-tighter ${activeKey === note.key ? 'text-indigo-600 scale-125' : ''}`}>
                {note.label}
              </div>
              
              {/* Active Light Effect */}
              {activeKey === note.key && (
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent rounded-b-2xl animate-pulse pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Cards - Adjusted sizes for professional look */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 group hover:border-indigo-200 transition-colors">
          <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
            <KeyboardIcon size={24} />
          </div>
          <div>
            <h4 className="font-black text-sm text-slate-800 mb-0.5">تحكم كامل</h4>
            <p className="text-slate-500 font-bold text-[10px] leading-tight">استخدم الأزرار (A إلى K) للعزف السريع.</p>
          </div>
        </div>

        <div className="bg-indigo-900 text-white p-6 rounded-[2rem] shadow-xl flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-xl shrink-0">
            <Volume2 size={24} />
          </div>
          <div>
            <h4 className="font-black text-sm mb-0.5">صوت ستوديو</h4>
            <p className="opacity-70 font-bold text-[10px] leading-tight">نظام صوتي بترددات نقية لمحاكاة البيانو الحقيقي.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 border-b-4 border-indigo-50 group hover:border-indigo-100 transition-colors">
          <div className="bg-yellow-50 text-yellow-600 p-3 rounded-xl shrink-0">
            <RotateCcw size={24} />
          </div>
          <div>
            <h4 className="font-black text-sm text-slate-800 mb-0.5">إعادة الضبط</h4>
            <p className="text-slate-500 font-bold text-[10px] leading-tight">ابدأ من جديد بضغطة زر واحدة.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
