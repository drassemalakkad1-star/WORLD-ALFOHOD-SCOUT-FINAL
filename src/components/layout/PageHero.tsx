import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PageHeroProps {
  title: string;
  description?: string;
  image?: string;
  breadcrumbs?: { label: string; href: string }[];
}

export function PageHero({ title, description, image, breadcrumbs = [] }: PageHeroProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-primary text-white min-h-[40vh] flex flex-col justify-center">
      {image && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
          <img loading="lazy" decoding="async"
            src={image}
            alt={title}
            className="w-full h-full object-cover object-center opacity-100"
          />
        </div>
      )}
      <div className="container relative z-20 mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <nav className="flex flex-wrap items-center gap-2 text-white/70 text-sm font-medium mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              {t('nav.home')}
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                <ChevronIcon className="h-4 w-4" />
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-white">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-white transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          
          <div className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10 block w-fit max-w-full">
            <h1 className="text-2xl md:text-3xl font-black mb-2 leading-tight">{title}</h1>
            {description && (
              <p className="text-base md:text-lg text-white max-w-3xl leading-relaxed font-medium">
                {description}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
