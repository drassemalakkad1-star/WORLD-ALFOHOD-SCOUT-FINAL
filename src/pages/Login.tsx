import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { PawPrint, Eye, EyeOff, Loader2 } from "lucide-react";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import loginHeroImg from "@/assets/images/hero.webp";

import { useAuth } from "@/components/auth/authContext";
import { useToast } from "@/hooks/use-toast";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
  remember: z.boolean().default(false),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      await signIn(values.email, values.password);
      setLocation("/account");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل تسجيل الدخول",
        description: error?.message || "بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSocialLogin = (provider: string) => {
    toast({
      description: `قريباً: تسجيل الدخول عبر ${provider}`,
    });
  };

  return (
    <SiteLayout>
      <div className="min-h-screen w-full flex items-center justify-center bg-[#622181] relative overflow-hidden px-4 py-20" dir="rtl">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c13.8 0 25 11.2 25 25S43.8 55 30 55 5 43.8 5 30 16.2 5 30 5zm0 5c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md flex flex-col items-center"
        >
          {/* Logo Section removed since it's in Header now, or kept if design dictates */}
          
          {/* Login Box */}
          <div className="w-full space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-sm font-black text-white/90 uppercase tracking-widest">تسجيل الدخول</h2>
              <p className="text-white/60 text-xs">أهلاً بك مجدداً، أيها الفهد! قم بتسجيل الدخول إلى حسابك أدناه.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormControl>
                        <Input 
                          placeholder="البريد الإلكتروني أو اسم المستخدم" 
                          className="h-12 bg-white border-none rounded-none text-black placeholder:text-muted-foreground/60 text-sm focus-visible:ring-2 focus-visible:ring-black" 
                          dir="rtl" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-300 text-xs font-bold" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="كلمة المرور"
                            className="h-12 bg-white border-none rounded-none text-black placeholder:text-muted-foreground/60 text-sm focus-visible:ring-2 focus-visible:ring-black" 
                            dir="rtl"
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300 text-xs font-bold" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-1">
                  <Link href="/forgot-password" title="FORGOT PASSWORD?" className="text-[10px] font-black text-white/70 hover:text-white uppercase tracking-wider">
                    نسيت كلمة المرور؟
                  </Link>
                  <div className="h-3 w-[1px] bg-white/20" />
                  <Link href="/register" title="REGISTER" className="text-[10px] font-black text-white/70 hover:text-white uppercase tracking-wider">
                    عضو جديد؟ تسجيل
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 text-sm font-black bg-[#00b74f] text-white hover:bg-[#00a346] rounded-none shadow-lg shadow-black/20 uppercase tracking-widest mt-6"
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "تسجيل الدخول"}
                </Button>
              </form>
            </Form>

            {/* Social Logins */}
            <div className="pt-8 space-y-6">
              <div className="text-center">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">أو استخدم التسجيل الاجتماعي</span>
              </div>

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full h-11 bg-black text-white border-none rounded-none flex items-center justify-center gap-3 hover:bg-black/80 transition-all"
                  onClick={() => handleSocialLogin("Apple")}
                >
                  <FaApple className="h-5 w-5" />
                  <span className="text-xs font-bold">Log in with Apple</span>
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full h-11 bg-white text-black border-none rounded-none flex items-center justify-center gap-3 hover:bg-white/90 transition-all"
                  onClick={() => handleSocialLogin("Google")}
                >
                  <FaGoogle className="h-4 w-4 text-[#DB4437]" />
                  <span className="text-xs font-bold">Log in with Google</span>
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full h-11 bg-[#1877F2] text-white border-none rounded-none flex items-center justify-center gap-3 hover:bg-[#166fe5] transition-all"
                  onClick={() => handleSocialLogin("Facebook")}
                >
                  <FaFacebook className="h-5 w-5" />
                  <span className="text-xs font-bold">Log in with Facebook</span>
                </Button>
              </div>
            </div>

            {/* Footer Branding */}
            <div className="pt-12 text-center space-y-4">
              <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                <h3 className="text-xs font-black text-white mb-2 uppercase tracking-wider">لماذا تسجيل الدخول؟</h3>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  يمنحك حساب عالم الفهود إمكانية الوصول إلى جميع الخدمات الرقمية، بما في ذلك الأكاديمية الكشفية، المتجر، والمكتبة الرقمية، مع الحفاظ على تقدمك وإنجازاتك في رحلتك الكشفية.
                </p>
              </div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                © {new Date().getFullYear()} WORLD ALFOHOD SCOUTING
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </SiteLayout>
  );
}
