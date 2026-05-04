import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { 
  Heart, ShoppingBag, Info, ArrowRight, 
  HandHeart, Package, Users, ClipboardList,
  CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SOLIDARITY_INVENTORY = [
  {
    id: "white-cane",
    name: "العصا البيضاء للمكفوفين",
    category: "إعاقة بصرية",
    description: "عصا كربونية خفيفة الوزن وقابلة للطي، تدعم استقلالية المكفوفين.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dad99901?auto=format&fit=crop&q=80&w=400",
    stock: 12,
    priority: "عالية"
  },
  {
    id: "wheelchair-manual",
    name: "كرسي متحرك يدوي",
    category: "إعاقة حركية",
    description: "كرسي طبي مريح بوزن خفيف وتصميم متين لسهولة التنقل.",
    image: "https://images.unsplash.com/photo-1598252976330-b8a1461d47a7?auto=format&fit=crop&q=80&w=400",
    stock: 5,
    priority: "متوسطة"
  },
  {
    id: "medical-mattress",
    name: "مرتبة طبية هوائية",
    category: "إعاقة حركية",
    description: "مرتبة متطورة للوقاية من تقرحات الفراش للمرضى الملازمين للسرير.",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400",
    stock: 8,
    priority: "عالية"
  },
  {
    id: "hearing-aid",
    name: "سماعة طبية رقمية",
    category: "إعاقة سمعية",
    description: "سماعة ذكية بفلترة للضجيج لتعزيز التواصل لدى ضعاف السمع.",
    image: "https://images.unsplash.com/photo-1594494818244-a01bd55a819c?auto=format&fit=crop&q=80&w=400",
    stock: 15,
    priority: "عالية"
  },
  {
    id: "braille-kit",
    name: "حقيبة برايل التعليمية",
    category: "إعاقة بصرية",
    description: "مجموعة أدوات تعليمية للقراءة والكتابة بطريقة برايل للمبتدئين.",
    image: "https://images.unsplash.com/photo-1576089172869-4f5f6f315620?auto=format&fit=crop&q=80&w=400",
    stock: 20,
    priority: "متوسطة"
  },
  {
    id: "walker-pediatric",
    name: "مشاية أطفال متخصصة",
    category: "إعاقة حركية",
    description: "مشاية لدعم الوقوف والمشي المبكر للأطفال ذوي التحديات الحركية.",
    image: "https://images.unsplash.com/photo-1590233649601-e2333010375d?auto=format&fit=crop&q=80&w=400",
    stock: 3,
    priority: "عالية"
  }
];

export default function SolidarityStore() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { toast } = useToast();

  const requestMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/support-requests", data);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "تم استلام طلبك",
        description: "سيتم التواصل معك من قبل فريق التكافل الكشفي قريباً.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/support-requests"] });
    },
    onError: () => {
      toast({
        title: "عذراً",
        description: "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.",
        variant: "destructive",
      });
    }
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-slate-50 pb-24" dir="rtl">
        {/* Solidarity Hero */}
        <section className="relative py-24 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="container relative z-10 px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm px-6 py-2 text-lg">
                متجر التكافل والمساندة
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                كشافة من أجل <span className="text-emerald-300">الإنسانية</span>
              </h1>
              <p className="text-xl md:text-2xl text-emerald-50/90 max-w-3xl mx-auto leading-relaxed font-medium">
                جسد واحد وقلب واحد. نوفر المستلزمات الطبية والتعويضية بالمجان أو عبر التبرع العيني لدعم ذوي الاحتياجات الخاصة.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-12">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 text-xl px-10 h-16 font-black rounded-2xl shadow-xl shadow-emerald-900/20">
                  <HandHeart className="ml-3 w-6 h-6" /> تبرع عيني
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white/40 hover:bg-white/10 text-xl px-10 h-16 font-black rounded-2xl">
                  <ClipboardList className="ml-3 w-6 h-6" /> طلب مساعدة
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container px-4 py-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-800">المخزون العيني المتوفر</h2>
              <p className="text-slate-500 max-w-xl">
                يتم تحديث هذه القائمة دورياً بناءً على التبرعات الواردة والمخزون المتاح في المستودع الكشفي.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-sm border">
                <Package className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-700">إجمالي القطع: 73</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-sm border">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-700">المستفيدين: 1,240+</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SOLIDARITY_INVENTORY.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full group hover:shadow-2xl transition-all duration-500 border-none overflow-hidden ring-1 ring-slate-200">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={item.priority === 'عالية' ? 'bg-red-500' : 'bg-orange-500'}>
                        أولوية {item.priority}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                        {item.category}
                      </Badge>
                      <span className="text-xs font-bold text-slate-400">مخزون: {item.stock}</span>
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-800">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {item.description}
                    </p>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 border-t p-6 gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-600/20">
                          طلب هذه القطعة
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md" dir="rtl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black text-emerald-700">طلب مساعدة عينية</DialogTitle>
                          <DialogHeader>
                            <DialogDescription className="text-slate-500">
                              يرجى تعبئة البيانات التالية لطلب {item.name}. سيتم مراجعة الطلب من قبل اللجنة المختصة.
                            </DialogDescription>
                          </DialogHeader>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          requestMutation.mutate({
                            item: item.name,
                            fullName: formData.get('name'),
                            email: formData.get('email'),
                            phone: formData.get('phone'),
                            message: formData.get('reason'),
                            type: 'support',
                            category: item.category
                          });
                        }} className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">الاسم الكامل</Label>
                            <Input id="name" name="name" placeholder="ادخل اسمك الرباعي" required className="rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input id="email" name="email" type="email" placeholder="example@domain.com" required className="rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">رقم التواصل (واتساب)</Label>
                            <Input id="phone" name="phone" placeholder="05xxxxxxxx" required className="rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reason">شرح الحالة</Label>
                            <Textarea id="reason" name="reason" placeholder="يرجى ذكر سبب الاحتياج بإيجاز..." required className="rounded-xl min-h-[100px]" />
                          </div>
                          <Button type="submit" disabled={requestMutation.isPending} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700">
                            {requestMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إرسال الطلب الآن'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-200">
                      <Info className="w-5 h-5 text-slate-400" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Donation Banner */}
        <section className="container px-4 py-12">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-black leading-tight">لديك أداة طبية لا تحتاجها؟</h2>
                <p className="text-xl text-blue-50/80 leading-relaxed">
                  تبرعك بالعصا البيضاء، الكرسي المتحرك، أو أي جهاز تعويضي قد يغير حياة شخص آخر تماماً. نحن نضمن وصول تبرعك لمن يستحقه.
                </p>
                <div className="flex gap-4">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-black h-14 px-8 rounded-xl shadow-xl shadow-blue-900/20">
                    سجل تبرعك العيني
                  </Button>
                  <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 font-bold">
                    كيف يعمل النظام؟ <ArrowRight className="mr-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="w-72 h-72 rounded-full border-8 border-white/20 flex items-center justify-center p-8">
                  <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                     <HandHeart className="w-24 h-24 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
