import { useState, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  BookOpen, Clock, Star, Users, CheckCircle2, ChevronLeft, 
  PlayCircle, FileText, HelpCircle, Lock, GraduationCap, LayoutList, Check, Medal 
} from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/authContext";
import { useToast } from "@/hooks/use-toast";
import { academyApi } from "@/lib/academyApi";
import NotFound from "@/pages/not-found";

export default function AcademyCourse() {
  const [, params] = useRoute<{ slug: string }>("/academy/c/:slug");
  const slug = params ? (params as any).slug : "";
  const [location, setLocation] = useLocation();
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["academyCourse", slug],
    queryFn: () => academyApi.getCourse(slug),
    enabled: !!slug,
  });

  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ["academyEnrollments", authState.user?.email],
    queryFn: () => academyApi.listMyEnrollments(authState.user!.email),
    enabled: !!authState.user?.email,
  });

  const enrollment = enrollments?.find(e => e.courseSlug === slug);
  const isEnrolled = !!enrollment;

  const enrollMutation = useMutation({
    mutationFn: () => academyApi.enrollInCourse(slug, authState.user!.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academyEnrollments"] });
      toast({
        title: "تم التسجيل بنجاح!",
        description: "مرحباً بك في الدورة. يمكنك البدء في التعلم الآن.",
      });
      setLocation(`/academy/learn/${slug}`);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  });

  const { data: similarCourses } = useQuery({
    queryKey: ["academyCoursesSimilar", course?.category],
    queryFn: () => academyApi.listCourses({ category: course?.category, pageSize: 4 }),
    enabled: !!course?.category,
  });

  const handleEnrollClick = () => {
    if (!authState.user) {
      setLocation(`/login?returnTo=/academy/c/${slug}`);
      return;
    }
    
    if (isEnrolled) {
      setLocation(`/academy/learn/${slug}`);
      return;
    }

    enrollMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SiteLayout>
    );
  }

  if (isError || !course) {
    return <NotFound />;
  }

  return (
    <SiteLayout>
      {/* Course Hero */}
      <section className="bg-primary text-white pt-24 pb-12 md:pt-32 md:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-primary via-primary to-primary/80 z-0" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <nav className="flex flex-wrap items-center gap-2 text-white/70 text-sm font-medium mb-8">
            <Link href="/academy" className="hover:text-white transition-colors">الأكاديمية</Link>
            <ChevronLeft className="h-4 w-4" />
            <span className="text-white">{course.category}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none rounded-lg px-3 py-1">
                  {course.category}
                </Badge>
                <Badge className="bg-secondary text-secondary-foreground border-none rounded-lg px-3 py-1">
                  {course.level}
                </Badge>
                {course.isNew && (
                  <Badge className="bg-accent text-accent-foreground border-none rounded-lg px-3 py-1">
                    جديد
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black leading-tight">
                {course.title}
              </h1>
              
              <p className="text-xl text-white/80 font-medium">
                {course.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent fill-accent" />
                  <span className="text-lg">{course.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-white/60" />
                  <span>{course.enrolledCount} طالب مسجل</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-white/60" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-white/60" />
                  <span>{course.lessonsCount} دروس</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div 
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  style={{ backgroundColor: course.instructor.avatarColor }}
                >
                  {getInitials(course.instructor.name)}
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-0.5">المدرب</p>
                  <p className="font-bold text-lg leading-none">{course.instructor.name}</p>
                </div>
              </div>

              <div className="pt-6 lg:hidden">
                <Button 
                  size="lg" 
                  onClick={handleEnrollClick}
                  disabled={enrollMutation.isPending}
                  className={`w-full h-14 text-lg font-bold rounded-xl ${isEnrolled ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-secondary hover:bg-secondary/90 text-white"}`}
                >
                  {enrollMutation.isPending ? "جاري التسجيل..." : isEnrolled ? "متابعة التعلم" : "ابدأ التعلم الآن"}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 hidden lg:block">
              <div 
                className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center border-4 border-white/10"
                style={{ 
                  background: course.coverColor?.startsWith('http') 
                    ? `url(${course.coverColor}) center/cover no-repeat` 
                    : `linear-gradient(135deg, ${course.coverColor || '#004225'}, ${(course.coverColor || '#004225')}aa)` 
                }}
              >
                {!course.coverColor?.startsWith('http') && <BookOpen className="h-32 w-32 text-white/20" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Content (RTL -> Right side main content) */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Tabs */}
              <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-border pb-1">
                {[
                  { id: "overview", label: "نظرة عامة" },
                  { id: "curriculum", label: "المحتوى" },
                  { id: "instructor", label: "المدرب" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 font-bold text-lg border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                
                {activeTab === "overview" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">عن هذه الدورة</h2>
                      <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {course.longDescription}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-6">ما الذي ستتعلمه؟</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {course.skills.map((skill, i) => (
                          <div key={i} className="flex items-start gap-3 bg-muted/50 p-4 rounded-xl">
                            <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                            <span className="font-semibold">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {course.requirements && course.requirements.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">المتطلبات</h2>
                        <ul className="space-y-3">
                          {course.requirements.map((req, i) => (
                            <li key={i} className="flex items-center gap-3 text-muted-foreground">
                              <div className="h-2 w-2 rounded-full bg-primary/50 shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "curriculum" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">منهج الدورة</h2>
                      <span className="text-muted-foreground font-medium">{course.lessonsCount} دروس • {course.duration}</span>
                    </div>

                    <div className="border border-border rounded-2xl overflow-hidden bg-card">
                      {course.lessons.map((lesson, i) => (
                        <div key={lesson.id} className={`p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${i !== course.lessons.length - 1 ? "border-b border-border" : ""}`}>
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted shrink-0 text-muted-foreground">
                            {lesson.type === "video" ? <PlayCircle className="h-5 w-5" /> : 
                             lesson.type === "reading" ? <FileText className="h-5 w-5" /> : 
                             <HelpCircle className="h-5 w-5" />}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">{lesson.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{lesson.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm font-medium shrink-0">
                            <span className="text-muted-foreground">{lesson.duration}</span>
                            {isEnrolled ? (
                              <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                                <Link href={`/academy/learn/${course.slug}?lesson=${lesson.slug}`}>بدء</Link>
                              </Button>
                            ) : (
                              <div className="flex items-center gap-1.5 text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                                <Lock className="h-4 w-4" />
                                <span>مغلق</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "instructor" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-2xl font-bold mb-6">عن المدرب</h2>
                    <div className="bg-card border border-border p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-right">
                      <div 
                        className="h-32 w-32 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shrink-0 shadow-lg"
                        style={{ backgroundColor: course.instructor.avatarColor }}
                      >
                        {getInitials(course.instructor.name)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{course.instructor.name}</h3>
                        <p className="text-secondary font-semibold mb-4">{course.instructor.title}</p>
                        <p className="text-muted-foreground leading-relaxed text-lg">{course.instructor.bio}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>

            {/* Right Sidebar (RTL -> Left side sticky panel) */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl">
                
                <div className="mb-6 pb-6 border-b border-border">
                  {course.isFree ? (
                    <div className="text-3xl font-black text-green-600 dark:text-green-400">مجاني</div>
                  ) : (
                    <div className="text-4xl font-black text-primary">${course.price.toFixed(2)}</div>
                  )}
                </div>

                <Button 
                  size="lg" 
                  onClick={handleEnrollClick}
                  disabled={enrollMutation.isPending}
                  className={`w-full h-14 text-lg font-bold rounded-xl mb-6 shadow-md transition-all ${
                    isEnrolled 
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
                      : "bg-secondary hover:bg-secondary/90 text-white"
                  }`}
                >
                  {enrollMutation.isPending ? "جاري التسجيل..." : isEnrolled ? "متابعة التعلم" : "ابدأ التعلم الآن"}
                </Button>

                <div className="space-y-4">
                  <h4 className="font-bold text-foreground">تتضمن هذه الدورة:</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground font-medium">
                    <li className="flex items-center gap-3">
                      <LayoutList className="h-5 w-5 text-primary" />
                      <span>{course.lessonsCount} درس تعليمي</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>{course.duration} من المحتوى</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span>اختبارات وتطبيقات عملية</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <span>الوصول مدى الحياة</span>
                    </li>
                    {course.certificate && (
                      <li className="flex items-center gap-3">
                        <Medal className="h-5 w-5 text-primary" />
                        <span>شهادة إتمام معتمدة</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Similar Courses */}
      {similarCourses && similarCourses.items.length > 1 && (
        <section className="py-16 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-bold mb-8 text-primary">دورات مشابهة قد تعجبك</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarCourses.items.filter(c => c.id !== course.id).slice(0, 4).map((c, i) => (
                <div key={c.id} className="h-full">
                  <Link href={`/academy/c/${c.slug}`}>
                    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors h-full flex flex-col group cursor-pointer">
                      <div 
                        className="h-32 relative flex items-center justify-center"
                        style={{ 
                          background: c.coverColor?.startsWith('http') 
                            ? `url(${c.coverColor}) center/cover no-repeat` 
                            : `linear-gradient(135deg, ${c.coverColor || '#004225'}, ${(c.coverColor || '#004225')}dd)` 
                        }}
                      >
                        {!c.coverColor?.startsWith('http') && <BookOpen className="h-8 w-8 text-white/20 group-hover:scale-110 transition-transform" />}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{c.title}</h3>
                        <div className="flex items-center justify-between mt-auto pt-2 text-sm">
                          <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {c.duration}</span>
                          <span className="font-bold text-secondary">{c.isFree ? 'مجاني' : `$${c.price.toFixed(2)}`}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </SiteLayout>
  );
}
