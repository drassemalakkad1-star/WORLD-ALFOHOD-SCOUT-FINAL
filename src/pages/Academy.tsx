import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, Award, Users, Sparkles, BookOpen, GraduationCap, Star, ChevronLeft, ChevronRight } from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseCard } from "@/components/academy/CourseCard";
import { academyApi } from "@/lib/academyApi";
import { useInstructorStore } from "@/lib/instructorStore";
import { useAuth } from "@/hooks/use-auth";

export default function Academy() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: categoriesData } = useQuery({
    queryKey: ["academyCategories"],
    queryFn: academyApi.getCategories,
  });

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["academyCourses", debouncedSearch, selectedCategory, selectedLevel, selectedSort, page],
    queryFn: () => academyApi.listCourses({
      q: debouncedSearch || undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      level: selectedLevel !== "all" ? selectedLevel : undefined,
      sort: selectedSort,
      page,
      pageSize: 9
    }),
  });

  const { courses: instructorCourses } = useInstructorStore();
  const { user } = useAuth();

  // Merge API courses with local instructor courses
  const allCourses = (() => {
    if (!coursesData?.items) return [];
    
    // Map instructor courses to match Course interface
    const mappedInstructor = instructorCourses.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.id,
      excerpt: c.description,
      thumbnail: c.thumbnail || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400",
      category: c.category,
      level: c.level,
      instructor: {
        name: user?.username || "قائد كشفي",
        role: "مدرب معتمد",
        avatar: user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=instructor"
      },
      stats: {
        students: 0,
        rating: 5,
        lessons: c.lessons.length,
        duration: "0"
      },
      isPremium: false,
      price: 0,
      createdAt: c.createdAt
    }));

    const combined = [...mappedInstructor, ...coursesData.items];
    
    // Simple filter for the combined list
    return combined.filter(c => {
      const matchSearch = !debouncedSearch || c.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchCat = selectedCategory === "all" || c.category === selectedCategory;
      const matchLevel = selectedLevel === "all" || c.level === selectedLevel;
      return matchSearch && matchCat && matchLevel;
    });
  })();

  const { data: featuredData } = useQuery({
    queryKey: ["academyFeaturedCourses"],
    queryFn: () => academyApi.listCourses({ sort: "popular", pageSize: 3 }),
  });

  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-primary text-white flex flex-col justify-center min-h-[50vh]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary/80 z-0" />
        <div className="absolute inset-0 opacity-10 z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexagons" width="40" height="69.282" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                <path d="M 40 17.321 L 20 5.774 L 0 17.321 L 0 40.415 L 20 51.962 L 40 40.415 Z" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>
        
        <div className="container relative z-20 mx-auto px-4 md:px-8 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-bold mb-6">
              <GraduationCap className="h-4 w-4" />
              <span>منصة التعلم الإلكتروني</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight" data-testid="text-academy-title">
              {t("academy.title", "أكاديمية عالم الفهود")}
            </h1>
            <p className="text-2xl md:text-3xl text-accent font-black mb-6">
              تعلّم. تطور. قُد.
            </p>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium mb-10 max-w-2xl mx-auto">
              منصة تعليمية متكاملة تقدم دورات تدريبية وتأهيلية في مختلف مجالات الحركة الكشفية والإرشادية لتنمية مهاراتك وبناء قدراتك القيادية.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0px rgba(212,160,23,0.55)",
                    "0 0 0 10px rgba(212,160,23,0.18)",
                    "0 0 0 18px rgba(212,160,23,0.04)",
                    "0 0 0 0px rgba(212,160,23,0)",
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                className="rounded-xl w-full sm:w-auto"
              >
                <Button asChild size="lg" className="h-14 px-8 text-lg font-bold rounded-xl w-full bg-secondary hover:bg-secondary/90 text-white shadow-lg">
                  <a href="#courses">تصفح الدورات</a>
                </Button>
              </motion.div>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-xl w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30">
                <Link href="/about">تعلم كيف نعمل</Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-black text-white">12+</div>
                <div className="text-sm text-white/70 font-semibold mt-1">دورة تدريبية</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-3xl font-black text-white">15K+</div>
                <div className="text-sm text-white/70 font-semibold mt-1">طالب مسجل</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-white">10+</div>
                <div className="text-sm text-white/70 font-semibold mt-1">شهادة معتمدة</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-primary mb-4">لماذا الأكاديمية؟</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">صممنا تجربة تعليمية فريدة تلبي احتياجات الكشافين والقادة في رحلتهم لتطوير الذات.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border border-border p-8 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">شهادات معتمدة</h3>
              <p className="text-muted-foreground">احصل على شهادات إتمام معتمدة تضاف لسجلك الكشفي والمهني بعد اجتياز الدورات.</p>
            </div>
            <div className="bg-card border border-border p-8 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">مدربون خبراء</h3>
              <p className="text-muted-foreground">تعلم مباشرة من قادة وخبراء كشفيين يمتلكون سنوات من الخبرة الميدانية والعملية.</p>
            </div>
            <div className="bg-card border border-border p-8 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto bg-accent/20 text-accent rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">محتوى تفاعلي</h3>
              <p className="text-muted-foreground">دروس مرئية، مقروءة، واختبارات تفاعلية تضمن استيعابك للمفاهيم وتطبيقها.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Courses Section */}
      <section id="courses" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          
          {/* Featured Courses Carousel (using simple grid for now) */}
          {featuredData?.items && featuredData.items.length > 0 && (
            <div className="mb-20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-primary flex items-center gap-3">
                  <Star className="h-8 w-8 text-accent fill-accent" />
                  الدورات الأكثر شعبية
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredData.items.map((course, i) => (
                  <CourseCard key={course.id} course={course} index={i} />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-3xl font-black text-primary">استكشف الدورات</h2>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-2xl p-4 md:p-6 mb-10 flex flex-col gap-6">
            <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar mask-edges">
              <button 
                onClick={() => { setSelectedCategory("all"); setPage(1); }}
                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${selectedCategory === "all" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
              >
                الكل
              </button>
              {categoriesData?.map((cat) => (
                <button 
                  key={cat.name}
                  onClick={() => { setSelectedCategory(cat.name); setPage(1); }}
                  className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${selectedCategory === cat.name ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
                >
                  {cat.name}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${selectedCategory === cat.name ? "bg-white/20" : "bg-border"}`}>{cat.count}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  placeholder="ابحث عن دورة، مهارة، أو موضوع..." 
                  className="pr-10 h-12 rounded-xl bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <Select value={selectedLevel} onValueChange={(v) => { setSelectedLevel(v); setPage(1); }} dir="rtl">
                  <SelectTrigger className="h-12 rounded-xl bg-background">
                    <SelectValue placeholder="المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل المستويات</SelectItem>
                    <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                    <SelectItem value="متوسط">متوسط</SelectItem>
                    <SelectItem value="متقدم">متقدم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <Select value={selectedSort} onValueChange={(v) => { setSelectedSort(v); setPage(1); }} dir="rtl">
                  <SelectTrigger className="h-12 rounded-xl bg-background">
                    <SelectValue placeholder="الترتيب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">الأحدث</SelectItem>
                    <SelectItem value="popular">الأكثر شعبية</SelectItem>
                    <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                    <SelectItem value="price-asc">السعر: من الأقل</SelectItem>
                    <SelectItem value="price-desc">السعر: من الأعلى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : coursesData?.items && coursesData.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-12">
                {allCourses.map((course, i) => (
                  <CourseCard key={course.id} course={course} index={i} />
                ))}
              </div>
              
              {coursesData.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="outline" 
                    disabled={page === 1} 
                    onClick={() => setPage(p => p - 1)}
                    className="rounded-xl"
                  >
                    السابق
                  </Button>
                  <div className="flex items-center gap-2 px-4 font-bold">
                    <span>{page}</span>
                    <span className="text-muted-foreground">من</span>
                    <span>{coursesData.totalPages}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    disabled={page === coursesData.totalPages} 
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-xl"
                  >
                    التالي
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">لا توجد دورات مطابقة</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">لم نعثر على أي دورات تطابق معايير البحث الخاصة بك. جرب تغيير المرشحات أو كلمات البحث.</p>
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedLevel("all");
                }}
                className="rounded-xl h-12 px-6"
              >
                مسح المرشحات
              </Button>
            </div>
          )}

        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-primary rounded-[2rem] p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black mb-4">كن مدرباً معنا</h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                شارك خبراتك ومعارفك الكشفية مع آلاف الأعضاء. نحن نبحث دائماً عن قادة ملهمين لإثراء محتوى الأكاديمية.
              </p>
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-white h-14 px-8 text-lg font-bold rounded-xl">
                <Link href="/contact">تواصل معنا للتدريب</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
