import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { PawPrint, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const forgotSchema = z.object({
  email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
});

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof forgotSchema>) {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitted(true);
    setIsLoading(false);
  }

  return (
    <SiteLayout>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card border border-border shadow-xl rounded-2xl p-8 relative z-10"
        >
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl font-bold text-foreground">استعادة كلمة المرور</h1>
            <p className="text-muted-foreground text-sm">
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
            </p>
          </div>

          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">تحقق من بريدك</h3>
                <p className="text-muted-foreground text-sm">
                  إذا كان البريد مسجلاً، أرسلنا لك رابط إعادة التعيين.
                </p>
              </div>
              <Button asChild className="w-full h-12 bg-secondary text-white hover:bg-secondary/90 rounded-xl">
                <Link href="/login">العودة لتسجيل الدخول</Link>
              </Button>
            </motion.div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                
                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 text-base font-bold bg-secondary text-white hover:bg-secondary/90 rounded-xl"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "إرسال الرابط"}
                  </Button>
                  
                  <Button asChild variant="ghost" className="w-full h-12 rounded-xl text-primary hover:text-primary/80">
                    <Link href="/login" className="flex items-center justify-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      <span>العودة لتسجيل الدخول</span>
                    </Link>
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </motion.div>
      </div>
    </SiteLayout>
  );
}
