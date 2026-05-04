import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Star, Heart, UserPlus, Info, 
  ChevronLeft, Award, Eye, ThumbsUp, TrendingUp,
  Search, Filter, Calendar
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/authContext";
import { useHallOfFameStore, Nominee } from "@/lib/hallOfFameStore";
import { Progress } from "@/components/ui/progress";

export default function HallOfFamePage() {
  const { toast } = useToast();
  const { state: authState } = useAuth();
  const { nominees, winners, addNominee, vote, incrementView } = useHallOfFameStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "mother" | "father">("all");
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);

  const filteredNominees = nominees
    .filter(n => n.status === 'active')
    .filter(n => {
      if (activeFilter !== "all" && n.relationship.toLowerCase() !== activeFilter) return false;
      if (searchQuery && !n.nomineeName.includes(searchQuery)) return false;
      return true;
    })
    .sort((a, b) => b.votes - a.votes);

  const getWinnerByRank = (rank: number) => {
    const winner = winners.find(w => w.rank === rank);
    return nominees.find(n => n.id === winner?.nomineeId);
  };

  const handleNominateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!authState.user) {
      toast({ title: "عذراً", description: "يجب عليك تسجيل الدخول للقيام بالترشيح", variant: "destructive" });
      return;
    }

    const formData = new FormData(e.currentTarget);
    addNominee({
      nominatorId: authState.user.id.toString(),
      nominatorName: authState.user.fullName,
      nomineeName: formData.get("nomineeName") as string,
      relationship: formData.get("relationship") as string,
      description: formData.get("description") as string,
      image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=400"
    });

    toast({
      title: "تم استلام ترشيحك!",
      description: "تمت إضافة الترشيح بنجاح. سيتم الإعلان عن النتائج النهائية قريباً.",
    });
    (e.target as HTMLFormElement).reset();
  };

  const handleVote = (nomineeId: string) => {
    if (!authState.user) {
      toast({ title: "تنبيه", description: "يرجى تسجيل الدخول لتتمكن من التصويت", variant: "destructive" });
      return;
    }

    const result = vote(authState.user.id.toString(), nomineeId);
    if (result.success) {
      toast({ title: "شكراً لك!", description: result.message });
    } else {
      toast({ title: "عذراً", description: result.message, variant: "destructive" });
    }
  };

  const WinnerCard = ({ rank, nominee }: { rank: number; nominee?: Nominee }) => {
    if (!nominee) return null;
    
    const sizeClasses = {
      1: "w-64 h-64 scale-110 z-30 shadow-2xl shadow-yellow-500/20",
      2: "w-56 h-56 z-20 shadow-xl",
      3: "w-56 h-56 z-20 shadow-xl",
      4: "w-48 h-48 z-10 shadow-lg"
    }[rank as 1|2|3|4];

    const rankColors = {
      1: "border-yellow-400 bg-yellow-50",
      2: "border-slate-300 bg-slate-50",
      3: "border-amber-600 bg-amber-50",
      4: "border-primary/20 bg-primary/5"
    }[rank as 1|2|3|4];

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 group"
      >
        <div className={`relative rounded-3xl border-4 ${rankColors} p-2 ${sizeClasses} transition-transform group-hover:scale-[1.15]`}>
          <img 
            src={winners.find(w => w.nomineeId === nominee.id)?.familyPhoto || nominee.image} 
            alt={nominee.nomineeName} 
            className="w-full h-full object-cover rounded-2xl" 
          />
          <div className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg border border-slate-100">
            {rank === 1 && <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-500" />}
            {rank === 2 && <Award className="w-8 h-8 text-slate-400" />}
            {rank === 3 && <Award className="w-8 h-8 text-amber-700" />}
            {rank === 4 && <Star className="w-8 h-8 text-primary" />}
          </div>
        </div>
        <div className="text-center">
          <h4 className="text-xl font-black text-slate-800">{nominee.nomineeName}</h4>
          <p className="text-sm text-primary font-bold">مرشح من قبل: {nominee.nominatorName}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans" dir="rtl">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] pt-32 pb-48 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 border border-white/20 mb-8 backdrop-blur-md"
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-black tracking-widest uppercase">لوحة الشرف الكبرى</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">نحتفي بـ <span className="text-secondary">صنّاع الأمل</span></h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto font-medium leading-relaxed">
              تكريم استثنائي للأمهات والآباء الذين بذلوا الغالي والنفيس لدعم مسيرة أبنائهم الكشفية. لوحة الشرف هي مساحتكم للتقدير والامتنان.
            </p>
          </div>
        </div>

        {/* Winners Pyramid */}
        <div className="container mx-auto px-4 -mt-32 relative z-20">
          <div className="bg-white/80 backdrop-blur-xl rounded-[4rem] p-12 shadow-2xl border border-white/40 mb-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-slate-800 mb-2">الفائزون الحاليون</h2>
              <p className="text-slate-500 font-bold">الأربعة الأوائل الحاصلين على أعلى ترشيح وتفاعل</p>
            </div>

            <div className="flex flex-col items-center gap-12">
              {/* Rank 1 */}
              <WinnerCard rank={1} nominee={getWinnerByRank(1)} />
              
              {/* Ranks 2 & 3 */}
              <div className="flex flex-wrap justify-center gap-16 md:gap-32">
                <WinnerCard rank={2} nominee={getWinnerByRank(2)} />
                <WinnerCard rank={3} nominee={getWinnerByRank(3)} />
              </div>

              {/* Rank 4 */}
              <WinnerCard rank={4} nominee={getWinnerByRank(4)} />
            </div>
            
            <div className="mt-20 p-8 rounded-3xl bg-primary/5 border border-primary/10 text-center">
              <p className="text-primary font-black flex items-center justify-center gap-2">
                <Info className="w-5 h-5" />
                سيتم الإعلان عن الجوائز الكبرى للفائزين قريباً عبر قنواتنا الرسمية.
              </p>
            </div>
          </div>

          {/* Nomination Control Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  placeholder="ابحث عن اسم مرشح..." 
                  className="w-full pr-12 h-14 rounded-2xl border-none bg-white shadow-sm font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex bg-white p-1.5 rounded-2xl shadow-sm">
                {(["all", "mother", "father"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all ${
                      activeFilter === f ? "bg-primary text-white" : "text-slate-500 hover:text-primary"
                    }`}
                  >
                    {f === "all" ? "الكل" : f === "mother" ? "الأمهات" : "الآباء"}
                  </button>
                ))}
              </div>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-14 rounded-2xl bg-secondary text-white font-black text-lg hover:bg-secondary/90 shadow-lg shadow-secondary/20">
                  <UserPlus className="ml-2 w-6 h-6" /> رشّح من تحب الآن
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl bg-white p-0 overflow-hidden rounded-[2rem]" dir="rtl">
                <div className="bg-primary p-8 text-white">
                  <h3 className="text-3xl font-black mb-2">استمارة ترشيح</h3>
                  <p className="text-white/80 font-medium">شاركنا قصة بطل حقيقي في حياة الكشاف</p>
                </div>
                <form onSubmit={handleNominateSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold">اسم المرشح</Label>
                      <Input name="nomineeName" required placeholder="الاسم الكامل" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">الصلة</Label>
                      <select name="relationship" className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium">
                        <option value="mother">الأم</option>
                        <option value="father">الأب</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">قصة الترشيح</Label>
                    <Textarea name="description" required placeholder="لماذا يستحق هذا الشخص التكريم؟ احكِ لنا عن دوره في مسيرة الكشاف." className="min-h-[150px] rounded-xl" />
                  </div>
                  <Button type="submit" className="w-full h-14 bg-secondary text-white font-black text-lg rounded-xl">إرسال الترشيح للمراجعة</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Nominees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredNominees.map((nominee, idx) => {
                const totalVotes = nominees.reduce((acc, curr) => acc + curr.votes, 0);
                const votePercentage = totalVotes > 0 ? (nominee.votes / totalVotes) * 100 : 0;
                
                return (
                  <motion.div
                    key={nominee.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all"
                  >
                    <div className="relative h-64">
                      <img src={nominee.image} alt={nominee.nomineeName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                        <Badge className="w-fit mb-3 bg-white/20 backdrop-blur-md border-none text-white font-bold">
                          {nominee.relationship === 'mother' ? 'الأم المثالية' : 'الأب المثالي'}
                        </Badge>
                        <h3 className="text-2xl font-black text-white">{nominee.nomineeName}</h3>
                      </div>
                      <button 
                        onClick={() => { setSelectedNominee(nominee); incrementView(nominee.id); }}
                        className="absolute top-6 left-6 h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Info size={20} />
                      </button>
                    </div>
                    
                    <div className="p-8">
                      <p className="text-slate-500 font-medium line-clamp-3 mb-8 h-[72px]">
                        "{nominee.description}"
                      </p>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between text-sm font-black">
                          <span className="text-slate-400">نسبة الترشيحات</span>
                          <span className="text-primary">{votePercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={votePercentage} className="h-2 bg-slate-100" />
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-xs font-black">{nominee.votes}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-black">{nominee.views}</span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleVote(nominee.id)}
                          className="h-11 px-6 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white font-black transition-all gap-2"
                        >
                          <Heart className="w-4 h-4" /> ترشيح
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          {filteredNominees.length === 0 && (
            <div className="py-32 text-center">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Search size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-400">لا يوجد مرشحون حالياً بهذا الاسم</h3>
              <Button variant="link" onClick={() => {setSearchQuery(""); setActiveFilter("all");}} className="mt-4 font-bold text-primary">إعادة تعيين البحث</Button>
            </div>
          )}
        </div>
      </div>

      {/* Nominee Detail Modal */}
      <Dialog open={!!selectedNominee} onOpenChange={(open) => !open && setSelectedNominee(null)}>
        <DialogContent className="max-w-3xl bg-white p-0 overflow-hidden rounded-[2.5rem]" dir="rtl">
          {selectedNominee && (
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-2/5 h-64 md:h-auto">
                <img src={selectedNominee.image} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="md:w-3/5 p-10 flex flex-col">
                <Badge className="w-fit mb-4 bg-primary text-white border-none">
                  {selectedNominee.relationship === 'mother' ? 'الأم المثالية' : 'الأب المثالي'}
                </Badge>
                <h3 className="text-3xl font-black text-slate-800 mb-2">{selectedNominee.nomineeName}</h3>
                <p className="text-primary font-bold mb-8">مرشح من قبل: {selectedNominee.nominatorName}</p>
                
                <div className="flex-1 overflow-y-auto mb-8 pr-2 custom-scrollbar">
                  <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-secondary" /> قصة الكفاح
                  </h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {selectedNominee.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-auto">
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-800">{selectedNominee.votes}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">ترشيح</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-800">{selectedNominee.views}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">مشاهدة</p>
                    </div>
                  </div>
                  <Button onClick={() => handleVote(selectedNominee.id)} size="lg" className="h-14 px-10 rounded-2xl bg-secondary text-white font-black hover:bg-secondary/90 shadow-lg shadow-secondary/20">
                    أعطِ صوتك لهذا المرشح
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
