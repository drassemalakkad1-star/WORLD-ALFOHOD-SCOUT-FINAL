import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function JoinSection() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/40 mix-blend-multiply z-10" />
      <div className="container relative z-20 mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
            {t('home.join.title')}
          </h2>
          <p className="text-xl md:text-2xl text-white/80 mb-12 font-medium">
            {t('home.join.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register">
              <Button size="lg" className="h-16 px-10 text-xl font-bold bg-secondary text-white hover:bg-secondary/90 rounded-full group">
                {t('home.join.ctaJoin')}
                {isRtl ? (
                  <ArrowLeft className="ml-2 h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
            </Link>
            <Link href="/volunteer">
              <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bold rounded-full border-white/30 text-white hover:bg-white/10">
                {t('home.join.ctaVolunteer')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
