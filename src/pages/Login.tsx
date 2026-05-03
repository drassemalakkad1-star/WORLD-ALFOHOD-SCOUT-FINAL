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
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-24 py-12 order-2 md:order-1">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto space-y-8"
        >
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center justify-center gap-2 text-primary hover:opacity-90 mb-6">
              <PawPrint className="h-10 w-10 text-secondary" strokeWidth={2.5} />
              <span className="font-black text-3xl tracking-tight">عالم الفهود</span>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">أهلاً بعودتك</h1>
            <p className="text-muted-foreground">سجّل دخولك إلى عالم الفهود لمتابعة رحلتك</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" className="h-12 rounded-xl focus-visible:ring-secondary" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                          className="h-12 rounded-xl focus-visible:ring-secondary pl-10" 
                          dir="ltr"
                          {...field} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 space-x-reverse">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium cursor-pointer">
                          تذكرني
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <Link href="/forgot-password" className="text-sm font-semibold text-secondary hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 text-base font-bold bg-secondary text-white hover:bg-secondary/90 rounded-xl"
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "تسجيل الدخول"}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                أو تابع باستخدام
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

          <p className="text-center text-sm text-muted-foreground mt-8">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="font-semibold text-secondary hover:underline">
              أنشئ حساباً
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Image Side */}
      <div className="hidden md:block flex-1 relative order-1 md:order-2 h-64 md:h-auto">
        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent z-20" />
        <img
          src={loginHeroImg}
          alt="عالم الفهود"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-12 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black leading-tight max-w-xl text-balance drop-shadow-lg">
            "كن جزءاً من حركة عالمية تصنع التغيير"
          </h2>
          <p className="absolute bottom-8 text-sm font-medium text-white/80">
            © {new Date().getFullYear()} عالم الفهود الكشفي والإرشادي
          </p>
        </div>
      </div>
    </div>
  );
}
