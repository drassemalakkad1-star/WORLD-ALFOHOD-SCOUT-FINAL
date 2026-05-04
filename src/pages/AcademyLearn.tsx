import { useEffect, useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ChevronRight, ChevronLeft, Play, FileText, HelpCircle, 
  CheckCircle2, Circle, Lock, Menu, X, ArrowRight, Award
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/auth/authContext";
import { useToast } from "@/hooks/use-toast";
import { academyApi } from "@/lib/academyApi";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useInstructorStore } from "@/lib/instructorStore";

export default function AcademyLearn() {
  const [, params] = useRoute<{ slug: string }>("/academy/learn/:slug");
  const slug = params ? (params as any).slug : "";
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const currentLessonSlug = searchParams.get("lesson");
  
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication check handled by AuthGuard later in the render
  
  const { getCourseById } = useInstructorStore();

  const { data: apiCourse, isLoading: isCourseLoadingApi } = useQuery({
    queryKey: ["academyCourse", slug],
    queryFn: () => academyApi.getCourse(slug),
    enabled: !!slug && !!authState.user,
    retry: false
  });

  const localCourse = getCourseById(slug);
  const course = apiCourse || (localCourse ? {
    ...localCourse,
    subtitle: localCourse.description.substring(0, 100),
    longDescription: localCourse.description,
    rating: 5.0,
    enrolledCount: 120,
    duration: "غير محدد",
    lessonsCount: localCourse.lessons.length,
    instructor: {
      name: "قائد كشفي",
      title: "مدرب معتمد",
      bio: "خبير في التدريب الكشفي والإرشادي.",
      avatarColor: "#004225"
    },
    skills: ["القيادة", "العمل الجماعي"],
    isFree: true,
    price: 0,
    certificate: true,
    coverColor: localCourse.thumbnail || "#004225"
  } : null);

  const isCourseLoading = isCourseLoadingApi && !localCourse;

  const { data: enrollments, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["academyEnrollments", authState.user?.email],
    queryFn: () => academyApi.listMyEnrollments(authState.user!.email),
    enabled: !!authState.user?.email,
  });

  const enrollment = enrollments?.find(e => e.courseSlug === slug) || (localCourse ? {
    enrollmentId: 0,
    courseSlug: slug,
    userEmail: authState.user?.email || "",
    progressPct: 0,
    lessonsCompleted: [],
    completedAt: null
  } : null);

  const isEnrolled = !!enrollment;

  useEffect(() => {
    if (!isEnrollmentsLoading && !isCourseLoading && !isEnrolled && authState.user) {
      setLocation(`/academy/c/${slug}`);
    }
  }, [isEnrolled, isEnrollmentsLoading, isCourseLoading, setLocation, slug, authState.user]);

  // Handle default lesson selection
  useEffect(() => {
    if (course && course.lessons.length > 0 && !currentLessonSlug && isEnrolled) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("lesson", course.lessons[0].slug);
      window.history.replaceState({}, "", newUrl);
    }
  }, [course, currentLessonSlug, isEnrolled]);

  const markCompleteMutation = useMutation({
    mutationFn: ({ lessonSlug, completed }: { lessonSlug: string, completed: boolean }) => 
      academyApi.markLessonComplete(enrollment?.enrollmentId || 0, lessonSlug, completed),
    onSuccess: (data) => {
      // Optimitic update logic is complex, just invalidate
      queryClient.invalidateQueries({ queryKey: ["academyEnrollments"] });
      if (data.progressPct === 100) {
        toast({
          title: "مبروك! 🎉",
          description: "لقد أتممت هذه الدورة بنجاح.",
        });
      }
    }
  });

  if (!authState.isLoading && !authState.user) {
    return (
      <AuthGuard title="أكاديمية الكشافة" description="يرجى تسجيل الدخول لمتابعة مسارك التعليمي.">
        <div />
      </AuthGuard>
    );
  }

  if (isCourseLoading || isEnrollmentsLoading || !course || !enrollment) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeLessonIndex = currentLessonSlug 
    ? course.lessons.findIndex(l => l.slug === currentLessonSlug) 
    : 0;
  
  const activeLesson = course.lessons[activeLessonIndex !== -1 ? activeLessonIndex : 0];
  
  const prevLesson = activeLessonIndex > 0 ? course.lessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex < course.lessons.length - 1 ? course.lessons[activeLessonIndex + 1] : null;

  const isCompleted = (ls: string) => enrollment.lessonsCompleted.includes(ls);
  const currentIsCompleted = activeLesson ? isCompleted(activeLesson.slug) : false;

  const handleToggleComplete = () => {
    if (!activeLesson) return;
    markCompleteMutation.mutate({ lessonSlug: activeLesson.slug, completed: !currentIsCompleted });
  };

  const navigateToLesson = (ls: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("lesson", ls);
    window.history.pushState({}, "", newUrl);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground" dir="rtl">
      
      {/* Top Navbar Mobile */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="font-bold text-sm truncate px-4">{course.title}</h1>
        <Link href={`/academy/c/${slug}`}>
          <Button variant="ghost" size="icon">
            <X className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      {/* Sidebar - Lessons List */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-80 bg-card border-l border-border flex flex-col transition-transform duration-300
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-primary text-primary-foreground">
          <Link href={`/academy/c/${slug}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity font-bold">
            <ArrowRight className="h-5 w-5" />
            عودة للدورة
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="font-black text-lg mb-2 leading-tight">{course.title}</h2>
          <div className="flex items-center justify-between text-sm mb-2 text-muted-foreground font-medium">
            <span>التقدم: {enrollment.progressPct}%</span>
            <span>{enrollment.lessonsCompleted.length} / {course.lessonsCount}</span>
          </div>
          <Progress value={enrollment.progressPct} className="h-2 bg-border" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-4">
          <div className="px-4 mb-2 font-bold text-sm text-muted-foreground">محتوى الدورة</div>
          <div className="flex flex-col">
            {course.lessons.map((lesson, idx) => {
              const isActive = lesson.slug === activeLesson?.slug;
              const completed = isCompleted(lesson.slug);
              
              return (
                <button
                  key={lesson.id}
                  onClick={() => navigateToLesson(lesson.slug)}
                  className={`
                    w-full text-right px-6 py-4 flex gap-4 items-start transition-colors
                    ${isActive ? 'bg-primary/10 border-r-4 border-primary' : 'hover:bg-muted border-r-4 border-transparent'}
                  `}
                >
                  <div className="mt-0.5 shrink-0">
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5 text-secondary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm leading-tight mb-1 ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {idx + 1}. {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      {lesson.type === "video" && <Play className="h-3 w-3" />}
                      {lesson.type === "reading" && <FileText className="h-3 w-3" />}
                      {lesson.type === "quiz" && <HelpCircle className="h-3 w-3" />}
                      <span>{lesson.duration}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background pt-16 lg:pt-0">
        <div className="flex-1 overflow-y-auto">
          {activeLesson && (
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 md:py-12">
              
              <div className="mb-8">
                <h1 className="text-2xl md:text-4xl font-black mb-4">{activeLesson.title}</h1>
                <p className="text-lg text-muted-foreground">{activeLesson.description}</p>
              </div>

              {/* Media/Content Renderer */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm mb-12">
                {activeLesson.type === "video" && (
                  <div className="aspect-video bg-black relative flex items-center justify-center group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-60" />
                    <Play className="h-20 w-20 text-white/80 group-hover:scale-110 group-hover:text-white transition-all z-10" />
                    <div className="absolute bottom-6 left-0 right-0 text-center z-10">
                      <p className="text-white font-bold text-lg">مقطع مرئي تجريبي</p>
                      <p className="text-white/70 text-sm mt-1">انقر للتشغيل</p>
                    </div>
                  </div>
                )}

                {activeLesson.type === "reading" && (
                  <div className="p-8 md:p-12 prose prose-lg dark:prose-invert max-w-none font-medium text-foreground leading-relaxed">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8">
                      <FileText className="h-8 w-8" />
                    </div>
                    <h3>مقدمة حول {activeLesson.title}</h3>
                    <p>هذا النص هو محتوى تجريبي يمثل المقالة أو المادة المقروءة الخاصة بهذا الدرس. في بيئة الإنتاج، سيحتوي هذا القسم على النص الكامل مع الصور والروابط الضرورية لفهم المادة التعليمية.</p>
                    <p>يعتبر القراءة جزءاً مهماً من التعلم الذاتي، حيث يتيح للمتعلم التأمل في المعلومات وربطها بالواقع العملي.</p>
                    <ul>
                      <li>النقطة الرئيسية الأولى.</li>
                      <li>النقطة الرئيسية الثانية.</li>
                      <li>تطبيقات عملية للمفاهيم.</li>
                    </ul>
                  </div>
                )}

                {activeLesson.type === "quiz" && (
                  <div className="p-8 md:p-12">
                    <div className="w-16 h-16 bg-accent/20 text-accent rounded-2xl flex items-center justify-center mb-8">
                      <HelpCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-6">اختبار معلوماتك</h3>
                    
                    <div className="space-y-8 mb-8">
                      {[1, 2, 3].map((q) => (
                        <div key={q} className="p-6 bg-muted/30 rounded-xl border border-border">
                          <p className="font-bold mb-4">السؤال {q}: ما هو الإجراء الصحيح في هذه الحالة الافتراضية؟</p>
                          <div className="space-y-2">
                            {['الخيار الأول', 'الخيار الثاني', 'الخيار الثالث'].map((opt, i) => (
                              <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer hover:border-primary/50 transition-colors">
                                <input type="radio" name={`q${q}`} className="w-4 h-4 text-primary" />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button size="lg" className="w-full sm:w-auto h-12 px-8 font-bold rounded-xl" onClick={() => {
                      toast({ title: "تم إرسال الإجابات", description: "حصلت على 3/3 في هذا الاختبار!" });
                      if (!currentIsCompleted) handleToggleComplete();
                    }}>
                      إرسال الإجابات والتصحيح
                    </Button>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
                <Button 
                  variant={currentIsCompleted ? "outline" : "default"} 
                  size="lg"
                  onClick={handleToggleComplete}
                  disabled={markCompleteMutation.isPending}
                  className={`w-full sm:w-auto h-14 px-8 rounded-xl font-bold gap-2 ${
                    currentIsCompleted 
                      ? "text-secondary border-secondary/50 hover:bg-secondary/10" 
                      : "bg-secondary text-white hover:bg-secondary/90"
                  }`}
                >
                  {markCompleteMutation.isPending && <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />}
                  {currentIsCompleted ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" /> مكتمل
                    </>
                  ) : (
                    <>
                      <Circle className="h-5 w-5" /> وضع علامة مكتمل
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    disabled={!prevLesson}
                    onClick={() => prevLesson && navigateToLesson(prevLesson.slug)}
                    className="flex-1 sm:flex-none h-14 px-6 rounded-xl font-bold gap-2"
                  >
                    <ChevronRight className="h-5 w-5" />
                    السابق
                  </Button>
                  
                  {nextLesson ? (
                    <Button 
                      className="flex-1 sm:flex-none h-14 px-6 rounded-xl font-bold gap-2 bg-primary hover:bg-primary/90 text-white"
                      onClick={() => navigateToLesson(nextLesson.slug)}
                    >
                      التالي
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 sm:flex-none h-14 px-6 rounded-xl font-bold gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => {
                        toast({ title: "نهاية الدورة", description: "تهانينا على إتمام جميع الدروس!" });
                        setLocation(`/academy/c/${slug}`);
                      }}
                    >
                      <Award className="h-5 w-5" />
                      إنهاء الدورة
                    </Button>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

    </div>
  );
}
