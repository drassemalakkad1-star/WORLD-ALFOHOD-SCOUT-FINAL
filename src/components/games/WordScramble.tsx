import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScoreSavePrompt } from "./ScoreSavePrompt";

const SCOUT_WORDS = [
  { word: "كشافة", hint: "حركة شبابية عالمية" },
  { word: "خيمة", hint: "مسكن الكشاف في المخيم" },
  { word: "بوصلة", hint: "أداة الملاحة والاتجاه" },
  { word: "مخيم", hint: "تجمع كشفي في الطبيعة" },
  { word: "شجاعة", hint: "من قيم الكشافة" },
  { word: "زنبق", hint: "رمز الكشافة المشهور" },
];

function scramble(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join("");
  return result === word ? scramble(word) : result;
}

export function WordScramble() {
  const [idx, setIdx] = useState(0);
  const [scrambled, setScrambled] = useState(() => scramble(SCOUT_WORDS[0].word));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const check = () => {
    const correct = input.trim() === SCOUT_WORDS[idx].word;
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (idx + 1 >= SCOUT_WORDS.length) { setDone(true); return; }
      const next = idx + 1;
      setIdx(next); setScrambled(scramble(SCOUT_WORDS[next].word)); setInput(""); setResult(null);
    }, 1000);
  };

  const restart = () => { setIdx(0); setScrambled(scramble(SCOUT_WORDS[0].word)); setInput(""); setScore(0); setResult(null); setDone(false); };

  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
      <div className="text-7xl mb-4">🧩</div>
      <h3 className="text-3xl font-black text-primary mb-2">انتهت اللعبة!</h3>
      <p className="text-5xl font-black text-secondary mb-6">{score} / {SCOUT_WORDS.length}</p>
      <Button onClick={restart} className="bg-primary text-white rounded-full px-10 h-14 text-lg font-black gap-2"><RotateCcw className="h-5 w-5" /> مجدداً</Button>
      <ScoreSavePrompt gameId="word" score={score} detail={`${score} / ${SCOUT_WORDS.length}`} />
    </motion.div>
  );

  const w = SCOUT_WORDS[idx];
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Badge variant="outline" className="font-black px-4 py-1 rounded-xl border-slate-200 text-slate-500">{idx + 1} / {SCOUT_WORDS.length}</Badge>
        <div className="flex items-center gap-2 text-secondary font-black text-xl"><Star className="h-5 w-5 fill-secondary" /> {score}</div>
      </div>
      
      <div className="text-center mb-10">
        <p className="text-slate-400 font-bold mb-6">رتّب الحروف لتكوين الكلمة الصحيحة:</p>
        <div className="flex justify-center gap-3 flex-wrap mb-6">
          {scrambled.split("").map((ch, i) => (
            <motion.div 
              key={i} 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="h-14 w-14 bg-white text-primary rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border border-slate-50"
            >
              {ch}
            </motion.div>
          ))}
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block">
          <p className="text-sm text-slate-500 font-bold">💡 تلميح: <span className="text-slate-800">{w.hint}</span></p>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`text-center p-4 rounded-2xl mb-6 font-black text-lg ${result === "correct" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
          {result === "correct" ? "✅ إجابة صحيحة!" : `❌ خطأ، الكلمة هي: ${w.word}`}
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        <input
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="اكتب إجابتك هنا..."
          className="w-full border-2 border-slate-100 rounded-2xl px-6 py-4 text-center text-2xl font-black text-primary focus:border-primary outline-none bg-slate-50 transition-all focus:bg-white focus:shadow-xl focus:shadow-primary/5"
        />
        <Button onClick={check} className="h-16 w-full bg-primary text-white rounded-2xl text-xl font-black shadow-lg shadow-primary/20">تحقق من الإجابة</Button>
      </div>
    </div>
  );
}
