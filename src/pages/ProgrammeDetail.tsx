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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-right mb-16">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-4 border-r-4 border-secondary pr-4">الأهداف الاستراتيجية</h3>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-2 rounded-full bg-secondary shrink-0" />
                    تمكين الشباب من المهارات القيادية اللازمة لمواجهة تحديات المستقبل.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-2 rounded-full bg-secondary shrink-0" />
                    تعزيز ثقافة السلام والحوار بين الأديان والثقافات المختلفة.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-2 rounded-full bg-secondary shrink-0" />
                    المساهمة الفعالة في تحقيق أهداف التنمية المستدامة (SDGs).
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary mb-4 border-r-4 border-secondary pr-4">منهجية العمل</h3>
                <p className="text-muted-foreground leading-relaxed">
                  تعتمد المنهجية على "التعلم بالممارسة" من خلال مجموعات صغيرة وبإشراف قادة مؤهلين. نستخدم النظام الكشفي العالمي لضمان جودة المخرجات التعليمية والتربوية، مع مراعاة الخصوصية الثقافية والبيئية لكل مجتمع.
                </p>
              </div>
            </div>
            
            <div className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/10">
              <h3 className="text-2xl font-bold text-primary mb-4">هل أنت مستعد لتكون جزءاً من التغيير؟</h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                انضم إلينا اليوم وابدأ رحلتك في تعلم مهارات جديدة، تكوين صداقات عالمية، وترك بصمة إيجابية في العالم.
              </p>
              <Button size="lg" className="h-16 px-10 text-xl font-bold bg-primary text-white hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20">
                انضم إلى البرنامج الآن
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
