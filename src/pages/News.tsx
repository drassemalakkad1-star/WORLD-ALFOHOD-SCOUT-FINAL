import { useState, useMemo, useEffect } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { ArticleCard } from "@/components/news/ArticleCard";
import { ListArticleRow } from "@/components/news/ListArticleRow";
import { news } from "@/data/news";
import { videos } from "@/data/videos";
import { VideoCard } from "@/components/videos/VideoCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getNews, urlFor } from "@/lib/sanityClient";
import { 
  Search,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Mail,
  Eye,
  Loader2
} from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CATEGORIES = [
  "الكل",
  "أخبار عاجلة",
  "بيانات صحفية",
  "قصص ملهمة",
  "السلام والحوار",
  "البيئة والاستدامة",
  "التعليم والتدريب",
  "المخيمات والفعاليات",
  "الشراكات الدولية",
  "الإنجازات"
];

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "oldest", label: "الأقدم" },
  { value: "most_viewed", label: "الأكثر قراءة" },
  { value: "most_liked", label: "الأكثر إعجاباً" }
];



export default function News() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [email, setEmail] = useState("");
  
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  const { data: sanityNews, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });

  // Use sanity data if available, otherwise fallback to static data (for now)
  const allNews = useMemo(() => {
    if (sanityNews && sanityNews.length > 0) {
      return sanityNews.map((n: any) => ({
        ...n,
        id: n._id,
        slug: n.slug?.current || n._id,
        image: n.mainImage ? urlFor(n.mainImage).url() : n.gallery?.[0] ? urlFor(n.gallery[0]).url() : "/placeholder-news.jpg",
        date: n.eventDate || n._createdAt,
        isoDate: n.eventDate || n._createdAt,
        category: n.category || "أخبار",
        excerpt: n.excerpt || (n.content ? n.content.substring(0, 150) + "..." : ""),
        author: n.author || { name: "فريق التحرير", avatarColor: "#9333ea" },
        views: n.views || 0,
        likes: n.likes || 0,
        tags: n.tags || [],
        readTime: n.readTime || "٥ دقائق"
      }));
    }
    return news;
  }, [sanityNews]);

  const breakingNews = useMemo(() => allNews.find((n: any) => n.breaking), [allNews]);
  const featuredNews = useMemo(() => allNews.filter((n: any) => n.featured || n.isFeatured).slice(0, 4), [allNews]);
  // If no featured news in sanity, take the first 4
  const displayFeatured = featuredNews.length > 0 ? featuredNews : allNews.slice(0, 4);
  
  const pressReleases = useMemo(() => allNews.filter((n: any) => n.category === "بيانات صحفية").slice(0, 3), [allNews]);
  const popularNews = useMemo(() => [...allNews].sort((a: any, b: any) => b.views - a.views).slice(0, 5), [allNews]);
  
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allNews.forEach((n: any) => n.tags?.forEach((t: string) => tags.add(t)));
    return Array.from(tags).slice(0, 15);
  }, [allNews]);

  const filteredNews = useMemo(() => {
    let result = allNews;

    if (activeCategory !== "الكل") {
      result = result.filter((n: any) => n.category === activeCategory);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((n: any) => 
        n.title?.toLowerCase().includes(q) || 
        n.excerpt?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
        case "oldest":
          return new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime();
        case "most_viewed":
          return b.views - a.views;
        case "most_liked":
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    return result;
  }, [allNews, activeCategory, search, sortBy]);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (displayFeatured.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % displayFeatured.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displayFeatured.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search, sortBy]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast({
      title: "تم الاشتراك بنجاح",
      description: "شكراً لاشتراكك في النشرة الإخبارية لعالم الفهود.",
    });
    setEmail("");
  };

  const handleDownloadPressRelease = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "جاري التجهيز",
      description: "سيتوفر التنزيل قريباً.",
    });
  };

  return (
    <SiteLayout>
      <PageHero
        title="غرفة الأخبار"
        description="آخر الأخبار والقصص والبيانات الصحفية من حركة الفهود العالمية"
        breadcrumbs={[{ label: "الأخبار", href: "/news" }]}
      />
      
      {/* Breaking News Ticker */}
      {breakingNews && (
        <div className="bg-primary text-primary-foreground border-b border-white/10 overflow-hidden relative flex items-center h-12 z-20">
          <div className="bg-destructive text-destructive-foreground font-bold px-4 py-3 flex items-center gap-2 z-10 shrink-0 h-full">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
            عاجل
          </div>
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <motion.div
              className="whitespace-nowrap absolute right-0"
              animate={{ x: [0, -2000] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            >
              <Link href={`/news/${breakingNews.slug}`} className="hover:underline font-medium text-white/90">
                {breakingNews.title} — {breakingNews.excerpt}
              </Link>
            </motion.div>
          </div>
        </div>
      )}

      {/* Featured Carousel */}
      {displayFeatured.length > 0 && (
        <section className="bg-muted/10 pb-12 pt-8">
          <div className="container mx-auto px-4 md:px-8">
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeaturedIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0"
                >
                  <img loading="lazy" decoding="async" 
                    src={displayFeatured[currentFeaturedIndex].image} 
                    alt={displayFeatured[currentFeaturedIndex].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20">
                    <Badge className="bg-secondary text-white hover:bg-secondary mb-4">
                      {displayFeatured[currentFeaturedIndex].category}
                    </Badge>
                    <Link href={`/news/${displayFeatured[currentFeaturedIndex].slug}`}>
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight cursor-pointer hover:text-secondary transition-colors max-w-4xl">
                        {displayFeatured[currentFeaturedIndex].title}
                      </h2>
                    </Link>
                    <p className="text-white/80 text-lg max-w-2xl mb-6 line-clamp-2 hidden md:block">
                      {displayFeatured[currentFeaturedIndex].excerpt}
                    </p>
                    <div className="flex items-center gap-6">
                      <span className="text-white/70 text-sm font-medium">
                        {displayFeatured[currentFeaturedIndex].date}
                      </span>
                      <Link href={`/news/${displayFeatured[currentFeaturedIndex].slug}`}>
                        <Button className="bg-white text-primary hover:bg-white/90 font-bold rounded-full px-6">
                          اقرأ المزيد
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {/* Carousel Controls */}
              <div className="absolute bottom-6 left-6 md:left-12 flex items-center gap-3 z-30">
                <div className="flex gap-2">
                  {displayFeatured.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentFeaturedIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentFeaturedIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Newsroom Area */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          
          {/* Filters Row */}
          <div className="mb-12 sticky top-16 z-30 bg-background/95 backdrop-blur py-4 -mx-4 px-4 md:mx-0 md:px-0 border-b border-border/50">
            {/* Categories */}
            <div className="flex overflow-x-auto pb-4 mb-4 hide-scrollbar gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2 rounded-xl whitespace-nowrap font-bold text-sm transition-all shrink-0 border ${
                    activeCategory === category 
                      ? "bg-secondary text-white border-secondary" 
                      : "bg-muted/50 text-foreground hover:bg-muted border-transparent"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Search, Sort, View Toggle */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  type="text" 
                  placeholder="ابحث في الأخبار..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-4 pr-10 h-10 rounded-lg border-border focus-visible:ring-secondary bg-muted/20"
                />
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">ترتيب حسب:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px] h-10 rounded-lg">
                      <SelectValue placeholder="الترتيب" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex bg-muted/50 rounded-lg p-1 border border-border/50">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar (RTL: Left on Desktop) */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-10 order-2 lg:order-1">
              
              {/* Popular News */}
              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-3">
                  <span className="w-3 h-3 rounded-sm bg-secondary"></span>
                  الأكثر قراءة
                </h3>
                <div className="space-y-6">
                  {popularNews.map((article, idx) => (
                    <div key={article.id} className="flex gap-4 group">
                      <div className="text-4xl font-black text-muted/50 group-hover:text-secondary/30 transition-colors pt-1">
                        0{idx + 1}
                      </div>
                      <div className="flex-1">
                        <Link href={`/news/${article.slug}`}>
                          <h4 className="font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                            {article.title}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{article.date}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views.toLocaleString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-primary to-[#6D1B8E] rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16" />
                <Mail className="w-10 h-10 mx-auto mb-4 text-secondary opacity-90" />
                <h3 className="text-xl font-bold mb-2">اشترك في النشرة الإخبارية</h3>
                <p className="text-white/70 text-sm mb-6 leading-relaxed">
                  احصل على أحدث الأخبار والقصص مباشرة في بريدك الإلكتروني.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <Input 
                    type="email" 
                    placeholder="البريد الإلكتروني" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11"
                  />
                  <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-11">
                    اشتراك
                  </Button>
                </form>
              </div>

              {/* Tags Cloud */}
              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-3">
                  <span className="w-3 h-3 rounded-sm bg-accent"></span>
                  الوسوم الشائعة
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button 
                      key={tag}
                      onClick={() => {
                        setSearch(tag);
                        setActiveCategory("الكل");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-muted/50 text-sm font-medium text-foreground hover:bg-secondary hover:text-white transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Follow */}
              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-3">
                  <span className="w-3 h-3 rounded-sm bg-primary"></span>
                  تابعنا
                </h3>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="rounded-xl bg-muted/30 border-transparent hover:bg-primary hover:text-white"><FaFacebook className="w-5 h-5" /></Button>
                  <Button variant="outline" size="icon" className="rounded-xl bg-muted/30 border-transparent hover:bg-primary hover:text-white"><FaTwitter className="w-5 h-5" /></Button>
                  <Button variant="outline" size="icon" className="rounded-xl bg-muted/30 border-transparent hover:bg-primary hover:text-white"><FaInstagram className="w-5 h-5" /></Button>
                  <Button variant="outline" size="icon" className="rounded-xl bg-muted/30 border-transparent hover:bg-primary hover:text-white"><FaLinkedin className="w-5 h-5" /></Button>
                </div>
              </div>

              {/* Archive Accordion */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-border pb-3">
                  <span className="w-3 h-3 rounded-sm bg-muted-foreground/50"></span>
                  أرشيف
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="2026">
                    <AccordionTrigger className="font-bold">٢٠٢٦</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pr-4 text-muted-foreground">
                        <li className="hover:text-primary cursor-pointer transition-colors">مارس (٣)</li>
                        <li className="hover:text-primary cursor-pointer transition-colors">فبراير (٢)</li>
                        <li className="hover:text-primary cursor-pointer transition-colors">يناير (١)</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="2025">
                    <AccordionTrigger className="font-bold">٢٠٢٥</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pr-4 text-muted-foreground">
                        <li className="hover:text-primary cursor-pointer transition-colors">ديسمبر (٤)</li>
                        <li className="hover:text-primary cursor-pointer transition-colors">نوفمبر (٢)</li>
                        <li className="hover:text-primary cursor-pointer transition-colors">أكتوبر (٥)</li>
                        <li className="hover:text-primary cursor-pointer transition-colors">سبتمبر (٣)</li>
                        <li className="hover:text-primary cursor-pointer transition-colors">أغسطس (٦)</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

            </div>

            {/* Main Content Column */}
            <div className="flex-1 order-1 lg:order-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-primary">أحدث القصص</h2>
                <div className="text-sm font-medium text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                  {filteredNews.length} نتيجة
                </div>
              </div>

              {paginatedNews.length > 0 ? (
                <>
                  <div className={viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                    : "flex flex-col gap-6"
                  }>
                    {paginatedNews.map(article => (
                      viewMode === "grid" 
                        ? <ArticleCard key={article.id} article={article} />
                        : <ListArticleRow key={article.id} article={article} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-full"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <Button
                          key={i}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          className={`w-10 h-10 rounded-full font-bold ${currentPage === i + 1 ? 'bg-secondary text-white hover:bg-secondary/90' : ''}`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}

                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-full"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border border-border border-dashed">
                  <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">لا توجد نتائج مطابقة</h3>
                  <p className="text-muted-foreground">حاول تغيير كلمات البحث أو اختيار قسم آخر.</p>
                  <Button 
                    variant="outline" 
                    className="mt-6"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("الكل");
                    }}
                  >
                    مسح عوامل التصفية
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases Strip */}
      {pressReleases.length > 0 && (
        <section className="py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-primary flex items-center gap-3">
                <FileText className="w-8 h-8 text-secondary" />
                البيانات الصحفية
              </h2>
              <Link href="/news?category=بيانات صحفية">
                <Button variant="ghost" className="font-bold text-secondary">عرض الكل</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pressReleases.map(pr => (
                <div key={pr.id} className="bg-background rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="text-sm font-bold text-muted-foreground mb-3">{pr.date}</div>
                  <h3 className="text-lg font-bold text-foreground mb-4 line-clamp-2 leading-tight flex-1">
                    {pr.title}
                  </h3>
                  <div className="flex justify-between items-center pt-4 border-t border-border/50">
                    <Link href={`/news/${pr.slug}`}>
                      <span className="text-sm font-bold text-primary hover:text-secondary transition-colors cursor-pointer">
                        اقرأ التفاصيل
                      </span>
                    </Link>
                    <Button variant="outline" size="sm" className="gap-2 rounded-lg" onClick={handleDownloadPressRelease}>
                      <Download className="w-4 h-4" />
                      تنزيل PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Videos Strip */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black text-primary flex items-center gap-3">
              <span className="w-2 h-8 bg-accent rounded-full"></span>
              مقاطع فيديو مميزة
            </h2>
            <Link href="/videos">
              <Button variant="ghost" className="font-bold text-secondary">مكتبة الفيديو</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.slice(0, 3).map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit Footer Card */}
      <section className="bg-primary pt-16 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">للصحفيين والإعلاميين</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            احصل على بياناتنا الصحفية، الصور عالية الدقة، الهوية البصرية، والملف التعريفي الكامل لحركة الفهود العالمية.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold h-14 px-8 text-lg rounded-xl gap-2" onClick={handleDownloadPressRelease}>
              <Download className="w-5 h-5" />
              تنزيل الحزمة الإعلامية
            </Button>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="bg-transparent border-white/30 text-white hover:bg-white/10 font-bold h-14 px-8 text-lg rounded-xl gap-2">
                <Mail className="w-5 h-5" />
                تواصل مع المكتب الصحفي
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </SiteLayout>
  );
}
