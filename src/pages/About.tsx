import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getLeadership, urlFor } from "@/lib/sanityClient";
import aboutHeroImg from "@/assets/images/about-hero.webp";

export default function About() {
  const { t } = useTranslation();
  const { data: leaders, isLoading } = useQuery({
    queryKey: ["leadership"],
    queryFn: getLeadership,
  });

  return (
    <SiteLayout>
      <PageHero
        title={t('about.title')}
        description={t('about.subtitle')}
        image={aboutHeroImg}
        breadcrumbs={[{ label: t('about.title'), href: "/about" }]}
      />
      
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto mb-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-black text-primary mb-6"
            >
              {t('about.historyTitle').split(' ')[0]} <span className="text-secondary">{t('about.historyTitle').split(' ').slice(1).join(' ')}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              {t('about.historyDesc')}
            </motion.p>
          </div>

          <div className="mb-20">
            <h3 className="text-3xl font-bold text-primary mb-10 text-center">{t('about.leadershipTitle')}</h3>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {leaders?.map((leader: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-3xl shadow-xl border border-border/50 text-center hover:shadow-2xl transition-all group"
                  >
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 bg-secondary/20 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
                      {leader.image ? (
                        <img
                          src={urlFor(leader.image).width(200).height(200).url()}
                          alt={leader.name}
                          className="w-full h-full rounded-full object-cover shadow-lg relative z-10"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold shadow-lg relative z-10">
                          {leader.name?.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-primary mb-2">{leader.name}</h4>
                    <p className="text-secondary font-bold text-sm mb-4">{leader.rank}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {leader.bio}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 mb-20 text-center">
            <h3 className="text-3xl font-bold text-primary mb-6">{t('about.reportsTitle')}</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('about.reportsDesc')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 rounded-full font-bold">
                {t('about.report2023')} <Download className="mr-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full font-bold">
                {t('about.report2022')} <Download className="mr-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
