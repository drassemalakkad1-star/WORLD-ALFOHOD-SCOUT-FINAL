import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowLeft, ArrowRight } from "lucide-react";
import jamboreeImg from "@/assets/images/jamboree.webp";

export function Jamboree() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  return (
    <section id="jamboree" className="py-24 relative overflow-hidden bg-primary text-white">
      <div className="absolute inset-0 z-0">
        <img loading="lazy" decoding="async"
          src={jamboreeImg}
          alt={t('home.jamboree.title1')}
          className="w-full h-full object-cover object-center opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent border border-accent/30 font-bold mb-6 text-lg">
              {t('home.jamboree.badge')}
            </span>
            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              {t('home.jamboree.title1')} <br /> <span className="text-secondary">{t('home.jamboree.title2')}</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 text-xl font-bold">
              <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <Calendar className="h-6 w-6 text-accent" />
                <span>{t('home.jamboree.date')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <MapPin className="h-6 w-6 text-accent" />
                <span>{t('home.jamboree.location')}</span>
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-12 font-medium max-w-3xl mx-auto">
              {t('home.jamboree.desc')}
            </p>
            
            <Button size="lg" className="h-16 px-10 text-xl font-bold bg-accent text-primary hover:bg-accent/90 rounded-full group shadow-[0_0_40px_rgba(245,176,65,0.4)] hover:shadow-[0_0_60px_rgba(245,176,65,0.6)] transition-all">
              {t('home.jamboree.cta')}
              {isRtl ? (
                <ArrowLeft className="ml-2 h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
