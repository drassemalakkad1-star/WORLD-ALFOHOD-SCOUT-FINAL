import { SiteLayout } from "@/components/layout/SiteLayout";
import { useParams, Link } from "wouter";
import { storeApi } from "@/lib/storeApi";
import { products as STATIC_PRODUCTS } from "@/data/products";
import NotFound from "./not-found";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, ChevronRight, Star, Plus, Minus, Truck, RotateCcw, Shield, Loader2 } from "lucide-react";
import { useCart } from "@/components/store/cartContext";
import { CartDrawer } from "@/components/store/CartDrawer";
import { useState, useEffect } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { Carousel3D, Carousel3DItem } from "@/components/store/Carousel3D";
import { LiveActivityFeed } from "@/components/store/LiveActivityFeed";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { dispatch } = useCart();
  
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => storeApi.getProduct(slug!),
    enabled: !!slug
  });
  
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0]?.name);
      setSelectedSize(product.sizes?.[0]);
    }
  }, [product]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-secondary mb-4" />
          <p className="text-muted-foreground font-bold">جاري تحميل المنتج...</p>
        </div>
      </SiteLayout>
    );
  }

  if (!product) return <NotFound />;

  const isGradient = product.image.startsWith("linear-gradient");
  const galleryImages = product.gallery || [product.image, product.image, product.image];

  const handleAddToCart = () => {
    dispatch({ 
      type: "ADD_ITEM", 
      payload: { 
        id: product.id, 
        name: product.name + (selectedSize ? ` - ${selectedSize}` : "") + (selectedColor ? ` - ${selectedColor}` : ""), 
        price: product.price, 
        quantity: quantity, 
        image: product.image 
      } 
    });
  };

  const relatedProducts = STATIC_PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <SiteLayout>
      <AuthGuard>
        <div className="bg-muted/10 pt-32 pb-12 border-b border-border/50">
          <div className="container mx-auto px-4 md:px-8">
            <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-8">
              <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/store" className="hover:text-primary transition-colors">المتجر</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href={`/store?category=${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-primary font-bold">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Gallery */}
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-8 border border-border/50 relative">
                  {product.tag && (
                    <div className={`absolute top-6 left-6 z-20 px-4 py-1.5 text-sm font-bold uppercase rounded-md shadow-sm
                      ${product.tag === "جديد" ? "bg-[#F5B041] text-primary" : 
                        product.tag === "الأكثر مبيعاً" ? "bg-[#0094B4] text-white" : 
                        product.tag === "حصري" ? "bg-[#4D006E] text-white" : 
                        "bg-gray-800 text-white"}`}>
                      {product.tag}
                    </div>
                  )}
                  {galleryImages[activeImage].startsWith("linear-gradient") ? (
                    <div className="w-full h-full rounded-xl" style={{ background: galleryImages[activeImage] }} />
                  ) : (
                    <motion.img 
                      key={activeImage}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                      src={galleryImages[activeImage]} 
                      alt={product.name} 
                      className="w-full h-full object-contain mix-blend-multiply" 
                    />
                  )}
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {galleryImages.map((img, i) => (
                    <div 
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${activeImage === i ? "border-secondary opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      {img.startsWith("linear-gradient") ? (
                        <div className="w-full h-full" style={{ background: img }} />
                      ) : (
                        <img loading="lazy" decoding="async" src={img} alt="" className="w-full h-full object-contain bg-white p-2 mix-blend-multiply" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <h1 className="text-4xl md:text-5xl font-black text-primary mb-4 leading-tight">{product.name}</h1>
                
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating || 5) ? "fill-[#F5B041] text-[#F5B041]" : "text-muted"}`} />
                      ))}
                    </div>
                    {product.reviewCount && <span className="text-sm font-bold text-secondary mr-2">{product.rating} ({product.reviewCount} مراجعة)</span>}
                  </div>
                  {product.inStock ? (
                    <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-md text-sm font-bold">
                      <Check className="h-4 w-4" />
                      متوفر
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-md text-sm font-bold">
                      غير متوفر
                    </div>
                  )}
                </div>

                <div className="text-4xl font-black text-primary mb-8 flex items-baseline gap-2" dir="ltr">
                  ${product.price.toFixed(2)}
                  {product.priceFrom && <span className="text-lg text-muted-foreground font-normal">يبدأ من</span>}
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {product.description}
                </p>

                {/* Options */}
                <div className="space-y-6 mb-10">
                  {product.colors && product.colors.length > 0 && (
                    <div className="space-y-3">
                      <div className="font-bold text-primary">اللون: <span className="text-muted-foreground font-normal">{selectedColor}</span></div>
                      <div className="flex flex-wrap gap-3">
                        {product.colors.map(color => (
                          <div 
                            key={color.name}
                            onClick={() => setSelectedColor(color.name)}
                            className={`w-10 h-10 rounded-md cursor-pointer border-2 transition-all flex items-center justify-center
                              ${selectedColor === color.name ? "border-primary scale-110 shadow-md" : "border-border/50 hover:scale-105"}`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {selectedColor === color.name && color.hex === "#FFFFFF" && <Check className="h-5 w-5 text-primary" />}
                            {selectedColor === color.name && color.hex !== "#FFFFFF" && <Check className="h-5 w-5 text-white" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-primary">المقاس: <span className="text-muted-foreground font-normal">{selectedSize}</span></div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button type="button" className="text-sm text-secondary font-bold hover:underline" data-testid="button-size-guide">
                              دليل المقاسات
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>دليل المقاسات</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 text-sm">
                              <p className="text-muted-foreground">اختر المقاس المناسب وفقاً للمحيط والطول التقريبي.</p>
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-muted">
                                    <th className="border p-2 text-right">المقاس</th>
                                    <th className="border p-2 text-right">الصدر (سم)</th>
                                    <th className="border p-2 text-right">الطول (سم)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr><td className="border p-2">XS</td><td className="border p-2">82-86</td><td className="border p-2">62</td></tr>
                                  <tr><td className="border p-2">S</td><td className="border p-2">86-92</td><td className="border p-2">66</td></tr>
                                  <tr><td className="border p-2">M</td><td className="border p-2">92-98</td><td className="border p-2">70</td></tr>
                                  <tr><td className="border p-2">L</td><td className="border p-2">98-106</td><td className="border p-2">74</td></tr>
                                  <tr><td className="border p-2">XL</td><td className="border p-2">106-114</td><td className="border p-2">78</td></tr>
                                </tbody>
                              </table>
                              <p className="text-xs text-muted-foreground">إذا كنت بين مقاسين، نوصي باختيار المقاس الأكبر للراحة.</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {product.sizes.map(size => (
                          <button 
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`h-12 min-w-16 px-4 rounded-md font-bold transition-all border-2
                              ${selectedSize === size ? "border-primary bg-primary text-white" : "border-border/50 bg-white text-primary hover:border-primary/50"}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="font-bold text-primary">الكمية:</div>
                    <div className="flex items-center gap-4 bg-white border border-border/50 rounded-md w-fit p-1">
                      <button 
                        className="w-10 h-10 flex items-center justify-center text-primary hover:bg-muted rounded disabled:opacity-50"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-black text-lg">{quantity}</span>
                      <button 
                        className="w-10 h-10 flex items-center justify-center text-primary hover:bg-muted rounded"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Button 
                    size="lg" 
                    className="flex-1 h-14 text-lg font-bold bg-secondary text-white hover:bg-secondary/90 rounded-xl shadow-lg shadow-secondary/20"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="ml-2 h-5 w-5" />
                    أضف إلى السلة
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="flex-1 h-14 text-lg font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl"
                    disabled={!product.inStock}
                  >
                    اشترِ الآن
                  </Button>
                </div>

                {/* Features Accordion */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-lg font-bold">التفاصيل الفنية</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                      منتج رسمي معتمد من عالم الفهود الكشفي والإرشادي. مصمم وفق أعلى معايير الجودة ليدوم طويلاً في أقسى الظروف. يرجى اتباع إرشادات العناية المرفقة للحفاظ على جودة المنتج.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="shipping">
                    <AccordionTrigger className="text-lg font-bold">الشحن والتوصيل</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3"><Truck className="h-5 w-5 text-secondary" /> شحن مجاني للطلبات فوق 100$</li>
                        <li className="flex items-center gap-3"><Shield className="h-5 w-5 text-secondary" /> توصيل سريع خلال 3-5 أيام عمل</li>
                        <li className="flex items-center gap-3"><RotateCcw className="h-5 w-5 text-secondary" /> إرجاع مجاني خلال 30 يوم</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

              </div>
            </div>
          </div>
        </div>

        {/* Product Content Tabs */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-8 max-w-4xl">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full flex border-b border-border rounded-none bg-transparent h-auto p-0 mb-10 gap-8 justify-start overflow-x-auto scrollbar-hide">
                <TabsTrigger value="description" className="text-lg font-bold bg-transparent border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none px-0 pb-4 data-[state=active]:shadow-none data-[state=active]:bg-transparent">
                  الوصف الكامل
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-lg font-bold bg-transparent border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none px-0 pb-4 data-[state=active]:shadow-none data-[state=active]:bg-transparent">
                  المراجعات ({product.reviewCount || 0})
                </TabsTrigger>
                <TabsTrigger value="faq" className="text-lg font-bold bg-transparent border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none px-0 pb-4 data-[state=active]:shadow-none data-[state=active]:bg-transparent">
                  الأسئلة الشائعة
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="text-lg text-muted-foreground leading-loose">
                <p className="mb-6">
                  هذا المنتج جزء من التشكيلة الرسمية المعتمدة لعالم الفهود الكشفي والإرشادي. تم تصميمه واختباره بعناية فائقة ليلبي احتياجات الأعضاء والقادة في مختلف الأنشطة والبيئات.
                </p>
                <p>
                  نحن نلتزم بالاستدامة في تصنيع منتجاتنا، حيث نستخدم مواد معاد تدويرها متى ما أمكن، ونحرص على توفير منتجات متينة تدوم لسنوات بدلاً من المنتجات ذات الاستخدام القصير. شرائك من هذا المتجر يدعم مباشرة البرامج الشبابية لعالم الفهود حول العالم.
                </p>
              </TabsContent>
              <TabsContent value="reviews" className="space-y-8">
                {product.reviewCount ? (
                  <>
                    <div className="flex items-center gap-6 p-6 bg-muted/20 rounded-xl border border-border/50">
                      <div className="text-center shrink-0">
                        <div className="text-5xl font-black text-primary">{product.rating}</div>
                        <div className="flex justify-center mt-2 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating || 5) ? "fill-[#F5B041] text-[#F5B041]" : "text-muted"}`} />
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">بناءً على {product.reviewCount} مراجعة</div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5,4,3,2,1].map(stars => (
                          <div key={stars} className="flex items-center gap-3 text-sm">
                            <div className="w-8 shrink-0">{stars} نجوم</div>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-[#F5B041]" style={{ width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 5 : 0}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="pb-6 border-b border-border/50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-primary">منتج ممتاز وعملي جداً</div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-[#F5B041] text-[#F5B041]" />)}
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-3">الجودة ممتازة كما هو متوقع دائماً من منتجات الفهود. أنصح به بشدة.</p>
                        <div className="text-sm text-muted-foreground font-medium">- أحمد س.</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">لا توجد مراجعات لهذا المنتج بعد. كن أول من يكتب مراجعة!</div>
                )}
              </TabsContent>
              <TabsContent value="faq" className="text-lg text-muted-foreground leading-loose">
                <Accordion type="single" collapsible>
                  <AccordionItem value="q1">
                    <AccordionTrigger>هل يمكنني استبدال المنتج إذا كان المقاس غير مناسب؟</AccordionTrigger>
                    <AccordionContent>نعم، يمكنك استبدال المنتج خلال 30 يوماً من تاريخ الاستلام بشرط أن يكون بحالته الأصلية وغير مستخدم.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q2">
                    <AccordionTrigger>متى سيصلني الطلب؟</AccordionTrigger>
                    <AccordionContent>التوصيل المحلي يستغرق عادة 3-5 أيام عمل. الشحن الدولي قد يستغرق 10-14 يوماً حسب الدولة.</AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Related Products – 3D Carousel */}
        {relatedProducts.length > 0 && (
          <Carousel3D
            title="قد يعجبك أيضاً"
            items={relatedProducts.map<Carousel3DItem>(p => ({
              id: p.id,
              title: p.name,
              subtitle: p.category,
              image: p.image,
              href: `/store/p/${p.slug}`,
            }))}
          />
        )}

        <CartDrawer />
      </AuthGuard>
      <LiveActivityFeed />
    </SiteLayout>
  );
}
