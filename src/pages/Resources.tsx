import { useState } from "react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { 
  Gamepad2, Music, Accessibility, 
  Tv, Heart, Brain, Eye, UserCheck,
  Play, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudioEncyclopedia } from "@/components/resources/AudioEncyclopedia";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
const THERAPEUTIC_CATEGORIES = [
  {
    id: "mobility",
    title: "الإعاقة الحركية",
    description: "تطوير المهارات الحركية والاعتماد على النفس من خلال أنشطة كشفية مكيفة.",
    color: "from-orange-500 to-red-600",
    icon: UserCheck,
    content: "تشمل البرامج التمارين الحركية، ألعاب التوازن، والمغامرات الخارجية المصممة لمستخدمي الكراسي المتحركة."
  },
  {
    id: "intellectual",
    title: "الإعاقة الذهنية",
    description: "تعزيز القدرات المعرفية والاجتماعية عبر التعلم باللعب والترميز البسيط.",
    color: "from-blue-500 to-indigo-600",
    icon: Brain,
    content: "نستخدم خرائط بصرية وجداول زمنية مصورة لمساعدة الكشافين على فهم المهام والتقاليد الكشفية."
  },
  {
    id: "autism",
    title: "اضطراب طيف التوحد",
    description: "بيئة هادئة ومحفزة تراعي الحساسية الحسية وتدعم التواصل الاجتماعي.",
    color: "from-emerald-400 to-teal-600",
    icon: Heart,
    content: "تصميم أنشطة منخفضة التحفيز (Low Stimulus) مع توفير مساحات هدوء داخل المخيمات."
  },
  {
    id: "sensory",
    title: "الإعاقة الحسية",
    description: "استكشاف العالم من خلال الحواس البديلة (السمع، اللمس، والشم).",
    color: "from-purple-500 to-pink-600",
    icon: Eye,
    content: "دروس في لغة الإشارة، خرائط بارزة (برايل)، وأنشطة تعتمد على التمييز السمعي."
  }
];

];

export default function Resources() {
  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pb-20 overflow-x-hidden" dir="rtl">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary/5 border-b overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-200/[0.05] bg-[bottom_left_-20px]" />
        <div className="container relative z-10 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
              الموارد والشمولية
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              المركز المعرفي لـ <span className="text-primary">كشافة الفهود</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              نؤمن بأن الكشفية للجميع. نوفر موارد تعليمية، ألعاباً رقمية، وبرامج متخصصة لدعم التميز والشمولية في الحركة الكشفية.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container px-4 py-12 space-y-24">
        
        {/* Therapeutic Recreation Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Accessibility className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">الترويح العلاجي والدمج</h2>
              <p className="text-muted-foreground">برامج متخصصة لكل فئات المجتمع الكشفي</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {THERAPEUTIC_CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full group hover:shadow-2xl transition-all duration-500 border-none relative overflow-hidden">
                  <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${cat.color} group-hover:opacity-20 transition-opacity`} />
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                      <cat.icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-xl font-bold">{cat.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{cat.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      {cat.content}
                    </p>
                    <Button type="button" variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors border-primary/20" onClick={() => {}}>
                      استكشاف البرنامج
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>


        {/* Audio & YouTube Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Audio Encyclopedia */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                <Music className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">الموسوعة الصوتية الكشفية</h2>
                <p className="text-sm text-muted-foreground">المنهج الكشفي مسموعاً لدعم المكفوفين وضعاف البصر</p>
              </div>
            </div>
            <AudioEncyclopedia />
          </div>

          {/* YouTube Feed */}
          <div className="lg:col-span-5 space-y-8">
             <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 shadow-sm">
                <Tv className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">بث الدمج الكشفي</h2>
                <p className="text-sm text-muted-foreground">قناة الكشفية والاحتياجات الخاصة</p>
              </div>
            </div>
            <Card className="h-[430px] overflow-hidden border-2 border-red-500/10 hover:border-red-500/20 transition-all bg-gradient-to-br from-background to-red-50/30">
              <YouTubeFeed />
            </Card>
          </div>
        </div>

      </div>
      </div>
    </SiteLayout>
  );
}

function YouTubeFeed() {
  const { data, isLoading } = useQuery<{ videos: any[] }>({
    queryKey: ["/api/youtube/videos"],
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="text-sm text-muted-foreground">جارٍ جلب المحتوى...</p>
      </div>
    );
  }

  const videos = data?.videos?.slice(0, 4) || [];

  if (videos.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
          <Play className="w-10 h-10 text-red-600 fill-current ml-1" />
        </div>
        <h4 className="font-bold">قريباً: فيديوهات الدمج</h4>
        <p className="text-sm text-muted-foreground max-w-[200px]">
          سنقوم بنشر فيديوهات تعليمية حول الدمج والترويح العلاجي قريباً.
        </p>
        <Link href="/videos">
          <Button type="button" variant="secondary" className="bg-red-500 text-white hover:bg-red-600" aria-label="مكتبة الفيديو">
            مكتبة الفيديو
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-red-500/10 flex justify-between items-center bg-red-500/5">
        <span className="text-xs font-bold text-red-600">أحدث الدروس المصورة</span>
        <Badge variant="outline" className="text-[10px] border-red-500/20 text-red-600 animate-pulse">مباشر</Badge>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {videos.map((video) => (
          <Dialog key={video.id}>
            <DialogTrigger asChild>
              <button 
                className="flex gap-3 group w-full text-right hover:bg-muted/50 p-2 rounded-xl transition-colors"
                aria-label={`شاهد فيديو: ${video.title}`}
              >
                <div className="relative shrink-0 w-24 h-16 rounded-md overflow-hidden bg-muted">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <h5 className="text-[11px] font-bold line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">{video.title}</h5>
                  <span className="text-[9px] text-muted-foreground mt-1">منذ وقت قصير</span>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none aspect-video">
              <iframe 
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                className="w-full h-full border-none"
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              />
            </DialogContent>
          </Dialog>
        ))}
      </div>
      <div className="p-4 bg-muted/30 border-t">
        <Link href="/videos">
          <Button type="button" variant="outline" className="w-full text-xs font-bold border-red-500/20 hover:bg-red-500 hover:text-white transition-all" aria-label="عرض كل الفيديوهات">
            شاهد جميع الفيديوهات
          </Button>
        </Link>
      </div>
    </div>
  );
}