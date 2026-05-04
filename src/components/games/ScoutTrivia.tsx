import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScoreSavePrompt } from "./ScoreSavePrompt";

const TRIVIA = [
  { q: "ما شعار الكشافة العالمي؟", choices: ["كن مستعداً", "افعل الخير", "أنا أستطيع", "معاً نبني"], answer: 0 },
  { q: "من هو مؤسس حركة الكشافة العالمية؟", choices: ["نيلسون مانديلا", "روبرت بادن باول", "ونستون تشرشل", "غاندي"], answer: 1 },
  { q: "في أي عام تأسست الكشافة؟", choices: ["1890", "1907", "1920", "1945"], answer: 1 },
  { q: "ما معنى كلمة SCOUT بالإنجليزية؟", choices: ["المغامر", "الرائد", "الشجاع", "الخبير"], answer: 1 },
  { q: "كم يوماً يستمر الجمبوري العالمي عادةً؟", choices: ["5 أيام", "10 أيام", "12 يوم", "3 أسابيع"], answer: 2 },
  { q: "ما رمز الكشافة الشهير؟", choices: ["النسر", "الأسد", "زهرة الزنبق", "النجمة"], answer: 2 },
  { q: "ما أول شيء يتعلمه الكشاف في البرية؟", choices: ["الطبخ", "إشعال النار", "بناء الخيمة", "قراءة الخريطة"], answer: 1 },
  { q: "كم عدد الأركان الأساسية للوعد الكشفي؟", choices: ["2", "3", "5", "7"], answer: 1 },
];

export function ScoutTrivia() {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const pick = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    const correct = i === TRIVIA[idx].answer;
    if (correct) {
      setScore(s => s + 1);
      toast({ title: "✅ إجابة صحيحة!", description: "أحسنت! تابع الأسئلة." });
    } else {
      toast({ title: "❌ إجابة خاطئة", description: `الصواب: ${TRIVIA[idx].choices[TRIVIA[idx].answer]}`, variant: "destructive" });
    }
    setTimeout(() => {
      if (idx + 1 >= TRIVIA.length) { setDone(true); }
      else { setIdx(i => i + 1); setChosen(null); }
    }, 1200);
  };

  const restart = () => { setIdx(0); setScore(0); setChosen(null); setDone(false); };

  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
      <div className="text-7xl mb-4">{score >= 6 ? "🏆" : score >= 4 ? "🥈" : "🌱"}</div>
      <h3 className="text-3xl font-black text-primary mb-2">انتهت اللعبة!</h3>
      <p className="text-5xl font-black text-secondary mb-1">{score} / {TRIVIA.length}</p>
      <p className="text-muted-foreground mb-8 font-bold">{score >= 6 ? "خبير كشفي حقيقي! 🎖️" : score >= 4 ? "أداء جيد، واصل التعلم 📚" : "لا بأس، حاول مرة أخرى 💪"}</p>
      <Button onClick={restart} className="bg-primary text-white gap-2 rounded-full px-10 h-14 text-lg font-black"><RotateCcw className="h-5 w-5" /> العب مجدداً</Button>
      <ScoreSavePrompt gameId="trivia" score={score} detail={`${score} / ${TRIVIA.length}`} />
    </motion.div>
  );

  const q = TRIVIA[idx];
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <Badge variant="secondary" className="text-sm font-black px-4 py-1.5 rounded-xl bg-slate-100 text-slate-600">سؤال {idx + 1} / {TRIVIA.length}</Badge>
        <div className="flex items-center gap-2 text-secondary font-black text-xl"><Star className="h-5 w-5 fill-secondary" /> {score}</div>
      </div>
      <div className="mb-8 h-3 bg-slate-100 rounded-full overflow-hidden">
        <motion.div className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(98,33,129,0.3)]" animate={{ width: `${((idx) / TRIVIA.length) * 100}%` }} />
      </div>
      <h3 className="text-2xl font-black text-slate-800 mb-8 leading-relaxed text-center">{q.q}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {q.choices.map((c, i) => {
          let cls = "border-2 border-slate-100 hover:border-primary text-right p-5 rounded-2xl font-black transition-all cursor-pointer text-slate-700 bg-white shadow-sm";
          if (chosen !== null) {
            if (i === q.answer) cls = "border-2 border-emerald-500 bg-emerald-50 text-emerald-700 text-right p-5 rounded-2xl font-black shadow-lg shadow-emerald-100";
            else if (i === chosen) cls = "border-2 border-red-400 bg-red-50 text-red-600 text-right p-5 rounded-2xl font-black shadow-lg shadow-red-100";
            else cls = "border-2 border-slate-50 opacity-40 text-right p-5 rounded-2xl font-black text-slate-300";
          }
          return (
            <motion.button 
              key={i} 
              onClick={() => pick(i)} 
              className={`w-full group ${cls}`}
              whileHover={chosen === null ? { y: -2, scale: 1.02 } : {}} 
              whileTap={chosen === null ? { scale: 0.98 } : {}}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 ml-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">{["أ", "ب", "ج", "د"][i]}</span>
              {c}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
