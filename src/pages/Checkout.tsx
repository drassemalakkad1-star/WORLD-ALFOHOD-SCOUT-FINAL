import { useState, useEffect, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useCart } from "@/components/store/cartContext";
import { useAuth } from "@/components/auth/authContext";
import { OrderSummary } from "@/components/store/OrderSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PawPrint, Lock, ChevronRight, CheckCircle2, CreditCard, Landmark, Truck, Wallet, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/store/ProductCard";

// Validation Schemas
const shippingSchema = z.object({
  fullName: z.string().min(3, "الاسم الكامل يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().regex(/^[0-9+\-\s()]{8,15}$/, "رقم الهاتف غير صالح"),
  country: z.string().min(1, "يرجى اختيار الدولة"),
  city: z.string().min(2, "اسم المدينة مطلوب"),
  address: z.string().min(5, "العنوان التفصيلي مطلوب"),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
  saveAddress: z.boolean().optional().default(false),
});

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^[\d\s]{15,19}$/, "رقم البطاقة غير صالح"),
  cardName: z.string().min(3, "اسم حامل البطاقة مطلوب"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "تاريخ الانتهاء غير صالح (MM/YY)"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV غير صالح"),
  billingSameAsShipping: z.boolean().default(true),
  billingAddress: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, "يجب الموافقة على الشروط والأحكام"),
  newsletter: z.boolean().optional().default(false),
});

type ShippingData = z.infer<typeof shippingSchema>;
type PaymentData = z.infer<typeof paymentSchema>;

// Shell Component
function CheckoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground selection:bg-secondary selection:text-white" dir="rtl">
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/store" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold">
              <ArrowRight className="h-4 w-4" />
              عودة إلى المتجر
            </Link>
          </div>
          <Link href="/" className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-2 text-primary hover:opacity-90 transition-opacity">
            <PawPrint className="h-8 w-8 text-secondary" strokeWidth={2.5} />
            <span className="font-black text-2xl tracking-tight hidden sm:block">عالم الفهود</span>
          </Link>
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold">
            <ShieldCheck className="h-5 w-5 text-secondary" />
            <span className="hidden sm:block">دفع آمن مشفر</span>
          </div>
        </div>
      </header>
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}

// Stepper Component
function Stepper({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: "الشحن" },
    { num: 2, label: "الدفع" },
    { num: 3, label: "التأكيد" },
  ];

  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, index) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2
                ${currentStep > step.num 
                  ? "bg-accent border-accent text-accent-foreground" 
                  : currentStep === step.num 
                    ? "bg-secondary border-secondary text-white" 
                    : "bg-muted border-muted text-muted-foreground"
                }
              `}
            >
              {currentStep > step.num ? <CheckCircle2 className="h-5 w-5" /> : step.num}
            </div>
            <span className={`text-sm font-bold absolute -bottom-6 whitespace-nowrap
              ${currentStep === step.num ? "text-primary" : "text-muted-foreground"}
            `}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-1 w-16 sm:w-24 md:w-32 transition-colors mx-2 rounded-full
              ${currentStep > step.num ? "bg-accent" : "bg-muted"}
            `} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { state: cartState, total, dispatch: cartDispatch } = useCart();
  const { state: authState } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  
  const [shippingCost, setShippingCost] = useState(5.00);
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalOrder, setFinalOrder] = useState<any>(null);

  // Load draft from session storage on mount
  useEffect(() => {
    const draft = sessionStorage.getItem("cheetahs_checkout_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.step) setCurrentStep(parsed.step);
        if (parsed.shippingMethod) {
          setShippingMethod(parsed.shippingMethod);
          updateShippingCost(parsed.shippingMethod);
        }
        if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
        if (parsed.appliedCode) {
          setAppliedCode(parsed.appliedCode);
          setDiscount(parsed.discount || 0);
        }
      } catch (e) {}
    }
  }, []);

  // Save draft when things change
  useEffect(() => {
    if (currentStep < 3) {
      sessionStorage.setItem("cheetahs_checkout_draft", JSON.stringify({
        step: currentStep,
        shippingMethod,
        paymentMethod,
        appliedCode,
        discount
      }));
    }
  }, [currentStep, shippingMethod, paymentMethod, appliedCode, discount]);

  // Check if cart is empty
  useEffect(() => {
    if (cartState.items.length === 0 && currentStep !== 3) {
      toast({ title: "السلة فارغة", description: "أضف منتجات إلى السلة للمتابعة." });
      setLocation("/store");
    }
  }, [cartState.items.length, currentStep, setLocation, toast]);

  const shippingForm = useForm<ShippingData>({
    resolver: zodResolver(shippingSchema) as any,
    defaultValues: {
      fullName: authState.user?.name || "",
      email: authState.user?.email || "",
      phone: "",
      country: "",
      city: "",
      address: "",
      zipCode: "",
      notes: "",
      saveAddress: false,
    }
  });

  const paymentForm = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      cardNumber: "",
      cardName: "",
      expiry: "",
      cvv: "",
      billingSameAsShipping: true,
      billingAddress: "",
      termsAccepted: false,
      newsletter: false,
    }
  });

  const updateShippingCost = (method: string) => {
    if (appliedCode === "FREESHIP") {
      setShippingCost(0);
      return;
    }
    if (method === "standard") setShippingCost(5.00);
    else if (method === "express") setShippingCost(12.00);
    else if (method === "pickup") setShippingCost(0.00);
  };

  const onShippingMethodChange = (val: string) => {
    setShippingMethod(val);
    updateShippingCost(val);
  };

  const handleApplyPromoCode = (code: string, calculatedDiscount: number) => {
    setAppliedCode(code);
    if (code === "FREESHIP") {
      setDiscount(0);
      setShippingCost(0);
    } else {
      setDiscount(calculatedDiscount);
      updateShippingCost(shippingMethod);
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedCode(null);
    setDiscount(0);
    updateShippingCost(shippingMethod);
  };

  const onShippingSubmit = (data: ShippingData) => {
    sessionStorage.setItem("cheetahs_checkout_shipping", JSON.stringify(data));
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onPaymentSubmit = async (data: PaymentData) => {
    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1600));
    
    const orderNumber = "CHT-" + Math.floor(100000 + Math.random() * 900000);
    const shippingData = JSON.parse(sessionStorage.getItem("cheetahs_checkout_shipping") || "{}");
    
    const finalVat = (total - discount) * 0.05;
    const finalTotal = total + shippingCost - discount + finalVat;

    const orderPayload = {
      id: orderNumber,
      date: new Date().toISOString(),
      items: cartState.items,
      subtotal: total,
      shipping: shippingCost,
      discount,
      vat: finalVat,
      total: finalTotal,
      shippingMethod,
      paymentMethod,
      shippingAddress: shippingData,
      status: "قيد المعالجة"
    };

    // Save final order
    sessionStorage.setItem("cheetahs_last_order", JSON.stringify(orderPayload));
    
    // Save to order history if user might want it
    try {
      const storedOrders = localStorage.getItem("cheetahs_orders");
      const orders = storedOrders ? JSON.parse(storedOrders) : [];
      orders.unshift(orderPayload);
      localStorage.setItem("cheetahs_orders", JSON.stringify(orders));
    } catch(e) {}

    // Clear drafts and cart
    sessionStorage.removeItem("cheetahs_checkout_draft");
    sessionStorage.removeItem("cheetahs_checkout_shipping");
    cartDispatch({ type: "CLEAR_CART" });
    
    setFinalOrder(orderPayload);
    setIsProcessing(false);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Card formatting
  const formatCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += ' ';
      formattedValue += value[i];
    }
    paymentForm.setValue('cardNumber', formattedValue.substring(0, 19));
  };

  const formatExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    paymentForm.setValue('expiry', value.substring(0, 5));
  };

  const getCardBrandIcon = (number: string) => {
    if (number.startsWith('4')) return "Visa";
    if (number.startsWith('5')) return "Mastercard";
    if (number.startsWith('3')) return "Amex";
    return "Card";
  };

  // Random recommendations
  const recommendations = useMemo(() => {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, []);

  if (cartState.items.length === 0 && currentStep !== 3) {
    return null; // Will redirect
  }

  return (
    <CheckoutShell>
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-black text-primary">جارٍ معالجة دفعتك...</h2>
          <p className="text-muted-foreground mt-2">يرجى الانتظار، لا تقم بإغلاق هذه الصفحة.</p>
        </div>
      )}

      <Stepper currentStep={currentStep} />

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
          >
            <div className="lg:col-span-7 xl:col-span-8 space-y-8 order-2 lg:order-1">
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-primary">معلومات الشحن</h2>
                  {authState.user ? (
                    <div className="text-sm font-semibold bg-primary/5 text-primary px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/10">
                      مسجل الدخول كـ {authState.user.name.split(' ')[0]}
                      <Link href="/account" className="underline text-secondary ml-2">تغيير الحساب</Link>
                    </div>
                  ) : (
                    <div className="text-sm font-semibold bg-muted px-4 py-2 rounded-xl flex items-center gap-3">
                      هل لديك حساب؟
                      <Link href="/login" className="text-secondary hover:underline">سجّل الدخول</Link>
                    </div>
                  )}
                </div>

                <form id="shipping-form" onSubmit={shippingForm.handleSubmit(onShippingSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="font-bold text-primary">الاسم الكامل *</Label>
                      <Input id="fullName" placeholder="الاسم الكامل" className="h-12 rounded-xl" {...shippingForm.register("fullName")} />
                      {shippingForm.formState.errors.fullName && <p className="text-sm text-destructive font-semibold">{shippingForm.formState.errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-bold text-primary">البريد الإلكتروني *</Label>
                      <Input id="email" type="email" placeholder="البريد الإلكتروني" className="h-12 rounded-xl" {...shippingForm.register("email")} />
                      {shippingForm.formState.errors.email && <p className="text-sm text-destructive font-semibold">{shippingForm.formState.errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-bold text-primary">رقم الهاتف *</Label>
                      <Input id="phone" type="tel" placeholder="رقم الهاتف" className="h-12 rounded-xl text-left" dir="ltr" {...shippingForm.register("phone")} />
                      {shippingForm.formState.errors.phone && <p className="text-sm text-destructive font-semibold">{shippingForm.formState.errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-primary">الدولة *</Label>
                      <Controller
                        control={shippingForm.control}
                        name="country"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                            <SelectTrigger className="h-12 rounded-xl bg-white">
                              <SelectValue placeholder="اختر الدولة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sa">السعودية</SelectItem>
                              <SelectItem value="ae">الإمارات العربية المتحدة</SelectItem>
                              <SelectItem value="kw">الكويت</SelectItem>
                              <SelectItem value="qa">الكويت</SelectItem>
                              <SelectItem value="bh">البحرين</SelectItem>
                              <SelectItem value="om">عمان</SelectItem>
                              <SelectItem value="eg">مصر</SelectItem>
                              <SelectItem value="jo">الأردن</SelectItem>
                              <SelectItem value="lb">لبنان</SelectItem>
                              <SelectItem value="other">دولة أخرى</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {shippingForm.formState.errors.country && <p className="text-sm text-destructive font-semibold">{shippingForm.formState.errors.country.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address" className="font-bold text-primary">العنوان بالتفصيل *</Label>
                      <Textarea id="address" placeholder="اسم الشارع، رقم المبنى، الشقة" className="rounded-xl resize-none min-h-[100px]" {...shippingForm.register("address")} />
                      {shippingForm.formState.errors.address && <p className="text-sm text-destructive font-semibold">{shippingForm.formState.errors.address.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="font-bold text-primary">المدينة *</Label>
                      <Input id="city" placeholder="المدينة" className="h-12 rounded-xl" {...shippingForm.register("city")} />
                      {shippingForm.formState.errors.city && <p className="text-sm text-destructive font-semibold">{shippingForm.formState.errors.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="font-bold text-primary">الرمز البريدي</Label>
                      <Input id="zipCode" placeholder="الرمز البريدي (اختياري)" className="h-12 rounded-xl" {...shippingForm.register("zipCode")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="font-bold text-primary">ملاحظات للسائق</Label>
                    <Textarea id="notes" placeholder="ملاحظات لتسهيل الوصول (اختياري)" className="rounded-xl resize-none" {...shippingForm.register("notes")} />
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse pt-2">
                    <Controller
                      control={shippingForm.control}
                      name="saveAddress"
                      render={({ field }) => (
                        <Checkbox 
                          id="saveAddress" 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                          className="rounded"
                        />
                      )}
                    />
                    <Label htmlFor="saveAddress" className="font-semibold cursor-pointer">حفظ هذا العنوان لطلبات لاحقة</Label>
                  </div>
                </form>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-black text-primary mb-6">طريقة الشحن</h3>
                <RadioGroup value={shippingMethod} onValueChange={onShippingMethodChange} className="space-y-4">
                  <div className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${shippingMethod === 'standard' ? 'border-secondary ring-1 ring-secondary bg-secondary/5' : 'border-border hover:border-primary/30'}`} onClick={() => onShippingMethodChange('standard')}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="standard" id="standard" className="text-secondary border-primary/20" />
                      <div>
                        <Label htmlFor="standard" className="font-bold text-primary cursor-pointer text-base">توصيل قياسي</Label>
                        <p className="text-sm text-muted-foreground mt-1">3-5 أيام عمل</p>
                      </div>
                    </div>
                    <span className="font-bold">{appliedCode === "FREESHIP" ? "مجاناً" : "$5.00"}</span>
                  </div>

                  <div className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${shippingMethod === 'express' ? 'border-secondary ring-1 ring-secondary bg-secondary/5' : 'border-border hover:border-primary/30'}`} onClick={() => onShippingMethodChange('express')}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="express" id="express" className="text-secondary border-primary/20" />
                      <div>
                        <Label htmlFor="express" className="font-bold text-primary cursor-pointer text-base">توصيل سريع</Label>
                        <p className="text-sm text-muted-foreground mt-1">1-2 يوم عمل</p>
                      </div>
                    </div>
                    <span className="font-bold">{appliedCode === "FREESHIP" ? "مجاناً" : "$12.00"}</span>
                  </div>

                  <div className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${shippingMethod === 'pickup' ? 'border-secondary ring-1 ring-secondary bg-secondary/5' : 'border-border hover:border-primary/30'}`} onClick={() => onShippingMethodChange('pickup')}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="pickup" id="pickup" className="text-secondary border-primary/20" />
                      <div>
                        <Label htmlFor="pickup" className="font-bold text-primary cursor-pointer text-base">استلام من المتجر</Label>
                        <p className="text-sm text-muted-foreground mt-1">متاح من الغد</p>
                      </div>
                    </div>
                    <span className="font-bold text-accent">مجاناً</span>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
                <Button variant="ghost" className="font-bold text-primary hover:text-secondary order-2 sm:order-1" asChild>
                  <Link href="/store">العودة إلى السلة</Link>
                </Button>
                <Button type="submit" form="shipping-form" className="w-full sm:w-auto h-14 px-10 text-lg font-bold rounded-full bg-secondary hover:bg-secondary/90 text-white order-1 sm:order-2">
                  متابعة إلى الدفع
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
              <OrderSummary 
                items={cartState.items} 
                subtotal={total} 
                shippingCost={shippingCost} 
                discount={discount}
                onApplyPromoCode={handleApplyPromoCode}
                onRemovePromoCode={handleRemovePromoCode}
                appliedCode={appliedCode}
              />
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
          >
            <div className="lg:col-span-7 xl:col-span-8 space-y-8 order-2 lg:order-1">
              {/* Shipping Summary Strip */}
              <div className="bg-muted/30 border border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">الشحن إلى</div>
                  <div className="font-bold text-primary">
                    {JSON.parse(sessionStorage.getItem("cheetahs_checkout_shipping") || "{}").address}
                  </div>
                </div>
                <Button variant="link" onClick={() => setCurrentStep(1)} className="text-secondary font-bold">
                  تعديل
                </Button>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-black text-primary mb-8">طريقة الدفع</h2>

                <form id="payment-form" onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-8">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    
                    {/* Credit Card */}
                    <div className={`border rounded-xl transition-all overflow-hidden ${paymentMethod === 'card' ? 'border-secondary ring-1 ring-secondary bg-secondary/5' : 'border-border'}`}>
                      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setPaymentMethod('card')}>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="card" id="card" className="text-secondary border-primary/20" />
                          <Label htmlFor="card" className="font-bold text-primary cursor-pointer text-base flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary/60" />
                            بطاقة ائتمان/خصم
                          </Label>
                        </div>
                        <div className="flex gap-1">
                          <div className="h-6 w-10 bg-white border border-border rounded flex items-center justify-center text-[10px] font-bold text-primary">VISA</div>
                          <div className="h-6 w-10 bg-white border border-border rounded flex items-center justify-center text-[10px] font-bold text-primary">MC</div>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {paymentMethod === 'card' && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-6 pb-6 pt-2"
                          >
                            <div className="space-y-4">
                              <div className="space-y-2 relative">
                                <Label htmlFor="cardNumber" className="font-bold text-primary">رقم البطاقة</Label>
                                <div className="relative">
                                  <Input 
                                    id="cardNumber" 
                                    placeholder="0000 0000 0000 0000" 
                                    className="h-12 rounded-xl text-left pl-12 pr-4 font-mono" 
                                    dir="ltr"
                                    maxLength={19}
                                    {...paymentForm.register("cardNumber")}
                                    onChange={formatCardNumber}
                                  />
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-muted px-2 py-1 rounded text-[10px] font-bold text-primary tracking-widest">
                                    {getCardBrandIcon(paymentForm.watch('cardNumber') || "")}
                                  </div>
                                </div>
                                {paymentForm.formState.errors.cardNumber && <p className="text-sm text-destructive font-semibold">{paymentForm.formState.errors.cardNumber.message}</p>}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cardName" className="font-bold text-primary">اسم حامل البطاقة</Label>
                                <Input id="cardName" placeholder="كما يظهر على البطاقة" className="h-12 rounded-xl" {...paymentForm.register("cardName")} />
                                {paymentForm.formState.errors.cardName && <p className="text-sm text-destructive font-semibold">{paymentForm.formState.errors.cardName.message}</p>}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="expiry" className="font-bold text-primary">تاريخ الانتهاء</Label>
                                  <Input 
                                    id="expiry" 
                                    placeholder="MM/YY" 
                                    className="h-12 rounded-xl text-left" 
                                    dir="ltr"
                                    maxLength={5}
                                    {...paymentForm.register("expiry")}
                                    onChange={formatExpiry}
                                  />
                                  {paymentForm.formState.errors.expiry && <p className="text-sm text-destructive font-semibold">{paymentForm.formState.errors.expiry.message}</p>}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="cvv" className="font-bold text-primary">CVV</Label>
                                  <Input id="cvv" type="password" placeholder="123" maxLength={4} className="h-12 rounded-xl text-left" dir="ltr" {...paymentForm.register("cvv")} />
                                  {paymentForm.formState.errors.cvv && <p className="text-sm text-destructive font-semibold">{paymentForm.formState.errors.cvv.message}</p>}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* PayPal */}
                    <div className={`border rounded-xl transition-all overflow-hidden ${paymentMethod === 'paypal' ? 'border-secondary ring-1 ring-secondary bg-secondary/5' : 'border-border'}`}>
                      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setPaymentMethod('paypal')}>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="paypal" id="paypal" className="text-secondary border-primary/20" />
                          <Label htmlFor="paypal" className="font-bold text-primary cursor-pointer text-base flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-[#00457C]" />
                            PayPal
                          </Label>
                        </div>
                      </div>
                      <AnimatePresence>
                        {paymentMethod === 'paypal' && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                            <div className="px-6 pb-6 text-center text-muted-foreground font-semibold">
                              ستتم إعادة توجيهك إلى منصة PayPal لإكمال عملية الدفع بأمان.
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Bank Transfer */}
                    <div className={`border rounded-xl transition-all overflow-hidden ${paymentMethod === 'bank' ? 'border-secondary ring-1 ring-secondary bg-secondary/5' : 'border-border'}`}>
                      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setPaymentMethod('bank')}>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="bank" id="bank" className="text-secondary border-primary/20" />
                          <Label htmlFor="bank" className="font-bold text-primary cursor-pointer text-base flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-primary/60" />
                            تحويل بنكي
                          </Label>
                        </div>
                      </div>
                      <AnimatePresence>
                        {paymentMethod === 'bank' && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                            <div className="px-6 pb-6 pt-2">
                              <div className="bg-white p-4 rounded-xl border border-border text-sm space-y-2 text-left" dir="ltr">
                                <p><span className="font-bold text-muted-foreground mr-2">Bank:</span> Global Trust Bank</p>
                                <p><span className="font-bold text-muted-foreground mr-2">Account Name:</span> Cheetahs City International</p>
                                <p><span className="font-bold text-muted-foreground mr-2">IBAN:</span> SA12 0000 0000 1234 5678 90</p>
                                <p><span className="font-bold text-muted-foreground mr-2">BIC/SWIFT:</span> GLTRSA21</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-3 font-semibold">الرجاء استخدام رقم الطلب كمرجع للتحويل. لن يتم شحن الطلب حتى يتأكد التحويل.</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* COD */}
                    <div className={`border rounded-xl transition-all overflow-hidden ${paymentMethod === 'cod' ? 'border-secondary ring-1 ring-secondary bg-secondary/5' : 'border-border'}`}>
                      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setPaymentMethod('cod')}>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="cod" id="cod" className="text-secondary border-primary/20" />
                          <Label htmlFor="cod" className="font-bold text-primary cursor-pointer text-base flex items-center gap-2">
                            <Truck className="h-5 w-5 text-primary/60" />
                            الدفع عند الاستلام
                          </Label>
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">+$2.00 رسوم خدمة</span>
                      </div>
                    </div>
                  </RadioGroup>

                  <div className="space-y-6 pt-6 border-t border-border">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Controller
                        control={paymentForm.control}
                        name="billingSameAsShipping"
                        render={({ field }) => (
                          <Checkbox id="billingSameAsShipping" checked={field.value} onCheckedChange={field.onChange} className="rounded" />
                        )}
                      />
                      <Label htmlFor="billingSameAsShipping" className="font-semibold cursor-pointer">عنوان الفوترة مطابق لعنوان الشحن</Label>
                    </div>
                    
                    {!paymentForm.watch("billingSameAsShipping") && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                        <Label htmlFor="billingAddress" className="font-bold text-primary">عنوان الفوترة التفصيلي</Label>
                        <Textarea id="billingAddress" placeholder="أدخل عنوان الفوترة بالكامل" className="rounded-xl min-h-[80px]" {...paymentForm.register("billingAddress")} />
                      </motion.div>
                    )}

                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <div className="flex items-start space-x-2 rtl:space-x-reverse">
                        <Controller
                          control={paymentForm.control}
                          name="termsAccepted"
                          render={({ field }) => (
                            <Checkbox id="termsAccepted" checked={field.value} onCheckedChange={field.onChange} className="rounded mt-1" />
                          )}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="termsAccepted" className="font-semibold cursor-pointer leading-tight">
                            أوافق على <button type="button" onClick={() => toast({title:"الشروط والأحكام", description:"تفتح نافذة الشروط والأحكام"})} className="text-secondary hover:underline">الشروط والأحكام</button> وسياسة الخصوصية
                          </Label>
                          {paymentForm.formState.errors.termsAccepted && <p className="text-sm text-destructive font-semibold">{paymentForm.formState.errors.termsAccepted.message}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Controller
                          control={paymentForm.control}
                          name="newsletter"
                          render={({ field }) => (
                            <Checkbox id="newsletter" checked={field.value} onCheckedChange={field.onChange} className="rounded" />
                          )}
                        />
                        <Label htmlFor="newsletter" className="font-semibold cursor-pointer">الاشتراك في النشرة الإخبارية للحصول على العروض الحصرية</Label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
                <Button variant="ghost" onClick={() => setCurrentStep(1)} className="font-bold text-primary hover:text-secondary order-2 sm:order-1">
                  العودة إلى الشحن
                </Button>
                <Button 
                  type="submit" 
                  form="payment-form" 
                  className="w-full sm:w-auto h-14 px-12 text-lg font-bold rounded-full bg-[#0094B4] hover:bg-[#0094B4]/90 text-white order-1 sm:order-2 shadow-lg shadow-secondary/20"
                >
                  <Lock className="h-5 w-5 ml-2" />
                  إتمام الطلب
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
              <OrderSummary 
                items={cartState.items} 
                subtotal={total} 
                shippingCost={shippingCost + (paymentMethod === 'cod' ? 2 : 0)} 
                discount={discount}
                appliedCode={appliedCode}
                readonly
              />
            </div>
          </motion.div>
        )}

        {currentStep === 3 && finalOrder && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto space-y-12"
          >
            <div className="bg-white border border-border rounded-3xl p-8 md:p-12 text-center shadow-xl shadow-secondary/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary via-secondary to-accent"></div>
              
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">شكراً لطلبك!</h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto mb-8 font-medium">
                تم استلام طلبك بنجاح وسنرسل تأكيداً وتفاصيل التتبع إلى بريدك الإلكتروني قريباً.
              </p>
              
              <div className="bg-muted/30 p-6 rounded-2xl mb-8 flex flex-wrap gap-6 justify-center text-right divide-x rtl:divide-x-reverse divide-border">
                <div className="px-6">
                  <p className="text-sm text-muted-foreground mb-1">رقم الطلب</p>
                  <p className="font-black text-primary text-xl" dir="ltr">{finalOrder.id}</p>
                </div>
                <div className="px-6">
                  <p className="text-sm text-muted-foreground mb-1">التاريخ</p>
                  <p className="font-bold text-primary">{new Date(finalOrder.date).toLocaleDateString('ar-EG')}</p>
                </div>
                <div className="px-6">
                  <p className="text-sm text-muted-foreground mb-1">المجموع</p>
                  <p className="font-black text-secondary text-xl">${finalOrder.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right text-sm border-t border-border pt-8">
                <div className="bg-card border border-border rounded-xl p-5">
                  <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4" /> معلومات الشحن
                  </h4>
                  <p className="font-semibold">{finalOrder.shippingAddress?.fullName}</p>
                  <p className="text-muted-foreground mt-1">{finalOrder.shippingAddress?.address}</p>
                  <p className="text-muted-foreground">{finalOrder.shippingAddress?.city}, {finalOrder.shippingAddress?.country}</p>
                  <p className="text-muted-foreground mt-2" dir="ltr">{finalOrder.shippingAddress?.phone}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> معلومات الدفع
                  </h4>
                  <p className="font-semibold">
                    {finalOrder.paymentMethod === 'card' ? 'بطاقة ائتمان' : 
                     finalOrder.paymentMethod === 'paypal' ? 'PayPal' : 
                     finalOrder.paymentMethod === 'bank' ? 'تحويل بنكي' : 'الدفع عند الاستلام'}
                  </p>
                  <p className="text-muted-foreground mt-2 pt-2 border-t border-border">
                    طريقة الشحن: <br/>
                    <span className="font-semibold text-primary">
                      {finalOrder.shippingMethod === 'standard' ? 'توصيل قياسي' : 
                       finalOrder.shippingMethod === 'express' ? 'توصيل سريع' : 'استلام من المتجر'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Button className="h-14 px-8 text-lg font-bold rounded-full" asChild>
                  <Link href="/store">متابعة التسوق</Link>
                </Button>
                <Button variant="outline" className="h-14 px-8 text-lg font-bold rounded-full border-primary text-primary" asChild>
                  <Link href="/account?tab=orders">تتبع الطلب</Link>
                </Button>
              </div>
            </div>

            {/* Recommendations Strip */}
            <div>
              <h3 className="text-2xl font-black text-primary mb-6">ربما يعجبك أيضاً</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recommendations.map(product => (
                  <div key={product.id} className="scale-95 origin-top">
                    <ProductCard product={product} compact />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CheckoutShell>
  );
}
