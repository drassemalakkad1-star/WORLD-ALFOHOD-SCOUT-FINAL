import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const formSchema = z.object({
  amount: z.coerce.number().min(1, { message: "يرجى إدخال مبلغ التبرع" }),
  type: z.enum(["one-time", "monthly"]),
  name: z.string().min(2, { message: "الاسم مطلوب" }),
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
});

export function DonationForm() {
  const { toast } = useToast();
  const [presetAmounts] = useState([25, 50, 100, 250]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      amount: 50,
      type: "one-time",
      name: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "شكراً لتبرعك!",
      description: "تمت معالجة تبرعك بنجاح. أثرك سيصنع فرقاً حقيقياً.",
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-3xl shadow-xl">
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-0 flex rounded-full bg-muted/50 p-1">
              <FormControl>
                <div className="flex w-full">
                  <Button
                    type="button"
                    variant={field.value === "one-time" ? "default" : "ghost"}
                    className={`flex-1 rounded-full font-bold ${field.value === "one-time" ? "bg-primary text-white" : "text-muted-foreground"}`}
                    onClick={() => field.onChange("one-time")}
                  >
                    لمرة واحدة
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "monthly" ? "default" : "ghost"}
                    className={`flex-1 rounded-full font-bold ${field.value === "monthly" ? "bg-primary text-white" : "text-muted-foreground"}`}
                    onClick={() => field.onChange("monthly")}
                  >
                    شهرياً
                  </Button>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {presetAmounts.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant={form.watch("amount") === amount ? "default" : "outline"}
                className={`font-bold text-lg h-14 rounded-2xl ${form.watch("amount") === amount ? "border-primary bg-primary text-white" : "border-border text-primary hover:border-primary/50"}`}
                onClick={() => form.setValue("amount", amount)}
              >
                ${amount}
              </Button>
            ))}
          </div>
          
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                    <Input 
                      type="number" 
                      placeholder="مبلغ آخر" 
                      className="pl-10 h-14 text-lg font-bold rounded-2xl" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="الاسم الكامل" className="h-14 rounded-2xl" {...field} />
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
                <FormControl>
                  <Input placeholder="البريد الإلكتروني" className="h-14 rounded-2xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full h-16 text-xl font-bold rounded-full bg-secondary hover:bg-secondary/90 text-white">
          تبرع الآن
        </Button>
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-bold">
          <Lock className="h-4 w-4" />
          معاملة آمنة ومشفرة
        </div>
      </form>
    </Form>
  );
}
