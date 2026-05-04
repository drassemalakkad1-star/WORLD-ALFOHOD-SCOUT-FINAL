import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { 
  LogOut, User, CreditCard, CalendarDays, ShoppingBag, Settings, 
  LayoutDashboard, MapPin, Mail, Medal, Activity, Download, Loader2, 
  GraduationCap, PawPrint, ChevronDown, ChevronUp, Clock, Truck, 
  CheckCircle2, Package, Search, Box, Home
} from "lucide-react";

import { useAuth } from "@/components/auth/authContext";
import { useCart } from "@/components/store/cartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { events } from "@/data/events";
import { academyApi } from "@/lib/academyApi";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SiteLayout } from "@/components/layout/SiteLayout";


const profileSchema = z.object({
  name: z.string().min(2, { message: "الاسم مطلوب" }),
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
  country: z.string().optional(),
  bio: z.string().optional(),
});

export default function Account() {
  const { state, dispatch } = useAuth();
  const { dispatch: cartDispatch } = useCart();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSaving, setIsSaving] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState("الكل");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Authentication check handled by AuthGuard later in the render

  useEffect(() => {
    if (activeTab === "orders") {
      try {
        const storedOrders = localStorage.getItem("cheetahs_orders");
        if (storedOrders) {
          const parsed = JSON.parse(storedOrders);
          // Decorate with fake statuses for demo
          const decorated = parsed.map((o: any, i: number) => {
            const ageDays = (new Date().getTime() - new Date(o.date).getTime()) / (1000 * 3600 * 24);
            let fakeStatus = "قيد المعالجة";
            if (ageDays > 30 || i % 4 === 0) fakeStatus = "تم التسليم";
            else if (ageDays > 7 || i % 3 === 0) fakeStatus = "تم الشحن";
            return { ...o, status: o.status === "قيد المعالجة" ? fakeStatus : o.status };
          });
          // Sort newest first
          decorated.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setOrders(decorated);
        }
      } catch(e) {}
    }
  }, [activeTab]);

  const { data: myEnrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ["myEnrollments", state.user?.email],
    queryFn: () => academyApi.listMyEnrollments(state.user!.email),
    enabled: activeTab === "academy" && !!state.user,
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: state.user?.name || "",
      email: state.user?.email || "",
      country: state.user?.country || "",
      bio: state.user?.bio || "",
    },
  });

  if (!state.isLoading && !state.user) {
    return (
      <AuthGuard title="حسابي" description="يرجى تسجيل الدخول للوصول إلى تفاصيل حسابك وطلباتك.">
        <div />
      </AuthGuard>
    );
  }

  if (state.isLoading || !state.user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { user } = state;

  const handleSignOut = () => {
    dispatch({ type: "SIGN_OUT" });
    setLocation("/");
  };

  const onSubmitProfile = async (values: z.infer<typeof profileSchema>) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    dispatch({ 
      type: "UPDATE_PROFILE", 
      payload: {
        name: values.name,
        email: values.email,
        country: values.country,
        bio: values.bio,
      } 
    });
    
    toast({
      title: "تم الحفظ",
      description: "تم تحديث بيانات ملفك الشخصي بنجاح.",
    });
    setIsSaving(false);
  };

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      cartDispatch({ type: "ADD_ITEM", payload: item });
    });
    cartDispatch({ type: "TOGGLE_CART", payload: true });
    toast({
      title: "تم الإضافة",
      description: "تمت إضافة المنتجات إلى السلة بنجاح.",
    });
  };

  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "profile", label: "ملفي الشخصي", icon: <User className="h-5 w-5" /> },
    { id: "membership", label: "عضويتي", icon: <CreditCard className="h-5 w-5" /> },
    { id: "events", label: "الفعاليات المسجلة", icon: <CalendarDays className="h-5 w-5" /> },
    { id: "academy", label: "دوراتي", icon: <GraduationCap className="h-5 w-5" /> },
    { id: "orders", label: "طلباتي من المتجر", icon: <ShoppingBag className="h-5 w-5" /> },
    { id: "settings", label: "الإعدادات", icon: <Settings className="h-5 w-5" /> },
  ];

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch(e) {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const updateTab = (id: string) => {
    setActiveTab(id);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("tab", id);
    window.history.pushState({}, "", newUrl);
  };

  const filteredOrders = orderFilter === "الكل" ? orders : orders.filter(o => o.status === orderFilter);

  const getStatusColor = (status: string) => {
    if (status === "تم التسليم") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (status === "تم الشحن") return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400";
    if (status === "ملغية") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-80px)]">

      {/* Sidebar */}
      <aside className="lg:w-1/4 flex-shrink-0">
        <div className="bg-card border border-border rounded-2xl p-6 sticky top-28 space-y-8">
          <div className="flex items-center gap-4">
            <div 
              className="h-16 w-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0"
              style={{ backgroundColor: user.avatarColor }}
            >
              {getInitials(user.name)}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-lg text-foreground truncate">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.role}</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-2">
            <Link href="/">
              <button
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-right w-full mb-2"
              >
                <Home className="h-5 w-5" />
                الصفحة الرئيسية
              </button>
            </Link>

            <div className="mb-2 border-t border-border opacity-50" />
            
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => updateTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-right w-full
                  ${activeTab === tab.id 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            
            <div className="my-2 border-t border-border" />
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-destructive hover:bg-destructive/10 transition-colors text-right w-full"
            >
              <LogOut className="h-5 w-5" />
              تسجيل الخروج
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:w-3/4 flex-1">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 space-y-4">
                  <h1 className="text-3xl font-bold">مرحباً بعودتك، {user.name.split(' ')[0]} 👋</h1>
                  <p className="text-primary-foreground/80 max-w-md">
                    نحن سعداء برؤيتك مجدداً. استكشف الفعاليات القادمة وتابع تقدمك في رحلة الفهود.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <div className="bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                      <span className="text-white/60 text-sm">تاريخ الانضمام</span>
                      <span className="font-semibold">{formatDate(user.joinedAt)}</span>
                    </div>
                    <div className="bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                      <span className="text-white/60 text-sm">رقم العضوية</span>
                      <span className="font-semibold uppercase font-mono">{String(user.id).substring(0, 6)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-foreground">4</h3>
                    <p className="text-muted-foreground font-medium">الفعاليات المحضورة</p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-foreground">1,250</h3>
                    <p className="text-muted-foreground font-medium">نقاط النشاط</p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Medal className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-foreground">8</h3>
                    <p className="text-muted-foreground font-medium">الشارات المكتسبة</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="bg-card border border-border rounded-2xl p-8 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">الملف الشخصي</h2>
                <p className="text-muted-foreground">قم بتحديث بياناتك الشخصية ومعلومات الاتصال الخاصة بك.</p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الكامل</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-12 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input {...field} dir="ltr" className="h-12 rounded-xl" disabled />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البلد</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl">
                              <SelectValue placeholder="اختر بلدك" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sa">السعودية</SelectItem>
                            <SelectItem value="ae">الإمارات</SelectItem>
                            <SelectItem value="eg">مصر</SelectItem>
                            <SelectItem value="jo">الأردن</SelectItem>
                            <SelectItem value="om">عمان</SelectItem>
                            <SelectItem value="kw">عُمان</SelectItem>
                            <SelectItem value="qa">الكويت</SelectItem>
                            <SelectItem value="bh">البحرين</SelectItem>
                            <SelectItem value="other">أخرى</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نبذة عني</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="اكتب نبذة مختصرة عن نفسك وعن اهتماماتك..." 
                            className="resize-none rounded-xl min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="bg-secondary hover:bg-secondary/90 text-white rounded-xl h-12 px-8 font-bold"
                    >
                      {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "حفظ التغييرات"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {activeTab === "membership" && (
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">بطاقة العضوية</h2>
                    <p className="text-muted-foreground">بطاقة العضوية الرسمية الخاصة بك في عالم الفهود.</p>
                  </div>
                  <Button variant="outline" className="gap-2 rounded-xl h-12 px-6">
                    <Download className="h-5 w-5" />
                    تنزيل البطاقة
                  </Button>
                </div>

                <div className="max-w-md mx-auto relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-primary overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl aspect-[1.6/1]">
                    <div className="absolute inset-0 opacity-10">
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="hexagons" width="40" height="69.282" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                            <path d="M 40 17.321 L 20 5.774 L 0 17.321 L 0 40.415 L 20 51.962 L 40 40.415 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#hexagons)" />
                      </svg>
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">عضوية رسمية</p>
                          <p className="font-bold text-xl">{user.role}</p>
                        </div>
                        <PawPrint className="h-10 w-10 text-secondary" />
                      </div>

                      <div className="mt-auto space-y-4">
                        <div className="font-mono text-xl tracking-widest text-primary-foreground/90">
                          {String(user.id).substring(0, 4)}-{String(user.id).substring(4, 8)}-CTH
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] uppercase text-primary-foreground/60 mb-1">الاسم</p>
                            <p className="font-bold text-lg">{user.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase text-primary-foreground/60 mb-1">تاريخ الانضمام</p>
                            <p className="font-semibold text-sm">{formatDate(user.joinedAt).split(' ')[2]}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "academy" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">دوراتي التعليمية</h2>
                <Button asChild variant="outline" className="rounded-xl hidden sm:flex">
                  <Link href="/academy">استكشاف المزيد</Link>
                </Button>
              </div>

              {isLoadingEnrollments ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : myEnrollments && myEnrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myEnrollments.map((enr) => (
                    <div key={enr.enrollmentId} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                      <div className="p-5 flex gap-4">
                        <div 
                          className="w-24 h-24 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                          style={{ background: `linear-gradient(135deg, ${enr.course.coverColor}, ${enr.course.coverColor}dd)` }}
                        >
                          <GraduationCap className="h-10 w-10 text-white/50" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-bold text-primary/80 bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block">
                            {enr.course.category}
                          </span>
                          <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{enr.course.title}</h3>
                          <p className="text-sm text-muted-foreground">{enr.course.lessonsCount} دروس • {enr.course.duration}</p>
                        </div>
                      </div>
                      
                      <div className="px-5 pb-5 mt-auto">
                        <div className="flex items-center justify-between text-sm font-medium mb-2">
                          <span>التقدم</span>
                          <span className="text-primary">{enr.progressPct}%</span>
                        </div>
                        <Progress value={enr.progressPct} className="h-2 mb-4 bg-muted" />
                        <Button asChild className="w-full h-12 rounded-xl font-bold gap-2">
                          <Link href={`/academy/learn/${enr.courseSlug}`}>
                            متابعة التعلم
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-16 text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-primary/5 mx-auto flex items-center justify-center">
                    <GraduationCap className="h-12 w-12 text-primary/40" />
                  </div>
                  <div className="space-y-2 max-w-sm mx-auto">
                    <h3 className="text-2xl font-bold">لا توجد دورات</h3>
                    <p className="text-muted-foreground">أنت غير مسجل في أي دورة تعليمية حالياً. انضم لأكاديمية الفهود وابدأ رحلة التعلم.</p>
                  </div>
                  <Button asChild className="bg-secondary hover:bg-secondary/90 text-white rounded-xl h-12 px-8">
                    <Link href="/academy">تصفح الدورات</Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === "events" && (
            <div className="bg-card border border-border rounded-2xl p-16 text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-primary/5 mx-auto flex items-center justify-center">
                <CalendarDays className="h-12 w-12 text-primary/40" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-2xl font-bold">لا توجد فعاليات مسجلة</h3>
                <p className="text-muted-foreground">أنت لم تقم بالتسجيل في أي فعاليات قادمة حتى الآن. تصفح جدول الفعاليات وانضم إلينا.</p>
              </div>
              <Button asChild className="bg-secondary hover:bg-secondary/90 text-white rounded-xl h-12 px-8">
                <Link href="/events">استكشاف الفعاليات</Link>
              </Button>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">طلباتي من المتجر</h2>
                {orders.length > 0 && (
                  <Button asChild variant="outline" className="rounded-xl hidden sm:flex">
                    <Link href="/store">تصفح المتجر</Link>
                  </Button>
                )}
              </div>

              {orders.length > 0 ? (
                <>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {["الكل", "قيد المعالجة", "تم الشحن", "تم التسليم", "ملغية"].map(f => (
                      <button
                        key={f}
                        onClick={() => setOrderFilter(f)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors
                          ${orderFilter === f ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}
                        `}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                      <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
                        لا توجد طلبات تطابق هذا التصنيف
                      </div>
                    ) : (
                      filteredOrders.map((order: any) => {
                        const isExpanded = expandedOrder === order.id;
                        const mainItem = order.items[0];
                        const otherItemsCount = order.items.length - 1;
                        
                        return (
                          <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden transition-all hover:border-primary/30">
                            {/* Order Header / Summary */}
                            <div className="p-5 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1 font-medium">رقم الطلب</p>
                                    <p className="font-bold font-mono">{order.id}</p>
                                  </div>
                                  <div className="h-10 w-px bg-border hidden sm:block"></div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1 font-medium">التاريخ</p>
                                    <p className="font-bold">{formatDate(order.date)}</p>
                                  </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-full text-sm font-bold w-fit ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </div>
                              </div>

                              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="flex -space-x-4 rtl:space-x-reverse shrink-0">
                                    {order.items.slice(0, 4).map((item: any, i: number) => (
                                      <div key={i} className="w-16 h-16 rounded-xl border-2 border-background overflow-hidden bg-white shrink-0 relative z-10 shadow-sm">
                                        <img loading="lazy" decoding="async" src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                                      </div>
                                    ))}
                                    {order.items.length > 4 && (
                                      <div className="w-16 h-16 rounded-xl border-2 border-background bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm z-0 relative">
                                        +{order.items.length - 4}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold line-clamp-1">{mainItem?.name}</p>
                                    {otherItemsCount > 0 && (
                                      <p className="text-sm text-muted-foreground font-medium">و {otherItemsCount} منتج آخر</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row md:flex-col md:items-end lg:flex-row lg:items-center shrink-0">
                                  <div className="text-left sm:text-right md:text-left">
                                    <p className="text-sm text-muted-foreground mb-1 font-medium">الشحن إلى {order.shippingAddress?.city}</p>
                                    <p className="text-2xl font-black text-secondary">${order.total?.toFixed(2)}</p>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                      className="rounded-lg font-bold"
                                    >
                                      التفاصيل
                                      {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleReorder(order)}
                                      className="rounded-lg font-bold bg-primary/5 text-primary hover:bg-primary/10 border-primary/20"
                                    >
                                      إعادة الطلب
                                    </Button>
                                    
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button size="sm" className="rounded-lg font-bold bg-secondary hover:bg-secondary/90 text-white">
                                          تتبع الطلب
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-md p-6 rounded-3xl" dir="rtl">
                                        <DialogHeader>
                                          <DialogTitle className="text-2xl font-black">تتبع الطلب: {order.id}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-6 pt-4">
                                          <div className="flex justify-between text-sm font-bold text-muted-foreground bg-muted p-4 rounded-xl">
                                            <span>رقم التتبع: TRK-{Math.floor(Math.random()*900000)+100000}</span>
                                            <span>شحن الفهود السريع</span>
                                          </div>
                                          
                                          <div className="relative pl-4 pr-6 space-y-8 before:absolute before:inset-0 before:ml-auto before:mr-5 before:translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                            
                                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-secondary text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                                                <CheckCircle2 className="w-5 h-5" />
                                              </div>
                                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-muted/50 border border-border">
                                                <p className="font-bold text-foreground">تم استلام الطلب</p>
                                                <p className="text-sm text-muted-foreground mt-1">{formatDate(order.date)}</p>
                                              </div>
                                            </div>

                                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow ${order.status !== "قيد المعالجة" ? "bg-secondary text-white" : "bg-muted text-muted-foreground"}`}>
                                                <Box className="w-5 h-5" />
                                              </div>
                                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-muted/50 border border-border">
                                                <p className={`font-bold ${order.status !== "قيد المعالجة" ? "text-foreground" : "text-muted-foreground"}`}>قيد التحضير</p>
                                              </div>
                                            </div>

                                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow ${order.status === "تم الشحن" || order.status === "تم التسليم" ? "bg-secondary text-white" : "bg-muted text-muted-foreground"}`}>
                                                <Truck className="w-5 h-5" />
                                              </div>
                                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-muted/50 border border-border">
                                                <p className={`font-bold ${order.status === "تم الشحن" || order.status === "تم التسليم" ? "text-foreground" : "text-muted-foreground"}`}>تم الشحن</p>
                                              </div>
                                            </div>

                                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow ${order.status === "تم التسليم" ? "bg-secondary text-white" : "bg-muted text-muted-foreground"}`}>
                                                <MapPin className="w-5 h-5" />
                                              </div>
                                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-muted/50 border border-border">
                                                <p className={`font-bold ${order.status === "تم التسليم" ? "text-foreground" : "text-muted-foreground"}`}>تم التسليم</p>
                                              </div>
                                            </div>
                                            
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-border bg-muted/10 overflow-hidden"
                                >
                                  <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                      <h4 className="font-bold text-lg mb-4">المنتجات</h4>
                                      {order.items.map((item: any, i: number) => (
                                        <div key={i} className="flex gap-4 items-center">
                                          <div className="w-16 h-16 rounded-xl border border-border bg-white p-2 shrink-0">
                                            <img loading="lazy" decoding="async" src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                          </div>
                                          <div className="flex-1">
                                            <p className="font-bold text-sm line-clamp-1">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                                          </div>
                                          <div className="font-bold text-sm">
                                            ${(item.price * item.quantity).toFixed(2)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    <div className="space-y-6">
                                      <div>
                                        <h4 className="font-bold text-lg mb-4">تفاصيل الشحن والدفع</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div className="bg-card border border-border p-3 rounded-xl">
                                            <p className="text-muted-foreground mb-1">طريقة الدفع</p>
                                            <p className="font-bold">{order.paymentMethod === "card" ? "بطاقة ائتمانية" : "طريقة أخرى"}</p>
                                          </div>
                                          <div className="bg-card border border-border p-3 rounded-xl">
                                            <p className="text-muted-foreground mb-1">طريقة الشحن</p>
                                            <p className="font-bold">{order.shippingMethod === "express" ? "سريع" : order.shippingMethod === "pickup" ? "استلام" : "قياسي"}</p>
                                          </div>
                                          <div className="col-span-2 bg-card border border-border p-3 rounded-xl">
                                            <p className="text-muted-foreground mb-1">عنوان التوصيل</p>
                                            <p className="font-bold leading-relaxed">
                                              {order.shippingAddress?.fullName}<br/>
                                              {order.shippingAddress?.address}<br/>
                                              {order.shippingAddress?.city}، {order.shippingAddress?.country}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-bold text-lg mb-4">ملخص الدفع</h4>
                                        <div className="bg-card border border-border p-4 rounded-xl space-y-2 text-sm font-medium">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">المجموع الفرعي</span>
                                            <span>${order.subtotal?.toFixed(2)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">الشحن</span>
                                            <span>{order.shipping === 0 ? "مجاناً" : `$${order.shipping?.toFixed(2)}`}</span>
                                          </div>
                                          {order.discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                              <span>الخصم</span>
                                              <span>-${order.discount?.toFixed(2)}</span>
                                            </div>
                                          )}
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">الضريبة (5%)</span>
                                            <span>${order.vat?.toFixed(2) || ((order.total - order.subtotal - order.shipping + order.discount) || 0).toFixed(2)}</span>
                                          </div>
                                          <div className="border-t border-border pt-2 mt-2 flex justify-between font-black text-lg text-primary">
                                            <span>الإجمالي</span>
                                            <span>${order.total?.toFixed(2)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-16 text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-primary/5 mx-auto flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-primary/40" />
                  </div>
                  <div className="space-y-2 max-w-sm mx-auto">
                    <h3 className="text-2xl font-bold">لا توجد طلبات سابقة</h3>
                    <p className="text-muted-foreground">لم تقم بإجراء أي طلبات من المتجر بعد. تصفح المعدات والأدوات الكشفية في متجرنا.</p>
                  </div>
                  <Button asChild className="bg-secondary hover:bg-secondary/90 text-white rounded-xl h-12 px-8">
                    <Link href="/store">زيارة المتجر</Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-card border border-border rounded-2xl p-8 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">إعدادات الحساب</h2>
                <p className="text-muted-foreground">قم بإدارة تفضيلات حسابك والإشعارات.</p>
              </div>

              <div className="space-y-8 max-w-2xl">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-b border-border pb-2">التنبيهات والإشعارات</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-bold">تنبيهات البريد الإلكتروني</Label>
                      <p className="text-sm text-muted-foreground">استلام تحديثات حول الفعاليات والتغييرات الهامة.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-bold">النشرة الإخبارية</Label>
                      <p className="text-sm text-muted-foreground">استلام النشرة الشهرية وأحدث أخبار الفهود.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-b border-border pb-2">تفضيلات العرض</h3>
                  
                  <div className="space-y-3">
                    <Label className="text-base font-bold">لغة الواجهة</Label>
                    <Select defaultValue="ar" dir="rtl">
                      <SelectTrigger className="w-full max-w-xs h-12 rounded-xl">
                        <SelectValue placeholder="اختر اللغة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-b border-border pb-2 text-destructive">منطقة الخطر</h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-base font-bold text-destructive">حذف الحساب</Label>
                      <p className="text-sm text-muted-foreground">بمجرد حذف حسابك، لا يمكن التراجع عن هذا الإجراء.</p>
                    </div>
                    <Button variant="destructive" className="rounded-xl h-12">
                      حذف حسابي
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
      </div>
    </SiteLayout>
  );
}
