import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { ScoreSavePrompt } from "./ScoreSavePrompt";

export function NumberGuess() {
  const [secret, setSecret] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [input, setInput] = useState("");
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState<"higher" | "lower" | "win" | null>(null);
  const [history, setHistory] = useState<{ n: number; hint: string }[]>([]);
  const MAX = 7;

  const guess = () => {
    const n = parseInt(input);
    if (!n || n < 1 || n > 100) return;
    const t = tries + 1; setTries(t);
    if (n === secret) { setHint("win"); setHistory(h => [{ n, hint: "✅ صح!" }, ...h]); }
    else if (n < secret) { setHint("higher"); setHistory(h => [{ n, hint: "⬆️ أكبر" }, ...h]); }
    else { setHint("lower"); setHistory(h => [{ n, hint: "⬇️ أصغر" }, ...h]); }
    setInput("");
    if (t >= MAX && n !== secret) setHint("lower");
  };

  const restart = () => { setSecret(Math.floor(Math.random() * 100) + 1); setTries(0); setHint(null); setHistory([]); setInput(""); };
  const lost = tries >= MAX && hint !== "win";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-10">
        <div className="text-7xl mb-4 drop-shadow-xl">🎯</div>
        <h3 className="font-black text-slate-800 text-2xl mb-2">خمّن الرقم السري</h3>
        <p className="text-slate-500 font-bold mb-6">الرقم بين 1 و 100</p>
        
        <div className="flex items-center gap-3 justify-center mb-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">المحاولات المتبقية</span>
          <span className="text-primary font-black">{Math.max(0, MAX - tries)}</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden w-full max-w-xs mx-auto border border-slate-50 shadow-inner">
          <motion.div 
            className="h-full bg-secondary rounded-full" 
            animate={{ width: `${(tries / MAX) * 100}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>
      </div>

      {hint === "win" ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 shadow-xl shadow-emerald-50">
          <div className="text-7xl mb-4 animate-bounce">🏆</div>
          <h4 className="font-black text-emerald-800 text-2xl mb-2">عبقري! إجابة صحيحة</h4>
          <p className="font-bold text-emerald-600 mb-8 text-lg">الرقم هو {secret} — وجدته في {tries} محاولات</p>
          <Button onClick={restart} className="bg-primary text-white rounded-2xl px-12 h-14 text-lg font-black shadow-lg shadow-primary/20 gap-3"><RotateCcw className="h-5 w-5" /> جولة جديدة</Button>
          <ScoreSavePrompt gameId="numguess" score={tries} detail={`فاز بـ ${tries} محاولة`} />
        </motion.div>
      ) : lost ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 bg-red-50 rounded-[2.5rem] border-2 border-red-100 shadow-xl shadow-red-50">
          <div className="text-6xl mb-4">😢</div>
          <h4 className="font-black text-red-800 text-2xl mb-2">حظ أوفر المرة القادمة</h4>
          <p className="font-bold text-red-600 mb-8 text-lg">الرقم السري كان: <span className="text-3xl block mt-2">{secret}</span></p>
          <Button onClick={restart} className="bg-primary text-white rounded-2xl px-12 h-14 text-lg font-black shadow-lg shadow-primary/20 gap-3"><RotateCcw className="h-5 w-5" /> حاول مجدداً</Button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {hint && (
              <motion.div 
                key={hint}
                initial={{ opacity: 0, y: -20, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`text-center p-5 rounded-2xl font-black text-xl shadow-lg border-2 ${hint === "higher" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-orange-50 text-orange-700 border-orange-100"}`}
              >
                {hint === "higher" ? "⬆️ الرقم أكبر بكثير!" : "⬇️ الرقم أصغر بكثير!"}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <input
              type="number" 
              min={1} 
              max={100} 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && guess()}
              placeholder="00"
              className="flex-1 border-2 border-slate-100 rounded-2xl px-4 py-5 text-center text-4xl font-black text-primary focus:border-primary outline-none bg-slate-50 transition-all focus:bg-white focus:shadow-2xl focus:shadow-primary/5"
            />
            <Button onClick={guess} className="h-20 px-10 bg-primary text-white rounded-2xl text-xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">تحقق</Button>
          </div>

          {history.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 text-center">تاريخ التخمينات</p>
              <div className="flex flex-wrap justify-center gap-2">
                {history.map((h, i) => (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={i} 
                    className="bg-white border border-slate-100 px-4 py-2 rounded-xl text-sm font-black text-slate-600 shadow-sm"
                  >
                    {h.n} <span className="mr-1 opacity-50">{h.hint}</span>
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
