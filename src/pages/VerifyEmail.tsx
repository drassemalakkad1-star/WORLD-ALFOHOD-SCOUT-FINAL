import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { PawPrint, Mail, ArrowRight, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";

import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsVerifying(false);
    setLocation("/account");
  };

  return (
    <SiteLayout>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card border border-border shadow-xl rounded-2xl p-8 relative z-10 text-center space-y-8"
        >
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">تحقق من بريدك الإلكتروني</h1>
            <p className="text-muted-foreground text-sm">
              لقد أرسلنا رابط التحقق إلى بريدك الإلكتروني. يرجى النقر على الرابط لتفعيل حسابك.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full h-12 text-base font-bold bg-secondary text-white hover:bg-secondary/90 rounded-xl"
            >
              {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "تم التحقق — متابعة"}
            </Button>
            
            <Button 
              variant="outline" 
              disabled={countdown > 0}
              className="w-full h-12 rounded-xl"
              onClick={() => setCountdown(60)}
            >
              {countdown > 0 ? `أرسل مرة أخرى (${countdown})` : "أرسل مرة أخرى"}
            </Button>
          </div>
        </motion.div>
      </div>
    </SiteLayout>
  );
}
