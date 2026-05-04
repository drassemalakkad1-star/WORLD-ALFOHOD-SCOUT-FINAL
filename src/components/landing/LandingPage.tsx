import { SiteLayout } from "@/components/layout/SiteLayout";
import { Hero } from "./Hero";
import { Stats } from "./Stats";
import { Pillars } from "./Pillars";
import { PeopleOfDetermination } from "./PeopleOfDetermination";
import { FeaturedStories } from "./FeaturedStories";
import { Jamboree } from "./Jamboree";
import { JoinSection } from "./JoinSection";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, PlayCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { videos } from "@/data/videos";
import { events } from "@/data/events";
import { ProductCard } from "@/components/store/ProductCard";
import { VideoCard } from "@/components/videos/VideoCard";
import { useTranslation } from "react-i18next";

function StorePreview() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  return (
    <section className="py-24 bg-muted/10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-6">
              {t('home.store.title1')} <span className="text-secondary">{t('home.store.title2')}</span>
            </h2>
            <p className="text-xl text-muted-foreground font-medium">
              {t('home.store.subtitle')}
            </p>
          </div>
          <Link href="/store">
            <Button variant="ghost" className="text-xl font-bold text-primary hover:text-secondary group">
              {t('home.store.cta')}
              {isRtl ? (
                <ArrowLeft className="ml-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoPreview() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const featured = videos[0];

  return (
    <section className="py-24 bg-primary text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              {t('home.videos.title1')} <span className="text-secondary">{t('home.videos.title2')}</span>
            </h2>
            <p className="text-xl text-white/80 font-medium">
              {t('home.videos.subtitle')}
            </p>
          </div>
          <Link href="/videos">
            <Button variant="ghost" className="text-xl font-bold text-white hover:text-secondary group hover:bg-white/10">
              {t('home.videos.cta')}
              {isRtl ? (
                <ArrowLeft className="ml-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative aspect-video rounded-3xl overflow-hidden group cursor-pointer border border-white/20">
            <Link href="/videos">
              <img loading="lazy" decoding="async" src={featured.thumbnail} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <PlayCircle className="h-20 w-20 text-white/90 group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-2xl font-bold">{featured.title}</h3>
              </div>
            </Link>
          </div>
          <div className="flex flex-col gap-6">
            {videos.slice(1, 3).map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EventsPreview() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-6">
              {t('home.events.title1')} <span className="text-secondary">{t('home.events.title2')}</span>
            </h2>
            <p className="text-xl text-muted-foreground font-medium">
              {t('home.events.subtitle')}
            </p>
          </div>
          <Link href="/events">
            <Button variant="ghost" className="text-xl font-bold text-primary hover:text-secondary group">
              {t('home.events.cta')}
              {isRtl ? (
                <ArrowLeft className="ml-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.slice(0, 2).map(event => (
            <Link key={event.id} href={`/events/${event.slug}`}>
              <div className="flex bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-border/50 overflow-hidden cursor-pointer group h-full">
                <div className="w-1/3 bg-muted/30 relative">
                  <img loading="lazy" decoding="async" src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="w-2/3 p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4 text-secondary" />
                    <span>{event.date}</span>
                  </div>
                  <h3 className="text-xl font-black text-primary group-hover:text-secondary transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function DonateBanner() {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-secondary text-white text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px]" />
      <div className="container relative z-10 mx-auto px-4 md:px-8">
        <h2 className="text-4xl md:text-5xl font-black mb-6">{t('home.donate.title')}</h2>
        <p className="text-xl font-medium mb-10 max-w-2xl mx-auto">
          {t('home.donate.subtitle')}
        </p>
        <Link href="/donate">
          <Button size="lg" className="h-16 px-10 text-xl font-bold bg-white text-secondary hover:bg-white/90 rounded-full shadow-xl hover:shadow-2xl transition-all">
            {t('home.donate.cta')}
          </Button>
        </Link>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <SiteLayout>
      <Hero />
      <Stats />
      <Pillars />
      <PeopleOfDetermination />
      <Jamboree />
      <FeaturedStories />
      <VideoPreview />
      <StorePreview />
      <EventsPreview />
      <DonateBanner />
      <JoinSection />
    </SiteLayout>
  );
}

