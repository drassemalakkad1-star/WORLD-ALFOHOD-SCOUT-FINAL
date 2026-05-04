import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import heroImg from "@/assets/images/hero.webp";

export function Hero() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-primary text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent z-10" />
        <img
          src={heroImg}
          alt={t('home.hero.title1')}
          className="w-full h-full object-cover object-center opacity-100"
          loading="eager"
          decoding="async"
          // @ts-expect-error fetchpriority is a valid HTML attr not yet typed in React
          fetchpriority="high"
        />
      </div>

      <div className="container relative z-20 mx-auto px-4 md:px-8 py-20">
        <div className="max-w-3xl bg-black/30 backdrop-blur-sm p-6 rounded-3xl border border-white/10 block w-fit">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30 font-bold mb-6">
              {t('home.hero.badge')}
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-[1.2] mb-4">
              {t('home.hero.title1')} <span className="text-secondary">{t('home.hero.title2')}</span>
              <br />
              {t('home.hero.title3')}
            </h1>
            <p className="text-lg md:text-xl text-white leading-relaxed mb-10 max-w-2xl font-medium">
              {t('home.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-16 px-8 text-xl font-bold bg-secondary text-white hover:bg-secondary/90 rounded-full group">
                {t('home.hero.ctaJoin')}
                {isRtl ? (
                  <ArrowLeft className="ml-2 h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-8 text-xl font-bold rounded-full border-white/30 hover:bg-white/10 text-white">
                {t('home.hero.ctaExplore')}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      />
    </section>
  );
}
