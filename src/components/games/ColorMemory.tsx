import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Zap, Star } from "lucide-react";
import { ScoreSavePrompt } from "./ScoreSavePrompt";

const COLORS = ["#1B6B35", "#D4A017", "#E74C3C", "#3498DB", "#9B59B6", "#E67E22"];

export function ColorMemory() {
  const [seq, setSeq] = useState<string[]>([]);
  const [showing, setShowing] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [playerSeq, setPlayerSeq] = useState<string[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [failed, setFailed] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const startRound = useCallback(async (newSeq: string[]) => {
    setShowing(true); setPlayerSeq([]); setWaiting(false);
    for (const color of newSeq) {
      await new Promise(r => setTimeout(r, 500));
      setActive(color);
      await new Promise(r => setTimeout(r, 600));
      setActive(null);
    }
    await new Promise(r => setTimeout(r, 300));
    setShowing(false); setWaiting(true);
  }, []);

  const start = () => {
    const first = [COLORS[Math.floor(Math.random() * COLORS.length)]];
    setSeq(first); setRound(1); setScore(0); setFailed(false);
    startRound(first);
  };

  const pick = (c: string) => {
    if (showing || !waiting || failed) return;
    const next = [...playerSeq, c];
    setPlayerSeq(next);
    if (next[next.length - 1] !== seq[next.length - 1]) {
      setFailed(true); setWaiting(false); return;
    }
    if (next.length === seq.length) {
      setScore(s => s + 1);
      setTimeout(() => {
        const newSeq = [...seq, COLORS[Math.floor(Math.random() * COLORS.length)]];
        setSeq(newSeq); setRound(r => r + 1);
        startRound(newSeq);
      }, 600);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="bg-slate-50 px-5 py-2 rounded-xl border border-slate-100 font-black text-slate-500">الجولة <span className="text-primary text-xl ml-1">{round}</span></div>
        <div className="flex items-center gap-2 text-secondary font-black text-2xl"><Star className="h-6 w-6 fill-secondary" /> {score}</div>
      </div>

      {round === 0 ? (
        <div className="text-center py-12 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="text-8xl mb-6 animate-pulse">🎨</div>
          <h3 className="font-black text-slate-800 text-3xl mb-3">تحدي الألوان</h3>
          <p className="text-slate-500 font-bold mb-10 px-6">اختبر قوة تركيزك وذاكرتك البصرية من خلال تذكر تسلسل الألوان المتزايد.</p>
          <Button onClick={start} className="bg-primary text-white rounded-2xl px-12 h-16 text-xl font-black gap-3 shadow-lg shadow-primary/20 hover:scale-105 transition-all"><Zap className="h-6 w-6" /> ابدأ التحدي</Button>
        </div>
      ) : (
        <>
          {failed ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 bg-red-50 rounded-[3rem] border-2 border-red-100 shadow-xl shadow-red-50">
              <div className="text-7xl mb-4">😢</div>
              <h4 className="font-black text-red-800 text-3xl mb-2">انتهى التحدي!</h4>
              <p className="font-bold text-red-600 mb-8 text-lg">وصلت للجولة {round} وحققت {score} نقطة</p>
              <Button onClick={start} className="bg-primary text-white rounded-2xl px-10 h-14 text-lg font-black gap-2 shadow-lg shadow-primary/20"><RotateCcw className="h-5 w-5" /> حاول مرة أخرى</Button>
              {score > 0 && <ScoreSavePrompt gameId="color" score={score} detail={`وصل للجولة ${round}`} />}
            </motion.div>
          ) : (
            <div className="space-y-8">
              <div className={`text-center py-3 rounded-2xl font-black transition-all border shadow-sm ${showing ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                {showing ? "🔍 انظر بتركيز..." : "👇 كرر التسلسل الآن"}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {COLORS.map(c => (
                  <motion.button
                    key={c}
                    onClick={() => pick(c)}
                    animate={active === c ? { scale: 1.15, boxShadow: `0 0 40px ${c}`, zIndex: 10 } : { scale: 1 }}
                    whileHover={!showing && waiting ? { scale: 1.05, y: -2 } : {}}
                    whileTap={!showing && waiting ? { scale: 0.92 } : {}}
                    className={`aspect-square rounded-[2rem] border-4 border-white shadow-xl transition-all relative ${showing || !waiting ? 'cursor-default' : 'cursor-pointer'}`}
                    style={{ backgroundColor: c }}
                    disabled={showing || !waiting}
                  >
                    {active === c && (
                      <motion.div 
                        layoutId="active-glow" 
                        className="absolute inset-0 rounded-[2rem] bg-white opacity-40 blur-md"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(playerSeq.length / seq.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{playerSeq.length} / {seq.length}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
