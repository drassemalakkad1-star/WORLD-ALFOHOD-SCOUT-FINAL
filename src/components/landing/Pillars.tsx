import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Compass, Users, Target, Shield } from "lucide-react";

export function Pillars() {
  const { t } = useTranslation();

  const pillars = [
    {
      icon: Compass,
      title: t('home.pillars.leadership.title'),
      desc: t('home.pillars.leadership.desc'),
    },
    {
      icon: Users,
      title: t('home.pillars.community.title'),
      desc: t('home.pillars.community.desc'),
    },
    {
      icon: Target,
      title: t('home.pillars.skills.title'),
      desc: t('home.pillars.skills.desc'),
    },
    {
      icon: Shield,
      title: t('home.pillars.values.title'),
      desc: t('home.pillars.values.desc'),
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-primary mb-6">
            {t('home.pillars.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            {t('home.pillars.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-card border border-border/50 hover:border-secondary/50 hover:shadow-xl transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-secondary/10 transition-colors">
                <pillar.icon className="w-8 h-8 text-primary group-hover:text-secondary transition-colors" />
              </div>
              <h3 className="text-2xl font-black text-primary mb-4">{pillar.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
