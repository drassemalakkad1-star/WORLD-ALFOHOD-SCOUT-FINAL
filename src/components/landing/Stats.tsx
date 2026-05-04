import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function Stats() {
  const { t } = useTranslation();

  const stats = [
    { label: t('home.stats.activeScouts'), value: "57M+", prefix: t('home.stats.moreThan') },
    { label: t('home.stats.countries'), value: "174", prefix: "" },
    { label: t('home.stats.volunteers'), value: "5M+", prefix: t('home.stats.moreThan') },
    { label: t('home.stats.annualEvents'), value: "10k+", prefix: "" },
  ];

  return (
    <section className="py-12 bg-primary/5 border-y border-primary/10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="text-center"
            >
              <div className="text-sm font-bold text-muted-foreground mb-1">
                {stat.prefix}
              </div>
              <div className="text-3xl md:text-5xl font-black text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base font-bold text-secondary uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
