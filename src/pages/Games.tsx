import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, Star, Zap, Users, ChevronLeft, 
  Maximize2, Minimize2, Gamepad2, Search, Filter 
} from "lucide-react";
import { LeaderboardPanel } from "@/components/games/LeaderboardPanel";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// Internal Games
import { ScoutTrivia } from "@/components/games/ScoutTrivia";
import { MemoryGame } from "@/components/games/MemoryGame";
import { WordScramble } from "@/components/games/WordScramble";
import { TicTacToe } from "@/components/games/TicTacToe";
import { NumberGuess } from "@/components/games/NumberGuess";
import { ColorMemory } from "@/components/games/ColorMemory";
import { ChessGame } from "@/components/games/ChessGame";
import { PianoGame } from "@/components/games/PianoGame";

function IframeGameWrapper({ url, title }: { url: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handle = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handle);
    return () => document.removeEventListener("fullscreenchange", handle);
  }, []);

  return (
    <div ref={containerRef} className="w-full aspect-video rounded-3xl overflow-hidden bg-black relative group shadow-2xl">
      <iframe src={url} className="absolute inset-0 w-full h-full border-none" title={title} sandbox="allow-scripts allow-same-origin allow-forms" />
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button 
          variant="secondary" 
          size="icon"
          onClick={toggleFullscreen}
          className="rounded-xl backdrop-blur-md bg-black/40 text-white border-white/20"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </Button>
      </div>
    </div>
  );
}

const GAMES = [
  {
    id: "piano", title: "أنغام الفهود", emoji: "🎹", category: "موسيقية",
    desc: "اعزف أجمل الألحان الكشفية على بيانو المنصة الاحترافي", color: "#4F46E5",
    forKids: true, component: PianoGame,
  },
  {
    id: "chess", title: "شطرنج العمالقة", emoji: "♟️", category: "عامة",
    desc: "تحدي الذكاء الاستراتيجي في لعبة الشطرنج الكلاسيكية مع صديقك", color: "#6D4C41",
    forKids: false, component: ChessGame,
  },
  {
    id: "trivia", title: "ثقافة كشفية", emoji: "🧠", category: "كشفية",
    desc: "اختبر معلوماتك الكشفية في أسئلة متنوعة وشيقة", color: "#1B6B35",
    forKids: false, component: ScoutTrivia,
  },
  {
    id: "memory", title: "الذاكرة الكشفية", emoji: "🃏", category: "كشفية",
    desc: "اعثر على الأزواج المتطابقة من الرموز الكشفية", color: "#2D8A4E",
    forKids: true, component: MemoryGame,
  },
  {
    id: "word", title: "حروف مبعثرة", emoji: "🧩", category: "كشفية",
    desc: "رتّب الحروف لتكوين مصطلحات كشفية صحيحة", color: "#4CAF50",
    forKids: true, component: WordScramble,
  },
  {
    id: "ttt", title: "إكس أو الكشافة", emoji: "🎮", category: "عامة",
    desc: "تحدي الذكاء الكلاسيكي بين النمر والثعلب", color: "#3498DB",
    forKids: true, component: TicTacToe,
  },
  {
    id: "numguess", title: "خمّن الرقم", emoji: "🎯", category: "عامة",
    desc: "خمّن الرقم السري في أقل عدد من المحاولات", color: "#E67E22",
    forKids: false, component: NumberGuess,
  },
  {
    id: "color", title: "تسلسل الألوان", emoji: "🎨", category: "عامة",
    desc: "احفظ ترتيب الألوان وأعد تمثيلها بدقة", color: "#9B59B6",
    forKids: true, component: ColorMemory,
  },
  {
    id: "planes", title: "معركة الطائرات", emoji: "✈️", category: "عامة",
    desc: "لعبة أكشن سريعة لقيادة الطائرات الحربية", color: "#34495E",
    forKids: false, component: () => <IframeGameWrapper url="/games/planes/index.html" title="Planes Battle" />,
  },
  {
    id: "farm", title: "مزرعة الكشافة", emoji: "🌾", category: "تعليمية",
    desc: "ازرع واحصد في مزرعتك الكشفية السعيدة وتعلم أسرار الطبيعة", color: "#8BC34A",
    forKids: true, component: () => <IframeGameWrapper url="/games/farm/bin/index.html" title="Happy Farm" />,
  },
  {
    id: "piano-edu", title: "البيانو الكشفي", emoji: "🎹", category: "تعليمية",
    desc: "تعلم النغمات الموسيقية والأناشيد الكشفية بطريقة تفاعلية.", color: "#4F46E5",
    forKids: true, component: () => <IframeGameWrapper url="/games/piano/index.html" title="Scout Piano" />,
  },
];

const CATS = ["الكل", "كشفية", "عامة", "تعليمية"];
const AGES = ["الكل", "للأطفال", "للكبار"];

export default function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [cat, setCat] = useState("الكل");
  const [age, setAge] = useState("الكل");
  const [search, setSearch] = useState("");

  const filtered = GAMES.filter(g => {
    if (cat !== "الكل" && g.category !== cat) return false;
    if (age === "للأطفال" && !g.forKids) return false;
    if (age === "للكبار" && g.forKids) return false;
    if (search && !g.title.includes(search)) return false;
    return true;
  });

  const active = GAMES.find(g => g.id === activeGame);

  return (
    <SiteLayout>
      <div className="min-h-screen bg-slate-50/50 pb-20" dir="rtl">
        {/* Modern Hero Section */}
        <div className="relative bg-[#1a1a2e] text-white pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="/assets/images/scout-games-hero.png" 
              alt="Games Hero" 
              className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-[20s]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e]/30 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-[#1a1a2e]/60 via-[#1a1a2e]/10 to-transparent"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl bg-black/30 backdrop-blur-sm p-6 rounded-3xl border border-white/10 inline-block">
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/10 mb-6 backdrop-blur-md"
              >
                <Zap className="h-5 w-5 text-secondary animate-pulse" />
                <span className="text-sm font-black tracking-wide uppercase">منصة الألعاب التفاعلية</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-black mb-6 leading-tight"
              >
                العب، تنافس، و<span className="text-secondary">تعلّم</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-white font-medium mb-4 leading-relaxed"
              >
                مجموعة مختارة من الألعاب التعليمية والترفيهية المصممة لتنمية مهاراتك الكشفية والذهنية في بيئة آمنة وممتعة.
              </motion.p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-16 relative z-20">
          {/* Enhanced Filters Bar */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-4 mb-12 flex flex-col lg:flex-row items-center gap-6 border border-slate-100">
            <div className="flex-1 w-full relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="ابحث عن لعبتك المفضلة..." 
                className="w-full pr-12 h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg focus-visible:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-3 shrink-0">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                {CATS.map(c => (
                  <button 
                    key={c} 
                    onClick={() => setCat(c)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${cat === c ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-primary"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                {AGES.map(a => (
                  <button 
                    key={a} 
                    onClick={() => setAge(a)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${age === a ? "bg-secondary text-white shadow-sm" : "text-slate-500 hover:text-secondary"}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!activeGame ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
              {/* Games Grid */}
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-8" layout>
                <AnimatePresence>
                  {filtered.map((game, i) => (
                    <motion.div
                      key={game.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all cursor-pointer"
                      onClick={() => setActiveGame(game.id)}
                    >
                      <div className="h-48 flex items-center justify-center text-8xl relative overflow-hidden" style={{ backgroundColor: game.color + "10" }}>
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${game.color} 1px, transparent 0)`, backgroundSize: '24px 24px' }}></div>
                        <motion.span 
                          whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                          className="relative z-10 drop-shadow-xl"
                        >
                          {game.emoji}
                        </motion.span>
                        <div className="absolute top-4 right-4 flex gap-2">
                          <Badge className="font-black px-3 py-1 rounded-lg border-none shadow-sm" style={{ backgroundColor: game.color, color: "white" }}>
                            {game.category}
                          </Badge>
                          {game.forKids && <Badge variant="secondary" className="font-black px-3 py-1 rounded-lg bg-amber-100 text-amber-700 border-none shadow-sm">أطفال</Badge>}
                        </div>
                      </div>
                      
                      <div className="p-8">
                        <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-primary transition-colors">{game.title}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-6">{game.desc}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-primary font-black group-hover:gap-4 transition-all">
                            العب الآن <ChevronLeft className="h-5 w-5" />
                          </div>
                          <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                            <Gamepad2 size={20} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {filtered.length === 0 && (
                  <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="text-6xl mb-6">🔍</div>
                    <h3 className="text-2xl font-black text-slate-400">لم نجد أي ألعاب تطابق بحثك</h3>
                    <Button variant="link" onClick={() => {setSearch(""); setCat("الكل"); setAge("الكل");}} className="mt-4 font-bold text-primary">إعادة ضبط المرشحات</Button>
                  </div>
                )}
              </motion.div>

              {/* Sidebar: Leaderboard */}
              <aside className="lg:sticky lg:top-24">
                <LeaderboardPanel />
                
                <Card className="mt-8 overflow-hidden border-none shadow-xl shadow-secondary/5 bg-gradient-to-br from-secondary to-[#d48806] text-white">
                  <CardContent className="p-8">
                    <Trophy className="h-12 w-12 mb-4 opacity-50" />
                    <h4 className="text-xl font-black mb-2">تحديات أسبوعية</h4>
                    <p className="text-white/80 font-medium text-sm mb-6">شارك في التحديات الأسبوعية لتحصل على أوسمة حصرية لملفك الشخصي.</p>
                    <Button variant="secondary" className="w-full font-black rounded-xl h-12 shadow-lg shadow-black/10">قريباً</Button>
                  </CardContent>
                </Card>
              </aside>
            </div>
          ) : (
            /* Active Game View */
            <motion.div 
              key="active-game"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-5">
                  <Button 
                    variant="ghost" 
                    onClick={() => setActiveGame(null)} 
                    className="h-14 w-14 rounded-2xl bg-white shadow-sm hover:bg-slate-50 text-primary border border-slate-100"
                  >
                    <ChevronLeft className="h-6 w-6 rotate-180" />
                  </Button>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl drop-shadow-md">{active?.emoji}</span>
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 leading-tight">{active?.title}</h2>
                      <p className="text-slate-500 font-bold">{active?.desc}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className="font-black px-4 py-1.5 rounded-xl border-none shadow-md" style={{ backgroundColor: active?.color, color: "white" }}>
                    {active?.category}
                  </Badge>
                  <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400">
                    <Users size={18} />
                  </div>
                </div>
              </div>

              <AuthGuard title="سجل دخولك للمنافسة" description="تحتاج لتسجيل الدخول لحفظ نقاطك وتصدر قائمة المتصدرين.">
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-6 md:p-12 border border-slate-100 overflow-hidden min-h-[500px] flex items-center justify-center">
                  <div className="w-full max-w-2xl">
                    {active && <active.component />}
                  </div>
                </div>
              </AuthGuard>
            </motion.div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
