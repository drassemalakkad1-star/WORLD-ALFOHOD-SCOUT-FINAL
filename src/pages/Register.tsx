import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { PawPrint, Eye, EyeOff, Loader2 } from "lucide-react";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";

import { useAuth, UserRole } from "@/components/auth/authContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const registerSchema = z.object({
  name: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" }),
  email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
  confirmPassword: z.string(),
  role: z.string().min(1, { message: "يرجى اختيار صفتك" }),
  country: z.string().min(1, { message: "يرجى اختيار بلدك" }),
  agree: z.boolean().refine(val => val === true, { message: "يجب الموافقة على الشروط" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

const generateColor = (email: string) => {
  const colors = [
    "hsl(282, 100%, 22%)", // Primary
    "hsl(191, 100%, 35%)", // Secondary
    "hsl(37, 91%, 61%)", // Accent
    "hsl(282, 50%, 50%)", 
    "hsl(191, 50%, 50%)",
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      country: "",
      agree: false,
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        country: values.country,
      });
      setLocation("/verify-email");
    } catch (error: any) {
      const msg = error?.message || "";
      const isDup = msg.toLowerCase().includes("exist") || msg.includes("مسجل");
      toast({
        variant: "destructive",
        title: isDup ? "البريد مسجل مسبقاً" : "تعذّر إنشاء الحساب",
        description: isDup
          ? "هذا البريد مستخدم بالفعل. يرجى تسجيل الدخول."
          : msg || "حدث خطأ غير متوقع، حاول مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSocialLogin = (provider: string) => {
    toast({ description: `قريباً: التسجيل عبر ${provider}` });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="hidden md:block flex-1 relative order-1 md:order-2 h-64 md:h-auto">
        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent z-20" />
        <img loading="lazy" decoding="async" 
          src="/src/assets/images/jamboree.webp" 
          alt="عالم الفهود" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-12 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black leading-tight max-w-xl text-balance drop-shadow-lg">
            "ابدأ رحلتك معنا اليوم"
          </h2>
          <p className="absolute bottom-8 text-sm font-medium text-white/80">
            © {new Date().getFullYear()} عالم الفهود الكشفي والإرشادي
          </p>
        </div>
      </div>

      <div className="flex-[1.5] flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-24 py-12 order-2 md:order-1 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg mx-auto space-y-8"
        >
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center justify-center gap-2 text-primary hover:opacity-90 mb-4">
              <PawPrint className="h-8 w-8 text-secondary" strokeWidth={2.5} />
              <span className="font-black text-2xl tracking-tight">عالم الفهود</span>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">انضم إلى الفهود</h1>
            <p className="text-muted-foreground">سجل حسابك للوصول إلى كافة الخدمات والمميزات</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input placeholder="الاسم" className="h-12 rounded-xl" {...field} />
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
                        <Input placeholder="name@example.com" className="h-12 rounded-xl" dir="ltr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            className="h-12 rounded-xl pl-10" 
                            dir="ltr"
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تأكيد كلمة المرور</FormLabel>
                      <FormControl>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          className="h-12 rounded-xl" 
                          dir="ltr"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>صفتك</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="اختر صفتك" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="يافع">يافع (أقل من 18)</SelectItem>
                          <SelectItem value="قائد">قائد أو جوال</SelectItem>
                          <SelectItem value="متطوع">متطوع عام</SelectItem>
                          <SelectItem value="شريك">شريك أو راعي</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          <SelectItem value="dz">الجزائر</SelectItem>
                          <SelectItem value="ma">المغرب</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="agree"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 space-x-reverse pt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-relaxed">
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        أوافق على <Link href="/terms" className="text-secondary hover:underline">شروط الخدمة</Link> و <Link href="/privacy" className="text-secondary hover:underline">سياسة الخصوصية</Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 text-base font-bold bg-secondary text-white hover:bg-secondary/90 rounded-xl mt-4"
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "إنشاء حساب"}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                أو سجل باستخدام
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" type="button" className="h-12 rounded-xl hover:bg-muted/50" onClick={() => handleSocialLogin("Google")}>
              <FaGoogle className="h-5 w-5 text-[#DB4437]" />
            </Button>
            <Button variant="outline" type="button" className="h-12 rounded-xl hover:bg-muted/50" onClick={() => handleSocialLogin("Apple")}>
              <FaApple className="h-6 w-6 text-black dark:text-white" />
            </Button>
            <Button variant="outline" type="button" className="h-12 rounded-xl hover:bg-muted/50" onClick={() => handleSocialLogin("Facebook")}>
              <FaFacebook className="h-5 w-5 text-[#4267B2]" />
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-semibold text-secondary hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
