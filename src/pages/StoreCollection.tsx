import { useState, useMemo } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useRoute, Link } from "wouter";
import { collections } from "@/data/collections";
import { products } from "@/data/products";
import NotFound from "./not-found";
import { ProductCard } from "@/components/store/ProductCard";
import { CartDrawer } from "@/components/store/CartDrawer";
import { CinematicHeroSlider, CinematicSlide } from "@/components/store/CinematicHeroSlider";
import { OffersTicker } from "@/components/store/OffersTicker";
import { LiveActivityFeed } from "@/components/store/LiveActivityFeed";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowLeft, Sparkles, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const ITEMS_PER_PAGE = 9;

export default function StoreCollection() {
  const [, params] = useRoute("/store/c/:slug");
  const slug = params ? (params as any).slug : "";

  const collection = collections.find((c) => c.slug === slug);
  
  const collectionProducts = useMemo(() => {
    if (!collection) return [];
    return products.filter((p) => p.collections.includes(collection.slug));
  }, [collection]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(collectionProducts.map((p) => p.category)));
  }, [collectionProducts]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset filters when collection changes
  useMemo(() => {
    setSelectedCategory("all");
    setSearchQuery("");
    setPriceRange([0, 100]);
    setInStockOnly(false);
    setSortBy("latest");
    setCurrentPage(1);
  }, [slug]);

  const filteredProducts = useMemo(() => {
    let result = collectionProducts;

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "latest":
      default:
        break;
    }

    return result;
  }, [collectionProducts, selectedCategory, searchQuery, priceRange, inStockOnly, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page on filter change
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, priceRange, inStockOnly, sortBy]);

  if (!collection) return <NotFound />;

  const featuredProducts = [...collectionProducts]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  const otherCollections = collections.filter(c => c.slug !== collection.slug).slice(0, 4);

  // Build dedicated cinematic slides for THIS department
  const heroSlides: CinematicSlide[] = [
    {
      id: `${collection.slug}-intro`,
      badge: collection.subtitleAr,
      title: collection.titleAr,
      subtitle: collection.descriptionAr,
      ctaLabel: "تسوق المجموعة",
      ctaHref: `#product-grid`,
      image: collection.heroImage,
      accent: "#D4AF37",
      background: "linear-gradient(135deg, #050505 0%, #1a1408 50%, #050505 100%)",
    },
    ...featuredProducts.slice(0, 3).map((p, i) => ({
      id: p.id,
      badge: p.tag === "الأكثر مبيعاً" ? "أكثر مبيعاً" : p.tag === "جديد" ? "وصل حديثاً" : "مميز",
      title: p.name,
      subtitle: p.description,
      ctaLabel: "اعرف أكثر",
      ctaHref: `/store/p/${p.slug}`,
      image: p.image,
      accent: ["#F5E199", "#E6C56C", "#D4AF37"][i],
      background: i % 2 === 0
        ? "linear-gradient(135deg, #050505 0%, #2a1a08 50%, #050505 100%)"
        : "linear-gradient(135deg, #050505 0%, #1a1408 50%, #050505 100%)",
    })),
  ];

  return (
    <SiteLayout>
      <CinematicHeroSlider slides={heroSlides} />

      <OffersTicker
        items={[
          { id: "tc1", icon: "tag", text: `عروض حصرية على ${collection.titleAr} هذا الأسبوع` },
          { id: "tc2", icon: "sparkles", text: `${collectionProducts.length} منتجاً متوفراً الآن` },
          { id: "tc3", icon: "bell", text: "اشترك بالنشرة لتصلك العروض أولاً" },
          { id: "tc4", icon: "youtube", text: "مراجعات مفصّلة على قناة سكاوت تيوب" },
        ]}
      />

      <section className="py-16 bg-white" id="product-grid">
        <div className="container mx-auto px-4 md:px-8">
          
          {/* Featured Carousel Strip */}
          {featuredProducts.length > 0 && currentPage === 1 && selectedCategory === "all" && !searchQuery && (
            <div className="mb-16">
              <h2 className="text-2xl font-black text-primary mb-6">أبرز المنتجات</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((p, i) => (
                  <motion.div key={`feat-${p.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-category Pills */}
          {availableCategories.length > 0 && (
            <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide mb-10 border-b border-border/50">
              <Button 
                variant={selectedCategory === "all" ? "default" : "outline"}
                className={`rounded-full px-6 h-12 whitespace-nowrap font-bold ${selectedCategory === "all" ? "bg-secondary text-white hover:bg-secondary/90" : "border-border/50"}`}
                onClick={() => setSelectedCategory("all")}
              >
                الكل
              </Button>
              {availableCategories.map((cat) => (
                <Button 
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className={`rounded-full px-6 h-12 whitespace-nowrap font-bold ${selectedCategory === cat ? "bg-secondary text-white hover:bg-secondary/90" : "border-border/50"}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <div className="lg:w-1/4 shrink-0 space-y-8">
              <div className="bg-muted/10 p-6 rounded-2xl border border-border/50 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-primary">تصفية المنتجات</h3>
                  <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="space-y-8">
                  {/* Search */}
                  <div className="space-y-3">
                    <Label className="font-bold">بحث</Label>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="ابحث في هذه المجموعة..." 
                        className="pl-3 pr-10 rounded-xl bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold">السعر</Label>
                      <span className="text-sm font-bold text-secondary" dir="ltr">
                        ${priceRange[0]} - ${priceRange[1]}
                      </span>
                    </div>
                    <Slider 
                      defaultValue={[0, 100]} 
                      max={200} 
                      step={5} 
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="py-4"
                    />
                  </div>

                  {/* In Stock */}
                  <div className="flex items-center justify-between pt-2">
                    <Label className="font-bold cursor-pointer" htmlFor="in-stock-col">متوفر في المخزن فقط</Label>
                    <Switch 
                      id="in-stock-col" 
                      checked={inStockOnly}
                      onCheckedChange={setInStockOnly}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Area */}
            <div className="lg:w-3/4">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 bg-muted/10 p-4 rounded-xl border border-border/50">
                <p className="text-muted-foreground font-medium">
                  عرض <span className="font-bold text-primary">{paginatedProducts.length}</span> من <span className="font-bold text-primary">{filteredProducts.length}</span> منتج
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground">ترتيب حسب:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-white rounded-lg">
                      <SelectValue placeholder="ترتيب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">الأحدث</SelectItem>
                      <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
                      <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
                      <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product, i) => (
                    <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-muted/10 rounded-2xl border border-dashed border-border/50">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-bold text-primary mb-2">لم نجد ما تبحث عنه</h3>
                  <p className="text-muted-foreground mb-6">حاول تغيير خيارات البحث أو التصفية.</p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setPriceRange([0, 100]);
                    setInStockOnly(false);
                  }}>إعادة ضبط التصفية</Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {[...Array(totalPages)].map((_, i) => (
                    <Button 
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      className={`h-10 w-10 rounded-full font-bold ${currentPage === i + 1 ? "bg-secondary text-white border-secondary" : ""}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Other Collections */}
      <section className="py-20 bg-muted/10 border-t border-border/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black text-primary">تسوق المجموعات الأخرى</h2>
            <Link href="/store" className="text-secondary font-bold hover:underline flex items-center gap-1">
              عرض الكل
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherCollections.map((c, i) => (
              <Link key={c.slug} href={`/store/c/${c.slug}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: i * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer"
                >
                  <div className="absolute inset-0 z-10 opacity-80 mix-blend-multiply transition-opacity group-hover:opacity-90" style={{ backgroundColor: c.accent }} />
                  <img loading="lazy" decoding="async" src={c.heroImage} alt={c.titleAr} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                    <span className="text-white/80 text-sm font-bold mb-1">{c.subtitleAr}</span>
                    <h3 className="text-2xl font-black text-white mb-2">{c.titleAr}</h3>
                    <div className="flex items-center gap-2 text-white text-sm font-bold opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      تسوق الآن <ArrowLeft className="h-4 w-4" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
          <div className="bg-gradient-to-r from-[#4D006E] to-[#8E44AD] rounded-3xl p-10 md:p-16 text-white shadow-xl">
            <h2 className="text-3xl md:text-4xl font-black mb-4">اشترك للحصول على عروض المتجر</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              كن أول من يعلم عن المنتجات الجديدة، العروض الحصرية، ومجموعات الجمبوري الخاصة.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                placeholder="البريد الإلكتروني" 
                className="h-14 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white"
              />
              <Button size="lg" className="h-14 rounded-full bg-white text-[#4D006E] hover:bg-white/90 font-bold px-8 shrink-0">
                اشترك الآن
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CartDrawer />
      <LiveActivityFeed />
    </SiteLayout>
  );
}
