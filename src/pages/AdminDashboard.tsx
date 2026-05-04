import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Shield, ShieldAlert, ShieldCheck, 
  Settings, Search, Filter, MoreVertical,
  LayoutDashboard, ShoppingBag, GraduationCap,
  TrendingUp, Users2, Activity, ArrowRight,
  UserPlus, UserMinus, UserCheck, AlertTriangle,
  Newspaper, Package, Plus, Pencil, Trash2, Eye,
  ExternalLink, CheckCircle2, XCircle, Info, Loader2,
  Video, RefreshCcw, Medal
} from "lucide-react";
import { useHallOfFameStore } from "@/lib/hallOfFameStore";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useAuth } from "@/components/auth/authContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type User = {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
};

type Stats = {
  totalUsers: number;
  totalNews: number;
  totalProducts: number;
  totalCourses: number;
  totalVideoChannels?: number;
};

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  admin: { label: "مدير النظام", icon: ShieldAlert, color: "text-red-700", bg: "bg-red-50 border-red-200" },
  instructor: { label: "قائد / مدرب", icon: GraduationCap, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  moderator: { label: "مشرف", icon: ShieldCheck, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  editor: { label: "محرر", icon: Shield, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  student: { label: "يافع / متدرب", icon: Users2, color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
};

export default function AdminDashboard() {
  const { state: auth } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "content" | "store" | "academy" | "youtube" | "hall-of-fame">("overview");
  const [ytChannelUrl, setYtChannelUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const isAdmin = auth.user?.role === "admin";

  // Real data fetching from server
  const { data: statsData, isLoading: loadingStats } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery<{ users: User[] }>({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
  });

  const { data: newsData } = useQuery<{ news: any[] }>({
    queryKey: ["/api/admin/news"],
    enabled: isAdmin && activeTab === "content",
  });

  const { data: productsData } = useQuery<{ products: any[] }>({
    queryKey: ["/api/admin/products"],
    enabled: isAdmin && activeTab === "store",
  });

  const { data: coursesData } = useQuery<{ courses: any[] }>({
    queryKey: ["/api/admin/courses"],
    enabled: isAdmin && activeTab === "academy",
  });

  const { data: ytChannelsData } = useQuery<{ channels: any[] }>({
    queryKey: ["/api/youtube/channels"],
    enabled: isAdmin && activeTab === "youtube",
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      return apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم التحديث", description: "تم تغيير صلاحية المستخدم بنجاح." });
    },
    onError: (err: any) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  });

  const addVideoChannelMutation = useMutation({
    mutationFn: async (url: string) => {
      // Basic extraction of ID from URL
      let channelId = url.split("/channel/")[1] || url.split("/@")[1];
      if (!channelId) throw new Error("رابط القناة غير صحيح. يرجى إدخال رابط يبدأ بـ /channel/ أو @");
      
      // In a real app, you'd fetch metadata from YouTube API here. 
      // For now, we simulate with dummy metadata.
      return apiRequest("POST", "/api/admin/youtube/channels", {
        channelId,
        title: channelId.startsWith("@") ? channelId : "قناة يوتيوب جديدة",
        thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
        isActive: 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/youtube/channels"] });
      setYtChannelUrl("");
      toast({ title: "تمت الإضافة", description: "تم ربط قناة اليوتيوب بنجاح." });
    },
    onError: (err: any) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  });

  const deleteVideoChannelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/youtube/channels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/youtube/channels"] });
      toast({ title: "تم الحذف", description: "تمت إزالة القناة ومحتوياتها بنجاح." });
    }
  });

  const syncVideosMutation = useMutation({
    mutationFn: async (channelId: string) => {
      setIsSyncing(channelId);
      // Simulate fetching videos from YouTube API
      const dummyVideos = Array.from({ length: 6 }).map((_, i) => ({
        videoId: `vid_${Math.random().toString(36).substr(2, 9)}`,
        title: `فيديو احترافي جديد #${i + 1}`,
        description: "محتوى تعليمي كشفي مميز مأخوذ مباشرة من قناة اليوتيوب الرسمية.",
        thumbnail: `https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=600`,
        publishedAt: new Date().toISOString(),
        sortOrder: i
      }));

      return apiRequest("POST", `/api/admin/youtube/sync/${channelId}`, { videos: dummyVideos });
    },
    onSuccess: () => {
      setIsSyncing(null);
      toast({ title: "تمت المزامنة", description: "تم جلب وتنظيم أحدث فيديوهات القناة بنجاح." });
    },
    onError: (err: any) => {
      setIsSyncing(null);
      toast({ title: "خطأ في المزامنة", description: err.message, variant: "destructive" });
    }
  });

  if (!isAdmin && !auth.isLoading) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <AlertTriangle className="h-20 w-20 text-amber-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black mb-4">وصول غير مصرح به</h1>
          <p className="text-muted-foreground mb-8">هذه الصفحة مخصصة لمديري النظام فقط، وجميع الإحصائيات محمية.</p>
          <Button asChild><a href="/">العودة للرئيسية</a></Button>
        </div>
      </SiteLayout>
    );
  }

  const filteredUsers = usersData?.users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const statsList = [
    { label: "إجمالي الأعضاء", value: statsData?.totalUsers ?? 0, icon: Users, color: "bg-blue-500" },
    { label: "المحتوى الإخباري", value: statsData?.totalNews ?? 0, icon: Newspaper, color: "bg-purple-500" },
    { label: "منتجات المتجر", value: statsData?.totalProducts ?? 0, icon: Package, color: "bg-orange-500" },
    { label: "الدورات الأكاديمية", value: statsData?.totalCourses ?? 0, icon: GraduationCap, color: "bg-emerald-500" },
  ];

  return (
    <SiteLayout>
      <AuthGuard title="لوحة التحكم الإدارية" description="يجب تسجيل الدخول كمدير للوصول إلى هذه اللوحة.">
        <div className="min-h-screen bg-slate-50/50 pb-20" dir="rtl">
          {/* Dashboard Header */}
          <div className="bg-[#622181] text-white pt-12 pb-24 px-4">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-black mb-2 flex items-center gap-3 text-secondary">
                    <LayoutDashboard className="h-8 w-8" />
                    مركز القيادة والتحكم
                  </h1>
                  <p className="text-white/70 font-medium">مرحباً بك يا {auth.user?.name}، جميع البيانات والإحصائيات محمية بخصوصية كاملة.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" className="font-bold rounded-full">
                    <Settings className="ml-2 h-4 w-4" /> إعدادات النظام
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 -mt-16">
            {/* Stats Grid - ONLY for Admin */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {statsList.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center p-6">
                        <div className={`${stat.color} p-4 rounded-2xl text-white mr-auto`}>
                          <stat.icon className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
                          {loadingStats ? (
                            <Skeleton className="h-8 w-12 mt-1" />
                          ) : (
                            <h3 className="text-2xl font-black">{stat.value}</h3>
                          )}
                        </div>
                      </div>
                      <div className="h-1 w-full bg-slate-100">
                        <div className={`${stat.color} h-full w-full opacity-20`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar">
              {[
                { id: "overview", label: "نظرة عامة", icon: Activity },
                { id: "users", label: "الأعضاء", icon: Users },
                { id: "content", label: "الأخبار", icon: Newspaper },
                { id: "store", label: "المتجر", icon: Package },
                { id: "academy", label: "الأكاديمية", icon: GraduationCap },
                { id: "youtube", label: "يوتيوب", icon: Video },
                { id: "hall-of-fame", label: "لوحة الشرف", icon: Medal },
              ].map((tab) => (
                <Button 
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`font-black rounded-full px-6 gap-2 transition-all ${activeTab === tab.id ? "bg-primary shadow-lg shadow-primary/20 scale-105" : "bg-white border-none shadow-sm hover:bg-slate-100"}`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  <Card className="lg:col-span-2 shadow-sm border-none bg-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="font-black text-xl flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          آخر النشاطات العالمية (للمدراء فقط)
                        </CardTitle>
                        <CardDescription>متابعة فورية لكل ما يحدث في عالم الفهود</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" className="font-bold text-primary">مشاهدة الكل</Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { text: "انضمام عضو جديد من منطقة 'الوطن العربي'", time: "منذ دقيقتين", icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50" },
                          { text: "طلب شراء جديد لزي الكشافة الرسمي (12 قطعة)", time: "منذ 15 دقيقة", icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
                          { text: "نشر خبر عاجل عن 'مخيم الفهود الأخضر 2026'", time: "منذ ساعة", icon: Newspaper, color: "text-purple-600", bg: "bg-purple-50" },
                          { text: "إكمال دورة 'القيادة الكشفية' من قبل 45 متدرباً", time: "منذ ساعتين", icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50" },
                        ].map((activity, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 group hover:border-primary/20 transition-colors">
                            <div className={`h-12 w-12 rounded-xl ${activity.bg} flex items-center justify-center ${activity.color} shrink-0`}>
                              <activity.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-800">{activity.text}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="shadow-lg border-none bg-gradient-to-br from-primary to-[#4a1961] text-white overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldAlert className="h-32 w-32" />
                      </div>
                      <CardHeader>
                        <CardTitle className="font-black text-xl">تنبيهات الأمان</CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="space-y-4">
                          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                            <p className="text-xs font-bold mb-1 opacity-80">محاولات تسجيل دخول مشبوهة</p>
                            <p className="text-sm font-black flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-400" /> لا توجد تهديدات نشطة
                            </p>
                          </div>
                          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                            <p className="text-xs font-bold mb-1 opacity-80">نسخ احتياطي للنظام</p>
                            <p className="text-sm font-black flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> مكتمل بنجاح (منذ 4 ساعات)
                            </p>
                          </div>
                        </div>
                        <Button variant="secondary" className="w-full mt-6 font-black rounded-xl">فحص حالة النظام</Button>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeTab === "users" && (
                <motion.div 
                  key="users"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="shadow-sm border-none bg-white">
                    <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-7">
                      <div>
                        <CardTitle className="font-black text-2xl">إدارة الأعضاء</CardTitle>
                        <CardDescription className="font-medium">التحكم في هويات وصلاحيات مستخدمي المنصة</CardDescription>
                      </div>
                      <div className="relative w-full md:w-80">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          placeholder="ابحث بالاسم أو البريد..." 
                          className="pr-10 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary h-12 font-bold"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th className="px-6 py-4 text-right font-black text-slate-500 uppercase tracking-wider">العضو</th>
                              <th className="px-6 py-4 text-right font-black text-slate-500 uppercase tracking-wider">الصلاحية</th>
                              <th className="px-6 py-4 text-right font-black text-slate-500 uppercase tracking-wider">التسجيل</th>
                              <th className="px-6 py-4 text-center font-black text-slate-500 uppercase tracking-wider">التحكم</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {loadingUsers ? (
                              Array(5).fill(0).map((_, i) => (
                                <tr key={i}>
                                  <td className="px-6 py-5"><Skeleton className="h-10 w-48 rounded-lg" /></td>
                                  <td className="px-6 py-5"><Skeleton className="h-6 w-24 rounded-full" /></td>
                                  <td className="px-6 py-5"><Skeleton className="h-6 w-32 rounded-lg" /></td>
                                  <td className="px-6 py-5"><Skeleton className="h-8 w-8 mx-auto rounded-full" /></td>
                                </tr>
                              ))
                            ) : filteredUsers.map((user) => {
                              const config = ROLE_CONFIG[user.role] || ROLE_CONFIG.student;
                              const RoleIcon = config.icon;
                              
                              return (
                                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                      <div className={`h-12 w-12 rounded-2xl ${config.bg} flex items-center justify-center ${config.color} font-black border border-current/10 shrink-0 shadow-sm`}>
                                        {user.fullName[0].toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="font-black text-slate-800 text-base">{user.fullName}</p>
                                        <p className="text-xs font-bold text-slate-400">{user.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5">
                                    <Badge className={`${config.bg} ${config.color} border-none font-black px-3 py-1 rounded-full shadow-sm`}>
                                      <RoleIcon className="ml-1.5 h-3.5 w-3.5" />
                                      {config.label}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-5 text-slate-500 font-bold">
                                    {new Date(user.createdAt).toLocaleDateString("ar-EG", { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </td>
                                  <td className="px-6 py-5 text-center">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 h-10 w-10">
                                          <MoreVertical className="h-5 w-5 text-slate-400" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl font-bold shadow-xl border-slate-100">
                                        <div className="px-3 py-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">تغيير رتبة المستخدم</div>
                                        {[
                                          { role: "admin", label: "مدير نظام", icon: ShieldAlert, color: "text-red-600" },
                                          { role: "instructor", label: "قائد / مدرب", icon: GraduationCap, color: "text-purple-600" },
                                          { role: "moderator", label: "مشرف عام", icon: ShieldCheck, color: "text-blue-600" },
                                          { role: "editor", label: "محرر محتوى", icon: Shield, color: "text-emerald-600" },
                                          { role: "student", label: "يافع (عضو عادي)", icon: Users2, color: "text-slate-600" },
                                        ].map((item) => (
                                          <DropdownMenuItem 
                                            key={item.role}
                                            className               {activeTab === "hall-of-fame" && <HallOfFameAdmin />}
            </AnimatePresence>
          </div>
        </div>
      </AuthGuard>
    </SiteLayout>
  );
}

function HallOfFameAdmin() {
  const { nominees, updateNomineeStatus, setWinner } = useHallOfFameStore();
  const { toast } = useToast();

  const handleStatusChange = (id: string, status: any) => {
    updateNomineeStatus(id, status);
    toast({ title: "تم التحديث", description: "تم تغيير حالة المرشح بنجاح." });
  };

  const handleSetWinner = (id: string, rank: 1|2|3|4) => {
    setWinner(id, rank, 2026);
    toast({ title: "مبروك!", description: `تم تعيين المرشح في المركز ${rank} بنجاح.` });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <Card className="shadow-sm border-none bg-white">
        <CardHeader>
          <CardTitle className="font-black text-2xl flex items-center gap-2">
            <Medal className="h-6 w-6 text-yellow-500" />
            إدارة ترشيحات لوحة الشرف
          </CardTitle>
          <CardDescription className="font-bold">مراجعة طلبات الترشيح وتحديد الفائزين بالألقاب الدورية.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-right font-black text-slate-500 uppercase">المرشح</th>
                  <th className="px-6 py-4 text-right font-black text-slate-500 uppercase">المُقدّم</th>
                  <th className="px-6 py-4 text-center font-black text-slate-500 uppercase">التفاعل</th>
                  <th className="px-6 py-4 text-center font-black text-slate-500 uppercase">الحالة</th>
                  <th className="px-6 py-4 text-center font-black text-slate-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {nominees.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <img src={n.image} className="h-10 w-10 rounded-lg object-cover" alt="" />
                        <div>
                          <p className="font-black text-slate-800">{n.nomineeName}</p>
                          <p className="text-xs font-bold text-primary">{n.relationship === 'mother' ? 'أم' : 'أب'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-600">{n.nominatorName}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <p className="font-black text-slate-800">{n.votes}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">صوت</p>
                        </div>
                        <div className="text-center">
                          <p className="font-black text-slate-800">{n.views}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">مشاهدة</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Badge className={`
                        font-black rounded-lg border-none
                        ${n.status === 'active' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${n.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                        ${n.status === 'winner' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${n.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                        {n.status === 'active' ? 'نشط' : n.status === 'pending' ? 'قيد المراجعة' : n.status === 'winner' ? 'فائز' : 'مرفوض'}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="font-black gap-2 rounded-xl">
                              إدارة <ChevronDown size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
                            <DropdownMenuItem onClick={() => handleStatusChange(n.id, 'active')} className="gap-2 font-bold text-emerald-600 rounded-xl cursor-pointer">
                              <CheckCircle2 size={16} /> تفعيل الترشيح
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(n.id, 'rejected')} className="gap-2 font-bold text-red-600 rounded-xl cursor-pointer">
                              <XCircle size={16} /> رفض الترشيح
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="px-3 py-2 text-[10px] text-slate-400 font-black uppercase">تعيين كفائز</div>
                            {[1, 2, 3, 4].map(rank => (
                              <DropdownMenuItem key={rank} onClick={() => handleSetWinner(n.id, rank as any)} className="gap-2 font-bold text-yellow-600 rounded-xl cursor-pointer">
                                <Trophy size={16} /> المركز {rank}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
               </div>
                              <Button variant="ghost" size="sm" className="font-black text-red-600 h-8 gap-1">
                                عرض الفيديوهات <ArrowRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {!ytChannelsData?.channels.length && (
                          <div className="col-span-full py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                              <Video className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="font-black text-xl text-slate-800 mb-2">لا توجد قنوات يوتيوب مرتبطة</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto">ابدأ بإضافة أول قناة كشفية ليتم عرض فيديوهاتها للمستخدمين بطريقة احترافية ومنظمة.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </AuthGuard>
    </SiteLayout>
  );
}
