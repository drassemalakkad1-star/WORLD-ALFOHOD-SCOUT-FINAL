import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  BookOpen, Plus, Users, BarChart3, CheckCircle, Clock,
  Pencil, Trash2, Eye, Send, Video, FileText, HelpCircle,
  ChevronDown, ChevronRight, Loader2, GraduationCap, X,
  LayoutDashboard, Star, TrendingUp, BookMarked
} from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { useAuth } from "@/components/auth/authContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { instructorStore, InstructorCourse, NewLessonInput } from "@/lib/instructorStore";
import { CourseCategory, CourseLevel } from "@/data/academyTypes";

const CATEGORIES: CourseCategory[] = [
  "القيادة", "السلامة والإسعافات", "البيئة", "المهارات الكشفية",
  "التكنولوجيا والابتكار", "العمل التطوعي", "اللياقة والمغامرة", "الأخلاق والقيم"
];
const LEVELS: CourseLevel[] = ["مبتدئ", "متوسط", "متقدم"];
const COVER_COLORS = [
  "#1B6B35", "#2D8A4E", "#4CAF50", "#8BC34A",
  "#D4A017", "#E67E22", "#E74C3C", "#3498DB", "#9B59B6"
];

const courseSchema = z.object({
  title: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
  subtitle: z.string().min(10, "الوصف المختصر يجب أن يكون 10 أحرف على الأقل"),
  description: z.string().min(20, "الوصف يجب أن يكون 20 حرفاً على الأقل"),
  longDescription: z.string().min(50, "الوصف التفصيلي يجب أن يكون 50 حرفاً على الأقل"),
  category: z.string().min(1, "اختر التصنيف"),
  level: z.string().min(1, "اختر المستوى"),
  price: z.coerce.number().min(0),
  isFree: z.boolean(),
  certificate: z.boolean(),
  coverColor: z.string().min(1),
  skillsRaw: z.string().optional(),
  requirementsRaw: z.string().optional(),
});

const lessonSchema = z.object({
  title: z.string().min(3, "عنوان الدرس مطلوب"),
  duration: z.string().min(1, "مدة الدرس مطلوبة"),
  type: z.enum(["video", "reading", "quiz"]),
  description: z.string().min(10, "وصف الدرس مطلوب"),
});

type CourseFormData = z.infer<typeof courseSchema>;
type LessonFormData = z.infer<typeof lessonSchema>;

type Tab = "overview" | "courses" | "new-course" | "lessons";

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string;
}) {
  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10 hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4`} style={{ backgroundColor: color + "20" }}>
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div className="text-3xl font-black text-primary mb-1">{value}</div>
      <div className="text-sm font-semibold text-muted-foreground">{label}</div>
    </motion.div>
  );
}

function LessonTypeBadge({ type }: { type: "video" | "reading" | "quiz" }) {
  const map = {
    video: { label: "فيديو", icon: Video, color: "bg-blue-100 text-blue-700" },
    reading: { label: "قراءة", icon: FileText, color: "bg-green-100 text-green-700" },
    quiz: { label: "اختبار", icon: HelpCircle, color: "bg-amber-100 text-amber-700" },
  };
  const { label, icon: Icon, color } = map[type];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

function AddLessonDialog({ course, onSave }: { course: InstructorCourse; onSave: (c: InstructorCourse) => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema) as any,
    defaultValues: { title: "", duration: "", type: "video", description: "" },
  });

  const onSubmit = (data: LessonFormData) => {
    const updated = instructorStore.addLesson(course.id, data as NewLessonInput);
    if (updated) {
      onSave(updated);
      toast({ title: "تمت إضافة الدرس", description: `تمت إضافة "${data.title}" بنجاح.` });
      form.reset();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-primary text-white hover:bg-primary/90 rounded-xl">
          <Plus className="h-4 w-4" /> إضافة درس
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-primary">إضافة درس جديد</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>عنوان الدرس</FormLabel>
                <FormControl><Input placeholder="عنوان الدرس..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الدرس</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="video">فيديو</SelectItem>
                      <SelectItem value="reading">قراءة</SelectItem>
                      <SelectItem value="quiz">اختبار</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="duration" render={({ field }) => (
                <FormItem>
                  <FormLabel>المدة</FormLabel>
                  <FormControl><Input placeholder="مثال: ١٥ دقيقة" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>وصف الدرس</FormLabel>
                <FormControl><Textarea placeholder="ماذا سيتعلم الطالب..." rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="gap-2 flex-row-reverse">
              <Button type="submit" className="bg-primary text-white hover:bg-primary/90">إضافة الدرس</Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CourseCard({ course, onPublish, onDelete, onSelect }: {
  course: InstructorCourse;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (course: InstructorCourse) => void;
}) {
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-2xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="h-3 w-full" style={{ backgroundColor: course.coverColor }} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant={course.status === "published" ? "default" : "secondary"} className={
                course.status === "published"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-amber-100 text-amber-700 border-amber-200"
              }>
                {course.status === "published" ? "منشورة" : "مسودة"}
              </Badge>
              <Badge variant="outline" className="text-xs">{course.category}</Badge>
              <Badge variant="outline" className="text-xs">{course.level}</Badge>
            </div>
            <h3 className="font-black text-primary text-lg leading-tight line-clamp-2">{course.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center bg-primary/5 rounded-xl p-3">
            <div className="font-black text-primary text-xl">{course.enrolledCount}</div>
            <div className="text-xs text-muted-foreground font-medium">متدرب</div>
          </div>
          <div className="text-center bg-primary/5 rounded-xl p-3">
            <div className="font-black text-primary text-xl">{course.lessonsCount}</div>
            <div className="text-xs text-muted-foreground font-medium">درس</div>
          </div>
          <div className="text-center bg-primary/5 rounded-xl p-3">
            <div className="font-black text-primary text-xl">{course.isFree ? "مجاني" : course.price + "ر.س"}</div>
            <div className="text-xs text-muted-foreground font-medium">السعر</div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-xl text-primary border-primary/30 hover:bg-primary/5"
            onClick={() => onSelect(course)}
          >
            <BookMarked className="h-4 w-4" /> الدروس
          </Button>
          {course.status === "draft" && (
            <Button
              size="sm"
              className="gap-1.5 rounded-xl bg-primary text-white hover:bg-primary/90"
              onClick={() => onPublish(course.id)}
            >
              <Send className="h-4 w-4" /> نشر الدورة
            </Button>
          )}
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-destructive font-bold">حذف؟</span>
              <Button size="sm" variant="destructive" className="h-7 px-3 text-xs rounded-lg"
                onClick={() => { onDelete(course.id); setConfirming(false); }}>
                نعم
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-3 text-xs rounded-lg"
                onClick={() => setConfirming(false)}>
                لا
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost"
              className="gap-1.5 rounded-xl text-destructive hover:bg-destructive/10"
              onClick={() => setConfirming(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function NewCourseForm({ instructorId, instructorName, onCreated }: {
  instructorId: string; instructorName: string; onCreated: (c: InstructorCourse) => void;
}) {
  const { toast } = useToast();
  const [isFree, setIsFree] = useState(true);
  const [selectedColor, setSelectedColor] = useState(COVER_COLORS[0]);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      title: "", subtitle: "", description: "", longDescription: "",
      category: "", level: "", price: 0, isFree: true, certificate: true,
      coverColor: COVER_COLORS[0], skillsRaw: "", requirementsRaw: "",
    },
  });

  const onSubmit = (data: CourseFormData) => {
    const skills = (data.skillsRaw || "").split("\n").map(s => s.trim()).filter(Boolean);
    const requirements = (data.requirementsRaw || "").split("\n").map(s => s.trim()).filter(Boolean);
    const course = instructorStore.create(instructorId, instructorName, {
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      longDescription: data.longDescription,
      category: data.category as CourseCategory,
      level: data.level as CourseLevel,
      price: isFree ? 0 : data.price,
      isFree,
      certificate: data.certificate,
      coverColor: selectedColor,
      skills,
      requirements,
    });
    onCreated(course);
    toast({
      title: "تم إنشاء الدورة",
      description: `تم حفظ "${data.title}" كمسودة. يمكنك إضافة الدروس ثم نشرها.`,
    });
    form.reset();
    setIsFree(true);
    setSelectedColor(COVER_COLORS[0]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" dir="rtl">
        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-primary/10 shadow-sm p-8">
          <h3 className="text-xl font-black text-primary mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> المعلومات الأساسية
          </h3>
          <div className="space-y-5">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>عنوان الدورة <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="مثال: أساسيات القيادة الكشفية" className="h-12 text-lg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="subtitle" render={({ field }) => (
              <FormItem>
                <FormLabel>الوصف المختصر <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="جملة وصفية تظهر أسفل العنوان..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>الوصف العام <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Textarea placeholder="وصف مختصر للدورة..." rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="longDescription" render={({ field }) => (
              <FormItem>
                <FormLabel>الوصف التفصيلي <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Textarea placeholder="شرح تفصيلي كامل للدورة، أهدافها، محتواها..." rows={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        {/* Classification */}
        <div className="bg-white rounded-2xl border border-primary/10 shadow-sm p-8">
          <h3 className="text-xl font-black text-primary mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> التصنيف والمستوى
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>التصنيف <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="level" render={({ field }) => (
              <FormItem>
                <FormLabel>المستوى <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="اختر المستوى" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-primary/10 shadow-sm p-8">
          <h3 className="text-xl font-black text-primary mb-6 flex items-center gap-2">
            <Star className="h-5 w-5" /> التسعير والمزايا
          </h3>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => { setIsFree(true); form.setValue("isFree", true); }}
                className={`flex-1 border-2 rounded-xl p-4 text-center font-bold transition-all ${isFree ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
              >
                🎁 مجاني
              </button>
              <button
                type="button"
                onClick={() => { setIsFree(false); form.setValue("isFree", false); }}
                className={`flex-1 border-2 rounded-xl p-4 text-center font-bold transition-all ${!isFree ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
              >
                💰 مدفوع
              </button>
            </div>
            {!isFree && (
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>السعر (ر.س)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
              <FormField control={form.control} name="certificate" render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0 flex-row">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-5 w-5 accent-primary rounded"
                    />
                  </FormControl>
                  <FormLabel className="font-bold cursor-pointer">تمنح الدورة شهادة إتمام</FormLabel>
                </FormItem>
              )} />
            </div>
          </div>
        </div>

        {/* Content outline */}
        <div className="bg-white rounded-2xl border border-primary/10 shadow-sm p-8">
          <h3 className="text-xl font-black text-primary mb-6 flex items-center gap-2">
            <GraduationCap className="h-5 w-5" /> محتوى الدورة
          </h3>
          <div className="space-y-5">
            <FormField control={form.control} name="skillsRaw" render={({ field }) => (
              <FormItem>
                <FormLabel>ما ستتعلمه (كل مهارة في سطر)</FormLabel>
                <FormControl>
                  <Textarea placeholder={"مهارة القيادة\nالتواصل الفعال\nحل المشكلات"} rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="requirementsRaw" render={({ field }) => (
              <FormItem>
                <FormLabel>المتطلبات المسبقة (كل متطلب في سطر)</FormLabel>
                <FormControl>
                  <Textarea placeholder={"لا يوجد متطلبات\nأو: معرفة أساسية بالكشافة"} rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        {/* Cover color */}
        <div className="bg-white rounded-2xl border border-primary/10 shadow-sm p-8">
          <h3 className="text-xl font-black text-primary mb-6 flex items-center gap-2">
            <Eye className="h-5 w-5" /> لون الغلاف
          </h3>
          <div className="flex flex-wrap gap-3">
            {COVER_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => { setSelectedColor(color); form.setValue("coverColor", color); }}
                className={`h-10 w-10 rounded-xl transition-transform hover:scale-110 ${selectedColor === color ? "ring-4 ring-offset-2 ring-primary scale-110" : ""}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="mt-4 h-12 rounded-xl" style={{ backgroundColor: selectedColor }} />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-14 text-xl font-bold bg-primary text-white hover:bg-primary/90 rounded-2xl shadow-lg"
        >
          <Plus className="ml-2 h-6 w-6" /> حفظ كمسودة
        </Button>
      </form>
    </Form>
  );
}

function LessonsManager({ course, onChange }: { course: InstructorCourse; onChange: (c: InstructorCourse) => void }) {
  const { toast } = useToast();
  const [current, setCurrent] = useState<InstructorCourse>(course);

  useEffect(() => { setCurrent(course); }, [course]);

  const handleLessonSaved = (updated: InstructorCourse) => {
    setCurrent(updated);
    onChange(updated);
  };

  const handleDeleteLesson = (lessonId: string) => {
    const updated = instructorStore.removeLesson(current.id, lessonId);
    if (updated) {
      setCurrent(updated);
      onChange(updated);
      toast({ title: "تم حذف الدرس" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-primary">{current.title}</h3>
            <p className="text-sm text-muted-foreground">{current.lessonsCount} درس · {current.enrolledCount} متدرب</p>
          </div>
          <AddLessonDialog course={current} onSave={handleLessonSaved} />
        </div>

        {current.lessons.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold">لا توجد دروس بعد</p>
            <p className="text-sm">أضف أول درس لهذه الدورة</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {current.lessons.map((lesson, idx) => (
                <motion.div
                  key={lesson.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-bold text-primary">{lesson.title}</span>
                      <LessonTypeBadge type={lesson.type} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.duration}</span>
                      <span className="line-clamp-1">{lesson.description}</span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"
                    onClick={() => handleDeleteLesson(lesson.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InstructorDashboard() {
  const { state: authState } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<InstructorCourse | null>(null);

  useEffect(() => {
    if (!authState.isLoading && authState.user) {
      setCourses(instructorStore.getAll(String(authState.user.id)));
    }
  }, [authState.user, authState.isLoading]);

  if (authState.isLoading) {
    return (
      <SiteLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  const totalEnrollments = courses.reduce((s, c) => s + c.enrolledCount, 0);
  const published = courses.filter(c => c.status === "published").length;
  const drafts = courses.filter(c => c.status === "draft").length;

  const handlePublish = (id: string) => {
    const updated = instructorStore.publish(id);
    if (updated) {
      setCourses(prev => prev.map(c => c.id === id ? updated : c));
      toast({ title: "تم نشر الدورة ✅", description: `"${updated.title}" أصبحت متاحة للمتدربين.` });
    }
  };

  const handleDelete = (id: string) => {
    const course = courses.find(c => c.id === id);
    instructorStore.delete(id);
    setCourses(prev => prev.filter(c => c.id !== id));
    if (selectedCourse?.id === id) setSelectedCourse(null);
    toast({ title: "تم الحذف", description: `تم حذف "${course?.title}".`, variant: "destructive" });
  };

  const handleCourseCreated = (course: InstructorCourse) => {
    setCourses(prev => [...prev, course]);
    setSelectedCourse(course);
    setActiveTab("lessons");
  };

  const handleCourseChanged = (updated: InstructorCourse) => {
    setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleSelectForLessons = (course: InstructorCourse) => {
    setSelectedCourse(course);
    setActiveTab("lessons");
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
    { id: "courses", label: "دوراتي", icon: BookOpen },
    { id: "new-course", label: "دورة جديدة", icon: Plus },
    { id: "lessons", label: "إدارة الدروس", icon: BookMarked },
  ];

  return (
    <SiteLayout>
      <AuthGuard title="لوحة قيادة المدرّب" description="يجب تسجيل الدخول للوصول إلى لوحة التحكم.">
      <div className="min-h-screen bg-background" dir="rtl">
        {/* Page header */}
        <div className="bg-primary text-white py-12">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black">
                {authState.user.name[0]}
              </div>
              <div>
                <p className="text-white/70 font-medium text-sm">لوحة قيادة المدرّب</p>
                <h1 className="text-3xl font-black">أهلاً، {authState.user.name.split(" ")[0]}</h1>
                <p className="text-white/80 text-sm mt-1">
                  {courses.length} دورة · {totalEnrollments} تسجيل إجمالي
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-border sticky top-20 z-30">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-primary hover:border-primary/30"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === "courses" && courses.length > 0 && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-black">
                      {courses.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 md:px-8 py-10">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <StatCard icon={BookOpen} label="إجمالي الدورات" value={courses.length} color="#1B6B35" />
                  <StatCard icon={Users} label="إجمالي المتدربين" value={totalEnrollments} color="#D4A017" />
                  <StatCard icon={CheckCircle} label="دورات منشورة" value={published} color="#2D8A4E" />
                  <StatCard icon={Clock} label="مسودات" value={drafts} color="#E67E22" />
                </div>

                {courses.length > 0 ? (
                  <div>
                    <h2 className="text-2xl font-black text-primary mb-6">أداء الدورات</h2>
                    <div className="bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/30">
                              <th className="text-right px-6 py-4 font-black text-primary">الدورة</th>
                              <th className="text-center px-4 py-4 font-black text-primary">الحالة</th>
                              <th className="text-center px-4 py-4 font-black text-primary">المتدربون</th>
                              <th className="text-center px-4 py-4 font-black text-primary">الدروس</th>
                              <th className="text-center px-4 py-4 font-black text-primary">السعر</th>
                              <th className="text-right px-6 py-4 font-black text-primary">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courses.map((course, idx) => (
                              <tr key={course.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg shrink-0" style={{ backgroundColor: course.coverColor }} />
                                    <span className="font-bold text-primary line-clamp-1">{course.title}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <Badge className={course.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                                    {course.status === "published" ? "منشورة" : "مسودة"}
                                  </Badge>
                                </td>
                                <td className="px-4 py-4 text-center font-black text-primary">{course.enrolledCount}</td>
                                <td className="px-4 py-4 text-center font-black text-primary">{course.lessonsCount}</td>
                                <td className="px-4 py-4 text-center font-semibold text-muted-foreground">
                                  {course.isFree ? "مجاني" : `${course.price} ر.س`}
                                </td>
                                <td className="px-6 py-4">
                                  <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10 rounded-lg gap-1"
                                    onClick={() => handleSelectForLessons(course)}>
                                    <BookMarked className="h-4 w-4" /> الدروس
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white rounded-2xl border border-primary/10">
                    <GraduationCap className="h-20 w-20 mx-auto mb-6 text-primary/20" />
                    <h3 className="text-2xl font-black text-primary mb-3">لم تنشئ أي دورة بعد</h3>
                    <p className="text-muted-foreground mb-8">ابدأ بإنشاء دورتك الأولى وشارك معرفتك مع الكشافة.</p>
                    <Button
                      size="lg"
                      className="bg-primary text-white hover:bg-primary/90 rounded-full px-8"
                      onClick={() => setActiveTab("new-course")}
                    >
                      <Plus className="ml-2 h-5 w-5" /> إنشاء دورة جديدة
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "courses" && (
              <motion.div key="courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-primary">دوراتي ({courses.length})</h2>
                  <Button
                    onClick={() => setActiveTab("new-course")}
                    className="gap-2 bg-primary text-white hover:bg-primary/90 rounded-xl"
                  >
                    <Plus className="h-4 w-4" /> دورة جديدة
                  </Button>
                </div>
                {courses.length === 0 ? (
                  <div className="text-center py-24 bg-white rounded-2xl border border-primary/10">
                    <BookOpen className="h-20 w-20 mx-auto mb-6 text-primary/20" />
                    <h3 className="text-2xl font-black text-primary mb-3">لا توجد دورات</h3>
                    <p className="text-muted-foreground mb-8">أنشئ دورتك الأولى الآن.</p>
                    <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-8"
                      onClick={() => setActiveTab("new-course")}>
                      <Plus className="ml-2 h-5 w-5" /> إنشاء دورة
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {courses.map(course => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          onPublish={handlePublish}
                          onDelete={handleDelete}
                          onSelect={handleSelectForLessons}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "new-course" && (
              <motion.div key="new-course" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-black text-primary mb-8">إنشاء دورة جديدة</h2>
                <NewCourseForm
                  instructorId={String(authState.user.id)}
                  instructorName={authState.user.name}
                  onCreated={handleCourseCreated}
                />
              </motion.div>
            )}

            {activeTab === "lessons" && (
              <motion.div key="lessons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-black text-primary mb-6">إدارة الدروس</h2>
                {courses.length === 0 ? (
                  <div className="text-center py-24 bg-white rounded-2xl border border-primary/10">
                    <BookMarked className="h-20 w-20 mx-auto mb-6 text-primary/20" />
                    <h3 className="text-2xl font-black text-primary mb-3">لا توجد دورات</h3>
                    <p className="text-muted-foreground mb-8">أنشئ دورة أولاً لتتمكن من إدارة دروسها.</p>
                    <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-8"
                      onClick={() => setActiveTab("new-course")}>
                      <Plus className="ml-2 h-5 w-5" /> إنشاء دورة
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Course selector sidebar */}
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm p-4 sticky top-40">
                        <h3 className="font-black text-primary mb-4 text-sm uppercase tracking-wide">اختر الدورة</h3>
                        <div className="space-y-2">
                          {courses.map(course => (
                            <button
                              key={course.id}
                              onClick={() => setSelectedCourse(course)}
                              className={`w-full text-right p-3 rounded-xl transition-colors ${
                                selectedCourse?.id === course.id
                                  ? "bg-primary text-white"
                                  : "hover:bg-muted/50 text-primary"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-md shrink-0" style={{ backgroundColor: course.coverColor }} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm line-clamp-1">{course.title}</div>
                                  <div className={`text-xs ${selectedCourse?.id === course.id ? "text-white/70" : "text-muted-foreground"}`}>
                                    {course.lessonsCount} درس
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Lessons panel */}
                    <div className="lg:col-span-3">
                      {selectedCourse ? (
                        <LessonsManager
                          course={selectedCourse}
                          onChange={(updated) => {
                            handleCourseChanged(updated);
                            setSelectedCourse(updated);
                          }}
                        />
                      ) : (
                        <div className="bg-white rounded-2xl border border-primary/10 shadow-sm flex flex-col items-center justify-center py-24 text-center">
                          <ChevronRight className="h-12 w-12 text-primary/20 mb-4 rotate-180" />
                          <p className="font-bold text-primary text-lg">اختر دورة من القائمة</p>
                          <p className="text-muted-foreground text-sm mt-2">لعرض وإدارة دروسها</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </AuthGuard>
    </SiteLayout>
  );
}
