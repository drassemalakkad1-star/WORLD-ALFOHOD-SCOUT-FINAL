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

              <div className="bg-muted/30 p-8 rounded-3xl">
                <h3 className="text-2xl font-bold text-primary mb-6">آخر أخبار الإقليم</h3>
                <div className="text-muted-foreground font-medium text-center py-8">
                  لا توجد أخبار حديثة لهذا الإقليم.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
