import { Product } from "@/data/products";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "./cartContext";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact }: ProductCardProps) {
  const { dispatch } = useCart();

  const isGradient = product.image.startsWith("linear-gradient");

  const getTagColor = (tag: Product["tag"]) => {
    switch (tag) {
      case "جديد": return "bg-[#F5B041] text-primary";
      case "الأكثر مبيعاً": return "bg-[#0094B4] text-white";
      case "حصري": return "bg-[#4D006E] text-white";
      case "جائزة": return "bg-gray-800 text-white";
      default: return "bg-transparent";
    }
  };

  return (
    <Card className="h-full overflow-hidden border-border/50 group bg-white hover:shadow-xl transition-all duration-300 flex flex-col relative rounded-xl">
      {product.tag && (
        <div className={`absolute top-4 left-4 z-20 px-3 py-1 text-xs font-bold uppercase rounded-md shadow-sm ${getTagColor(product.tag)}`}>
          {product.tag}
        </div>
      )}
      
      <div className="relative h-[220px] md:h-[280px] overflow-hidden bg-muted/20 cursor-pointer">
        <Link href={`/store/p/${product.slug}`} className="w-full h-full block">
          {isGradient ? (
            <div className="w-full h-full" style={{ background: product.image }} />
          ) : (
            <img loading="lazy" decoding="async" 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
            />
          )}
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300 hidden md:block">
          <Button 
            className="w-full bg-white/95 text-primary hover:bg-white font-bold backdrop-blur-sm border border-border/50"
            onClick={(e) => {
              e.preventDefault();
              dispatch({ 
                type: "ADD_ITEM", 
                payload: { 
                  id: product.id, 
                  name: product.name, 
                  price: product.price, 
                  quantity: 1, 
                  image: product.image 
                } 
              });
            }}
          >
            إضافة سريعة
          </Button>
        </div>
        {/* Mobile Quick Add */}
        <div className="absolute bottom-2 right-2 md:hidden">
          <Button 
            size="icon"
            className="h-10 w-10 rounded-full bg-white text-primary shadow-md"
            onClick={(e) => {
              e.preventDefault();
              dispatch({ 
                type: "ADD_ITEM", 
                payload: { 
                  id: product.id, 
                  name: product.name, 
                  price: product.price, 
                  quantity: 1, 
                  image: product.image 
                } 
              });
            }}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <CardContent className="p-5 flex flex-col flex-1">
        <Link href={`/store/p/${product.slug}`} className="block mb-2">
          <h3 className="text-lg font-bold text-primary hover:text-secondary transition-colors cursor-pointer line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating!) ? "fill-[#F5B041] text-[#F5B041]" : "text-muted"}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        )}
        
        <div className="flex flex-col mt-auto pt-4 border-t border-border/50 gap-3">
          <div className="flex items-end justify-between w-full">
            <div className="text-lg font-black text-secondary flex items-baseline gap-1" dir="ltr">
              {product.priceFrom && <span className="text-xs font-normal text-muted-foreground ml-1">يبدأ من</span>}
              ${product.price.toFixed(2)}
            </div>
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1">
                {product.colors.slice(0, 4).map((color, i) => (
                  <div 
                    key={i} 
                    className="w-4 h-4 rounded-[4px] border border-border/50 shadow-sm"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-[10px] text-muted-foreground">+{product.colors.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
