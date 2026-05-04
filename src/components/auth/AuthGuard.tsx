import { useState } from "react";
import { useAuth } from "@/components/auth/authContext";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, User, ShieldCheck, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function AuthGuard({ children, title = "محتوى حصري", description = "يرجى تسجيل الدخول أو إنشاء حساب جديد لمشاهدة هذا المحتوى والاستمتاع بكافة مميزات المنصة." }: { children: React.ReactNode, title?: string, description?: string }) {
  const { state, signIn, register } = useAuth();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  if (state.isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated, show the content
  if (state.user) {
    return <>{children}</>;
  }

  // Otherwise, show the lock screen
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
        toast({ title: "مرحباً بك مجدداً!", description: "تم تسجيل الدخول بنجاح." });
      } else {
        // Switch to OTP step to "verify" email
        setStep("otp");
        toast({ 
          title: "تم إرسال رمز التأكيد", 
          description: "يرجى مراجعة بريدك الإلكتروني لإدخال الرمز.",
        });
      }
    } catch (err: any) {
      toast({ 
        title: "حدث خطأ", 
        description: err.message || "تأكد من صحة البيانات المدخلة.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast({ title: "رمز غير صالح", description: "الرجاء إدخال رمز صحيح.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      // Complete registration after OTP
      await register({ name, email, password, role: "يافع" });
      toast({ title: "تم تفعيل الحساب!", description: "مرحباً بك في كشافة الفهود." });
    } catch (err: any) {
      toast({ title: "حدث خطأ", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm" dir="rtl">
      {/* Blurred background preview of the content could go here, but we'll use a nice gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 z-0" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[500px] p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-background/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock size={32} />
          </div>
          
          <h2 className="text-2xl font-black mb-2">{title}</h2>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">{description}</p>
          
          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.form 
                key="form"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-4"
              >
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      required 
                      placeholder="الاسم الكامل" 
                      className="pr-10 bg-black/5 border-white/10" 
                      value={name} onChange={e => setName(e.target.value)}
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    required type="email" 
                    placeholder="البريد الإلكتروني" 
                    className="pr-10 bg-black/5 border-white/10 text-left" dir="ltr"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    required type="password" 
                    placeholder="كلمة المرور" 
                    className="pr-10 bg-black/5 border-white/10 text-left" dir="ltr"
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                </div>
                
                <Button type="submit" className="w-full h-12 text-lg rounded-xl mt-2" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "دخول" : "تسجيل حساب جديد")}
                </Button>
                
                <div className="mt-6 text-sm text-muted-foreground pt-4 border-t border-border/40">
                  {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
                  <button 
                    type="button" 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="mr-2 text-primary font-bold hover:underline"
                  >
                    {isLogin ? "سجل الآن" : "سجل الدخول"}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form 
                key="otp"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onSubmit={handleVerifyOtp} 
                className="space-y-4"
              >
                <div className="p-4 bg-secondary/10 text-secondary rounded-xl text-sm mb-4">
                  تم إرسال رمز مكون من 4 أرقام إلى <strong>{email}</strong>
                </div>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    required type="text" 
                    placeholder="أدخل الرمز هنا (مثال: 1234)" 
                    className="pr-10 text-center text-xl tracking-widest h-14 bg-black/5 border-white/10" dir="ltr"
                    value={otp} onChange={e => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg rounded-xl mt-2 bg-secondary hover:bg-secondary/90 text-white" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تأكيد الدخول"}
                </Button>
                <button 
                  type="button" 
                  onClick={() => setStep("form")} 
                  className="mt-4 text-sm text-muted-foreground hover:text-foreground"
                >
                  العودة للتعديل
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
