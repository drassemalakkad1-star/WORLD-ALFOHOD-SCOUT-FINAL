import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { useParams } from "wouter";
import { programmes } from "@/data/programmes";
import NotFound from "./not-found";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function ProgrammeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const programme = programmes.find(p => p.slug === slug);

  if (!programme) return <NotFound />;

  return (
    <SiteLayout>
      <PageHero
        title={programme.title}
        description={programme.description}
        image={programme.image}
        breadcrumbs={[
          { label: "ما نقوم به", href: "/what-we-do" },
          { label: programme.title, href: `/programmes/${slug}` }
        ]}
      />
      
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-primary mb-8">الأثر الميداني</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-muted/30 p-8 rounded-2xl">
                <div className="text-4xl font-black text-secondary mb-2" dir="ltr">{programme.stats.participants}</div>
                <div className="font-bold text-muted-foreground">مشارك</div>
              </div>
              <div className="bg-muted/30 p-8 rounded-2xl">
                <div className="text-4xl font-black text-secondary mb-2" dir="ltr">{programme.stats.projects}</div>
                <div className="font-bold text-muted-foreground">مشروع منجز</div>
              </div>
              <div className="bg-muted/30 p-8 rounded-2xl">
                <div className="text-4xl font-black text-secondary mb-2" dir="ltr">{programme.stats.hours}</div>
                <div className="font-bold text-muted-foreground">ساعة عمل</div>
              </div>
            </div>
            
            <Button size="lg" className="h-16 px-10 text-xl font-bold bg-primary text-white hover:bg-primary/90 rounded-full">
              انضم إلى البرنامج
            </Button>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
