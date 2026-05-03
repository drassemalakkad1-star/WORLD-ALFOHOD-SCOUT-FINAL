import { Product } from "../data/products";
import { products as STATIC_PRODUCTS } from "../data/products";
import { getProducts, urlFor } from "./sanityClient";

export const storeApi = {
  listProducts: async (): Promise<Product[]> => {
    let combined = [...STATIC_PRODUCTS];
    
    try {
      const sanityProducts = await getProducts();
      if (sanityProducts && sanityProducts.length > 0) {
        const mappedSanity: Product[] = sanityProducts.map((sp: any) => ({
          id: sp._id,
          slug: sp.slug,
          name: sp.name,
          description: sp.description,
          price: sp.price,
          priceFrom: sp.priceFrom || false,
          currency: sp.currency || "USD",
          category: sp.category,
          tag: sp.tag,
          image: sp.image ? urlFor(sp.image).url() : "",
          gallery: sp.gallery?.map((img: any) => urlFor(img).url()) || [],
          colors: sp.colors || [],
          sizes: sp.sizes || [],
          inStock: sp.inStock !== false,
          rating: sp.rating || 5,
          reviewCount: sp.reviewCount || 0,
          collections: sp.collections || []
        }));

        const sanitySlugs = new Set(mappedSanity.map(p => p.slug));
        combined = [...mappedSanity, ...STATIC_PRODUCTS.filter(p => !sanitySlugs.has(p.slug))];
      }
    } catch (err) {
      console.error("Error fetching Sanity products:", err);
    }
    
    return combined;
  },

  getProduct: async (slug: string): Promise<Product | undefined> => {
    try {
      const all = await storeApi.listProducts();
      return all.find(p => p.slug === slug);
    } catch (err) {
      console.error("Error getting product:", err);
      return STATIC_PRODUCTS.find(p => p.slug === slug);
    }
  }
};
