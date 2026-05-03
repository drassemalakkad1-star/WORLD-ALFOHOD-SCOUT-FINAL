import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getLeadership, urlFor } from "@/lib/sanityClient";
import aboutHeroImg from "@/assets/images/about-hero.webp";

export default function About() {
  const { data: leaders, isLoading } = useQuery({
    queryKey: ["leadership"],
    queryFn: getLeadership,
  });

  return (
    <SiteLayout>
      <PageHero
        title="من نحن"
        description="حركة شبابية عالمية تهدف إلى تمكين الشباب وبناء قادة المستقبل."
        image={aboutHeroImg}
        breadcrumbs={[{ label: "من نحن", href: "/about" }]}
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
              تاريخ <span className="text-secondary">الحركة</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              تأسست عام ١٩٠٧ الكشافة الأصلية وتحولت إلى عالم الفهود الكشفي والإرشادي في مسيرة قرن من الزمان، بهدف واحد: ترك العالم أفضل مما وجدناه.
            </motion.p>
          </div>

          <div className="mb-20">
            <h3 className="text-3xl font-bold text-primary mb-10 text-center">فريق القيادة</h3>
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
            <h3 className="text-3xl font-bold text-primary mb-6">التقارير السنوية</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              نلتزم بالشفافية الكاملة في جميع أعمالنا. اقرأ تقاريرنا السنوية لمعرفة المزيد عن تأثيرنا المالي والمجتمعي.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 rounded-full font-bold">
                تقرير ٢٠٢٣ <Download className="mr-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full font-bold">
                تقرير ٢٠٢٢ <Download className="mr-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
