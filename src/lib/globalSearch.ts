import { news } from "@/data/news";
import { products } from "@/data/products";
import { ACADEMY_COURSES } from "@/data/academyCourses";
import { events } from "@/data/events";
import { RESOURCES } from "@/data/resources";

export type SearchResult = {
  id: string;
  type: "course" | "game" | "news" | "product" | "event" | "resource";
  title: string;
  subtitle?: string;
  href: string;
  emoji?: string;
};

const GAMES_INDEX: Array<{ id: string; title: string; emoji: string; category: string }> = [
  { id: "trivia",   title: "ثقافة كشفية",      emoji: "🧠", category: "كشفية" },
  { id: "memory",   title: "الذاكرة الكشفية",   emoji: "🃏", category: "كشفية" },
  { id: "word",     title: "حروف مبعثرة",       emoji: "🧩", category: "كشفية" },
  { id: "ttt",      title: "إكس أو",           emoji: "🎮", category: "عامة" },
  { id: "numguess", title: "خمّن الرقم",        emoji: "🎯", category: "عامة" },
  { id: "color",    title: "تسلسل الألوان",     emoji: "🎨", category: "عامة" },
];

function norm(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u0652]/g, "") // strip Arabic diacritics
    .trim();
}

export function searchAll(query: string, limitPerType = 4): SearchResult[] {
  const q = norm(query);
  if (!q) return [];

  const matches = (s?: string) => s && norm(s).includes(q);

  const results: SearchResult[] = [];

  // Courses
  ACADEMY_COURSES
    .filter(c => matches(c.title) || matches(c.description) || matches(c.category) || matches(c.subtitle))
    .slice(0, limitPerType)
    .forEach(c => results.push({
      id: c.id,
      type: "course",
      title: c.title,
      subtitle: c.category,
      href: `/academy/c/${c.slug}`,
      emoji: "🎓",
    }));

  // Games
  GAMES_INDEX
    .filter(g => matches(g.title) || matches(g.category))
    .slice(0, limitPerType)
    .forEach(g => results.push({
      id: g.id,
      type: "game",
      title: g.title,
      subtitle: g.category,
      href: `/games`,
      emoji: g.emoji,
    }));

  // News
  news
    .filter(n => matches(n.title) || matches(n.excerpt) || matches(n.category))
    .slice(0, limitPerType)
    .forEach(n => results.push({
      id: String(n.id),
      type: "news",
      title: n.title,
      subtitle: n.category,
      href: `/news/${n.slug}`,
      emoji: "📰",
    }));

  // Events
  events
    .filter((e: any) => matches(e.title) || matches(e.location) || matches(e.summary))
    .slice(0, limitPerType)
    .forEach((e: any) => results.push({
      id: String(e.id ?? e.slug),
      type: "event",
      title: e.title,
      subtitle: e.location,
      href: `/events/${e.slug}`,
      emoji: "📅",
    }));

  // Products
  products
    .filter(p => matches(p.name) || matches(p.description) || matches(p.category))
    .slice(0, limitPerType)
    .forEach(p => results.push({
      id: String(p.id),
      type: "product",
      title: p.name,
      subtitle: p.category,
      href: `/store/p/${p.slug}`,
      emoji: "🛍️",
    }));

  // Resources
  RESOURCES
    .filter(r => matches(r.title) || matches(r.description) || matches(r.category))
    .slice(0, limitPerType)
    .forEach(r => results.push({
      id: r.id,
      type: "resource",
      title: r.title,
      subtitle: r.category,
      href: `/resources`,
      emoji: "📚",
    }));

  return results;
}
