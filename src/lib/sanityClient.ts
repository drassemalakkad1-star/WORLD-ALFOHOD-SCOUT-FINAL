import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || "2024-05-03",
  useCdn: true, // set to `false` to bypass the edge cache
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

export async function getLeadership() {
  return await client.fetch(`*[_type == "leadership"] {
    name,
    rank,
    image,
    bio
  }`);
}

export async function getNews() {
  return await client.fetch(`*[_type == "news"] | order(eventDate desc) {
    _id,
    title,
    "slug": slug.current,
    eventDate,
    location,
    content,
    mainImage,
    gallery,
    category,
    excerpt,
    tags,
    featured,
    views,
    likes,
    author
  }`);
}

export async function getNewsBySlug(slug: string) {
  return await client.fetch(
    `*[_type == "news" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      eventDate,
      location,
      content,
      mainImage,
      gallery,
      category,
      excerpt,
      tags,
      featured,
      views,
      likes,
      author
    }`,
    { slug }
  );
}
export async function getAcademyCourses() {
  return await client.fetch(`*[_type == "academyCourse"] {
    _id,
    title,
    "slug": slug.current,
    description,
    instructor,
    duration,
    lessons,
    level,
    rating,
    reviewCount,
    price,
    oldPrice,
    image,
    category,
    featured,
    enrollmentCount
  }`);
}

export async function getProducts() {
  return await client.fetch(`*[_type == "product"] {
    _id,
    name,
    "slug": slug.current,
    description,
    price,
    priceFrom,
    currency,
    category,
    tag,
    image,
    gallery,
    colors,
    sizes,
    inStock,
    rating,
    reviewCount,
    collections
  }`);
}
export async function getProductBySlug(slug: string) {
  return await client.fetch(
    `*[_type == "product" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      description,
      price,
      priceFrom,
      currency,
      category,
      tag,
      image,
      gallery,
      colors,
      sizes,
      inStock,
      rating,
      reviewCount,
      collections
    }`,
    { slug }
  );
}
