import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Star, Heart, Trophy, UserPlus, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const MOCK_HEROES = [
  {
    id: 1,
    name: "أحمد محمود",
    type: "therapeutic",
    category: "إعاقة حركية",
    story: "تجاوز تحدي الإعاقة الحركية وأصبح قائداً لفرقة الأشبال، حيث أثبت أن العزيمة تتغلب على كل الصعاب.",
    image: "https://images.unsplash.com/photo-1574861868582-841f391c5e62?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 2,
    name: "سارة عبد الرحمن",
    type: "regular",
    category: "قائدة كشفية",
    story: "ساهمت في تدريب أكثر من 500 كشاف وكشافة على مبادئ الدمج والتعامل مع ذوي الاحتياجات الخاصة.",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400",
  },
];

const MOCK_PARENTS = [
  {
    id: 1,
    name: "مريم حسن",
    role: "الأم المثالية",
    year: "2026",
    story: "رافقت ابنها من ذوي التوحد في كل خطوة كشفية، وكانت الداعم الأول له حتى حصل على وسام الصقر.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 2,
    name: "خالد إبراهيم",
    role: "الأب المثالي",
    year: "2026",
    story: "أسس مبادرة 'كشافة بلا حدود' لدعم الأطفال ذوي الإعاقة الحركية بعد نجاح تجربة ابنه في الكشافة.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
  }
];

export function HallOfFame() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"heroes" | "parents">("heroes");

  const handleNominate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "تم استلام ترشيحك بنجاح!",
      description: "سيقوم الذكاء الاصطناعي الخاص بالمنصة بدراسة الحالة. سيتم الإعلان عن الفائزين في 21 مارس القادم.",
    });
  };

  return (
    <div className="space-y-8" id="hall-of-fame">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600 shadow-sm">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">لوحة الشرف</h2>
            <p className="text-muted-foreground">نحتفي بأبطالنا وصناع الأمل في عالم الفهود الكشفي</p>
          </div>
        </div>
        
        <div className="flex bg-muted p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("heroes")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === "heroes" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            أبطال الكشافة
          </button>
          <button
            onClick={() => setActiveTab("parents")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === "parents" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            الآباء والأمهات المثاليين
          </button>
        </div>
      </div>

      {activeTab === "heroes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_HEROES.map((hero) => (
            <motion.div
              key={hero.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full overflow-hidden hover:shadow-xl transition-all border-2 border-primary/5">
                <div className="relative h-48">
                  <img src={hero.image} alt={hero.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                    <div>
                      <Badge className="mb-2 bg-yellow-500 text-white border-none">{hero.category}</Badge>
                      <h3 className="text-xl font-bold text-white">{hero.name}</h3>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-muted-foreground leading-relaxed">"{hero.story}"</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "parents" && (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative z-10 space-y-4">
              <Badge className="bg-white/20 text-white border-none">يوم 21 مارس من كل عام</Badge>
              <h3 className="text-2xl md:text-3xl font-black">جائزة الأم والأب المثالي</h3>
              <p className="text-blue-100 max-w-xl leading-relaxed">
                هل تعرف أماً أو أباً قدموا دعماً استثنائياً لأبنائهم في الكشافة؟ شاركنا قصتهم. سيقوم الذكاء الاصطناعي الخاص بالمنصة بدراسة الترشيحات واختيار 3 فائزين كل عام في عيد الأم.
              </p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-black h-14 px-8 rounded-xl shrink-0 z-10 shadow-xl">
                  <UserPlus className="mr-2 w-5 h-5" /> رشّح الآن
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white text-slate-800" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-primary">استمارة الترشيح</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleNominate} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>اسم المرشح (الأم أو الأب)</Label>
                    <Input required placeholder="اكتب الاسم الكامل" />
                  </div>
                  <div className="space-y-2">
                    <Label>صلة القرابة بالكشاف</Label>
                    <Input required placeholder="مثال: والد الكشاف أحمد" />
                  </div>
                  <div className="space-y-2">
                    <Label>قصة الكفاح والدعم</Label>
                    <Textarea required placeholder="اخبرنا لماذا يستحق/تستحق هذا اللقب؟ كيف ساعد الكشاف في تجاوز التحديات؟" className="min-h-[120px]" />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white">
                    إرسال الترشيح للتحليل
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_PARENTS.map((parent) => (
              <motion.div
                key={parent.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all border-2 border-primary/5">
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="sm:w-2/5 relative h-48 sm:h-auto shrink-0">
                      <img src={parent.image} alt={parent.name} className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary/90 text-white backdrop-blur-sm border-none shadow-sm">
                          {parent.role} {parent.year}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col justify-center sm:w-3/5 bg-slate-50">
                      <h3 className="text-xl font-bold text-primary mb-3">{parent.name}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">"{parent.story}"</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
