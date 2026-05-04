import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

type Cell = "X" | "O" | null;
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function calcWinner(b: Cell[]): { winner: Cell; line: number[] } | null {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { winner: b[a], line: [a, c, d] };
  }
  return null;
}

export function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [isX, setIsX] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const result = calcWinner(board);
  const draw = !result && board.every(Boolean);

  const click = (i: number) => {
    if (board[i] || result || draw) return;
    const next = [...board]; next[i] = isX ? "X" : "O";
    setBoard(next);
    const r = calcWinner(next);
    if (r) setScores(s => ({ ...s, [r.winner!]: s[r.winner! as "X" | "O"] + 1 }));
    else setIsX(x => !x);
  };

  const reset = () => { setBoard(Array(9).fill(null)); setIsX(true); };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-3">
          <div className={`text-center px-6 py-3 rounded-2xl font-black transition-all border ${isX && !result && !draw ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" : "bg-white text-slate-400 border-slate-100"}`}>
            <div className="text-xs uppercase tracking-wider mb-1">النمر</div>
            <div className="text-2xl">🦁 {scores.X}</div>
          </div>
          <div className={`text-center px-6 py-3 rounded-2xl font-black transition-all border ${!isX && !result && !draw ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20 scale-105" : "bg-white text-slate-400 border-slate-100"}`}>
            <div className="text-xs uppercase tracking-wider mb-1">الثعلب</div>
            <div className="text-2xl">🦊 {scores.O}</div>
          </div>
        </div>
        <Button variant="ghost" onClick={reset} className="h-12 w-12 rounded-2xl hover:bg-slate-100 text-slate-400">
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>

      {(result || draw) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 text-center mb-6 font-black text-xl border shadow-sm ${result ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
          {result ? `🎉 فاز ${result.winner === "X" ? "النمر 🦁" : "الثعلب 🦊"}!` : "🤝 تعادل رائع!"}
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {board.map((cell, i) => {
          const isWinCell = result?.line.includes(i);
          return (
            <motion.button
              key={i}
              onClick={() => click(i)}
              whileHover={!cell && !result ? { scale: 1.05 } : {}}
              whileTap={!cell && !result ? { scale: 0.95 } : {}}
              className={`aspect-square rounded-[1.5rem] text-5xl flex items-center justify-center font-black transition-all border-2
                ${isWinCell ? "bg-emerald-50 border-emerald-400 shadow-lg shadow-emerald-100" :
                  cell ? "bg-slate-50 border-slate-100 cursor-default" :
                  "bg-white border-slate-100 hover:border-primary/30 cursor-pointer shadow-sm"}`}
            >
              <AnimatePresence mode="wait">
                {cell && (
                  <motion.span
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="drop-shadow-md"
                  >
                    {cell === "X" ? "🦁" : "🦊"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      
      {!result && !draw && (
        <p className="text-center mt-8 text-sm font-black text-slate-400 uppercase tracking-widest">
          دور {isX ? "النمر 🦁" : "الثعلب 🦊"}
        </p>
      )}
    </div>
  );
}
