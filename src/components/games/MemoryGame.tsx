import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Target } from "lucide-react";
import { ScoreSavePrompt } from "./ScoreSavePrompt";

const CARD_PAIRS = ["🦁", "⛺", "🧭", "🪢", "🔥", "🏕️", "🌿", "🦅"];
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

export function MemoryGame() {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [checking, setChecking] = useState(false);

  const init = useCallback(() => {
    const deck = shuffle([...CARD_PAIRS, ...CARD_PAIRS]).map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
    setCards(deck); setSelected([]); setMoves(0); setWon(false); setChecking(false);
  }, []);

  useEffect(() => { init(); }, [init]);

  const flip = (id: number) => {
    if (checking || cards[id].flipped || cards[id].matched || selected.length === 2) return;
    const next = [...selected, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));
    setSelected(next);
    if (next.length === 2) {
      setChecking(true);
      setMoves(m => m + 1);
      const [a, b] = [cards[next[0]], cards[next[1]]];
      if (a.emoji === b.emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c => next.includes(c.id) ? { ...c, matched: true } : c));
          setSelected([]); setChecking(false);
          setCards(prev => { if (prev.every(c => c.matched)) setWon(true); return prev; });
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => next.includes(c.id) ? { ...c, flipped: false } : c));
          setSelected([]); setChecking(false);
        }, 900);
      }
    }
  };

  const allMatched = cards.length > 0 && cards.every(c => c.matched);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
          <Target className="h-5 w-5 text-secondary" /> 
          <span className="text-slate-500 font-bold">المحاولات:</span>
          <span className="text-primary font-black text-xl">{moves}</span>
        </div>
        <Button variant="ghost" onClick={init} className="h-12 w-12 rounded-2xl hover:bg-slate-100 text-slate-400">
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>

      {allMatched && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] p-8 text-center mb-8 shadow-xl shadow-emerald-50"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="font-black text-emerald-800 text-2xl mb-2">رائع! ذاكرة قوية</h3>
          <p className="font-bold text-emerald-600 mb-6">أتممت التحدي في {moves} محاولة</p>
          <ScoreSavePrompt gameId="memory" score={moves} detail={`${moves} محاولة`} />
        </motion.div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {cards.map(card => (
          <motion.button
            key={card.id}
            onClick={() => flip(card.id)}
            whileHover={!card.matched && !card.flipped ? { scale: 1.05, y: -2 } : {}}
            whileTap={{ scale: 0.92 }}
            className={`aspect-square rounded-2xl text-4xl flex items-center justify-center transition-all border-2 shadow-sm
              ${card.matched ? "bg-emerald-50 border-emerald-100 grayscale-0" :
                card.flipped ? "bg-white border-primary shadow-lg shadow-primary/10" :
                "bg-slate-50 border-slate-100 hover:border-primary/30 cursor-pointer"}`}
          >
            <AnimatePresence mode="wait">
              {card.flipped || card.matched ? (
                <motion.span 
                  key="front" 
                  initial={{ rotateY: 90, opacity: 0 }} 
                  animate={{ rotateY: 0, opacity: 1 }} 
                  exit={{ rotateY: 90, opacity: 0 }}
                  className="drop-shadow-md"
                >
                  {card.emoji}
                </motion.span>
              ) : (
                <motion.span 
                  key="back" 
                  initial={{ rotateY: 90 }} 
                  animate={{ rotateY: 0 }} 
                  className="text-slate-200"
                >
                  ⚜️
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
