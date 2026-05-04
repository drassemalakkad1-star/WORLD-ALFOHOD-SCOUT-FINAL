import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "الاسم مطلوب" }),
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
  phone: z.string().min(8, { message: "رقم الهاتف مطلوب" }),
  country: z.string().min(1, { message: "يرجى اختيار البلد" }),
});

interface JoinFormProps {
  role: string;
}

export function JoinForm({ role }: JoinFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      country: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await apiRequest("POST", "/api/contact", {
        ...values,
        subject: `طلب انضمام: ${role}`,
        message: `طلب انضمام جديد لدور: ${role}. الاسم: ${values.name}, الهاتف: ${values.phone}`
      });
      toast({
        title: "تم استلام طلبك",
        description: "سيقوم فريقنا بالتواصل معك قريباً لإكمال عملية التسجيل.",
      });
      form.reset();
    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.",
        variant: "destructive"
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم الكامل</FormLabel>
              <FormControl>
                <Input placeholder="أدخل اسمك" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>البريد الإلكتروني</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل بريدك الإلكتروني" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل رقم هاتفك" {...field} />
                </FormControl>
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
                  <SelectTrigger>
                    <SelectValue placeholder="اختر بلدك" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sa">السعودية</SelectItem>
                  <SelectItem value="ae">الإمارات</SelectItem>
                  <SelectItem value="eg">مصر</SelectItem>
                  <SelectItem value="jo">الأردن</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-14 text-lg font-bold rounded-full">إرسال الطلب</Button>
      </form>
    </Form>
  );
}
