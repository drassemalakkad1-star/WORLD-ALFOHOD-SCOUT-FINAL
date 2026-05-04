import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { useParams } from "wouter";
import { regions } from "@/data/regions";
import NotFound from "./not-found";
import { Users, User, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const region = regions.find(r => r.slug === slug);

  if (!region) return <NotFound />;

  return (
    <SiteLayout>
      <PageHero
        title={region.name}
        description={`إقليم ${region.name} في عالم الفهود الكشفي والإرشادي.`}
        breadcrumbs={[
          { label: "المناطق", href: "/regions" },
          { label: region.name, href: `/regions/${slug}` }
        ]}
      />
      
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-black text-primary mb-6">نظرة عامة</h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-12">
                {region.description}
              </p>

              {region.countries && (
                <>
                  <h2 className="text-3xl font-black text-primary mb-6 flex items-center gap-3">
                    <Users className="h-8 w-8 text-secondary" />
                    الدول الأعضاء ({region.memberCount})
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                    {region.countries.map((country, i) => (
                      <div key={i} className="bg-muted/30 p-4 rounded-xl font-bold text-primary text-center">
                        {country}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div>
              <Card className="border-none shadow-xl bg-gradient-to-b from-primary to-primary/90 text-white overflow-hidden mb-8">
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{region.director}</h3>
                  <p className="text-white/70 mb-8 font-medium">المدير الإقليمي</p>
                  <Button variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white">
                    تواصل مع المكتب الإقليمي
                  </Button>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-right mb-16">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-6 border-r-4 border-secondary pr-4">القيادة الإقليمية</h3>
                <div className="bg-muted/20 p-6 rounded-2xl border border-border/50">
                   <div className="flex items-center gap-4 mb-4">
                     <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                       {region.name.charAt(0)}
                     </div>
                     <div>
                       <div className="font-black text-primary text-xl">المكتب الإقليمي</div>
                       <div className="text-secondary font-bold">لإقليم {region.name}</div>
                     </div>
                   </div>
                   <p className="text-muted-foreground text-sm leading-relaxed">
                     يعمل المكتب الإقليمي على التنسيق بين الجمعيات الوطنية الكشفية في المنطقة، وتوفير الدعم التقني واللوجستي لضمان جودة البرامج الكشفية المنفذة.
                   </p>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary mb-6 border-r-4 border-secondary pr-4">الرؤية الاستراتيجية</h3>
                <p className="text-muted-foreground leading-relaxed">
                  نسعى في إقليم {region.name} إلى أن نكون القوة التربوية الشبابية الرائدة في المنطقة، من خلال تمكين 100 مليون شاب ليكونوا مواطنين فاعلين يحدثون تغييراً إيجابياً في مجتمعاتهم وفي العالم، بناءً على القيم الكشفية.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="bg-secondary/10 text-secondary px-4 py-2 rounded-full font-bold text-sm">تمكين الشباب</span>
                  <span className="bg-secondary/10 text-secondary px-4 py-2 rounded-full font-bold text-sm">التنمية المستدامة</span>
                  <span className="bg-secondary/10 text-secondary px-4 py-2 rounded-full font-bold text-sm">الابتكار الكشفي</span>
                </div>
              </div>
            </div>

            <div className="bg-secondary p-12 rounded-[3rem] text-white text-center shadow-2xl shadow-secondary/20 overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-6">اكتشف الكشافة في {region.name}</h2>
                <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
                  انضم إلى ملايين الكشافة في هذه المنطقة وكن جزءاً من أكبر حركة شبابية في العالم.
                </p>
                <Button size="lg" className="bg-white text-secondary hover:bg-white/90 rounded-full px-12 h-16 text-xl font-black">
                  عرض الجمعيات الوطنية
                </Button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
