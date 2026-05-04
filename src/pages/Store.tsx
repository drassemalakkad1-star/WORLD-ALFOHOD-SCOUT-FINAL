import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { 
  ShoppingBag, Star, Sparkles, Tent, 
  Baby, Compass, ShieldCheck, PenTool,
  Ticket, Gift, Search, ArrowLeft, ArrowRight,
  TrendingUp, Award, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { collections } from "@/data/collections";
import { products } from "@/data/products";
import { ProductCard } from "@/components/store/ProductCard";
import { CinematicHeroSlider, CinematicSlide } from "@/components/store/CinematicHeroSlider";
import { OffersTicker } from "@/components/store/OffersTicker";

export default function Store() {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [searchQuery, setSearchQuery] = useState("");

  const featuredProducts = useMemo(() => {
    return products.filter(p => p.tag === "الأكثر مبيعاً" || p.tag === "حصري").slice(0, 4);
  }, []);

  const newArrivals = useMemo(() => {
    return products.filter(p => p.tag === "جديد").slice(0, 4);
  }, []);

  const heroSlides: CinematicSlide[] = [
    {
      id: "store-hero-1",
      badge: "وصل حديثاً",
      title: "مجموعة الجمبوري 2026",
      subtitle: "استعد لأكبر حدث كشفي مع الإصدار المحدود من الملابس والمعدات الرسمية المصممة للتميز.",
      ctaLabel: "تصفح المجموعة",
      ctaHref: "/store/c/events",
      image: "/src/assets/images/jamboree.webp",
      accent: "#F5B041",
      background: "linear-gradient(135deg, #050505 0%, #2a1a08 50%, #050505 100%)",
    },
    {
      id: "store-hero-2",
      badge: "حصري",
      title: "أزياء عالم الفهود",
      subtitle: "الجودة التي تليق بقادة الغد. أقمشة متينة وتصاميم مريحة لكل مغامرة كشفية.",
      ctaLabel: "شراء الآن",
      ctaHref: "/store/c/leaders",
      image: "/src/assets/images/store-hero.webp",
      accent: "#4D006E",
      background: "linear-gradient(135deg, #050505 0%, #1a1408 50%, #050505 100%)",
    },
    {
      id: "store-hero-3",
      badge: "مغامرة",
      title: "معدات التخييم الاحترافية",
      subtitle: "خيام، حقائب، وأدوات أساسية تم اختبارها في أقسى الظروف لتكون رفيقك الدائم.",
      ctaLabel: "استكشف المعدات",
      ctaHref: "/store/c/camping",
      image: "/src/assets/images/hero.webp",
      accent: "#27AE60",
      background: "linear-gradient(135deg, #050505 0%, #082a08 50%, #050505 100%)",
    }
  ];

  const getCollectionIcon = (iconName: string) => {
    switch (iconName) {
      case "Sparkles": return <Sparkles className="h-6 w-6" />;
      case "Baby": return <Baby className="h-6 w-6" />;
      case "Compass": return <Compass className="h-6 w-6" />;
      case "ShieldCheck": return <ShieldCheck className="h-6 w-6" />;
      case "PenTool": return <PenTool className="h-6 w-6" />;
      case "Tent": return <Tent className="h-6 w-6" />;
      case "Ticket": return <Ticket className="h-6 w-6" />;
      case "Gift": return <Gift className="h-6 w-6" />;
      default: return <ShoppingBag className="h-6 w-6" />;
    }
  };

  return (
    <SiteLayout>
      <div className="bg-background">
        <CinematicHeroSlider slides={heroSlides} />

        <OffersTicker
          items={[
            { id: "o1", icon: "tag", text: "توصيل مجاني للطلبات أكثر من 50$" },
            { id: "o2", icon: "zap", text: "خصم 15% بمناسبة يوم الأخوة الكشفي" },
            { id: "o3", icon: "truck", text: "شحن سريع لكافة المحافظات" },
            { id: "o4", icon: "award", text: "منتجات كشفية أصلية ومعتمدة" },
          ]}
        />

        {/* Categories Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-primary mb-4">تسوق حسب المجموعة</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">اختر من مجموعاتنا المتنوعة المصممة خصيصاً لتلبية كافة احتياجاتك الكشفية.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {collections.map((collection, i) => (
                <Link key={collection.slug} href={`/store/c/${collection.slug}`}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                  >
                    <div className="absolute inset-0 z-10 opacity-70 mix-blend-multiply group-hover:opacity-85 transition-opacity" style={{ backgroundColor: collection.accent }} />
                    <img src={collection.heroImage} alt={collection.titleAr} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 z-20 p-6 flex flex-col justify-center items-center text-center text-white">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        {getCollectionIcon(collection.icon)}
                      </div>
                      <h3 className="text-lg font-black">{collection.titleAr}</h3>
                      <p className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest mt-1">عرض الكل</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-secondary font-black mb-4">
                  <TrendingUp className="h-5 w-5" />
                  <span>الأكثر طلباً</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-primary">المختارات المميزة</h2>
              </div>
              <Link href="/store/c/all">
                <Button variant="outline" className="h-12 px-8 rounded-full font-bold group border-border/50">
                  عرض جميع المنتجات
                  {isRtl ? <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="relative rounded-[2.5rem] overflow-hidden bg-[#4D006E] min-h-[400px] flex items-center">
              <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 opacity-30 md:opacity-100">
                <img src="/src/assets/images/about-hero.webp" className="w-full h-full object-cover" alt="Promotion" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#4D006E]" />
              </div>
              <div className="relative z-10 p-8 md:p-20 max-w-2xl text-white">
                <Badge className="bg-secondary text-white mb-6 px-4 py-1 text-sm font-bold">عرض خاص</Badge>
                <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">صمّم زيك الكشفي <span className="text-secondary">الخاص</span></h2>
                <p className="text-xl text-white/80 mb-10 leading-relaxed font-medium">نقدم لك خدمة التخصيص الكاملة للأزياء الرسمية والملابس الكشفية. اطبع اسمك، شعار مجموعتك، أو تاريخ مناسبتك الخاصة.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white h-16 px-10 text-xl font-black rounded-2xl shadow-xl shadow-secondary/20">
                    ابدأ التخصيص الآن
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-16 px-10 text-xl font-black rounded-2xl">
                    تواصل مع المصمم
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-primary flex items-center gap-3">
                <Clock className="h-8 w-8 text-secondary" />
                وصل حديثاً
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newArrivals.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solidarity Store CTA */}
        <section className="py-20 border-t border-border/50">
          <div className="container mx-auto px-4 md:px-8">
            <div className="bg-emerald-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-100">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
                  <Award className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-emerald-800 mb-2">مبادرة التكافل الكشفي</h3>
                  <p className="text-emerald-700/80 font-medium max-w-md">ندعم أبطالنا من ذوي الاحتياجات الخاصة عبر توفير المستلزمات الطبية والتعويضية مجاناً.</p>
                </div>
              </div>
              <Link href="/solidarity">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white h-14 px-8 text-lg font-bold rounded-xl whitespace-nowrap">
                  زيارة متجر التكافل
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}