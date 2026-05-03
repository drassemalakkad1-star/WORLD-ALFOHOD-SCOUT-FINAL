import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { useParams } from "wouter";
import { JoinForm } from "@/components/forms/JoinForm";
import NotFound from "./not-found";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2 } from "lucide-react";

export default function JoinRole() {
  const { role } = useParams<{ role: string }>();
  
  if (role !== "youth" && role !== "leader" && role !== "volunteer" && role !== "partner") {
    return <NotFound />;
  }

  const roleTitles = {
    youth: "كيافع",
    leader: "كقائد",
    volunteer: "كمتطوع",
    partner: "كشريك",
  };

  const title = `انضم إلينا ${roleTitles[role as keyof typeof roleTitles]}`;

  return (
    <SiteLayout>
      <PageHero
        title={title}
        breadcrumbs={[
          { label: "انضم إلينا", href: "/get-involved" },
          { label: title, href: `/join/${role}` }
        ]}
      />
      
      <section className="py-20 bg-muted/10">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-black text-primary mb-6">خطوات الانضمام</h2>
                <div className="space-y-6">
                  {[
                    "املأ استمارة التسجيل ببياناتك الصحيحة.",
                    "سيقوم فريقنا بالتواصل معك لتحديد موعد لمقابلة تعارف.",
                    "حضور اللقاء التعريفي الأول للتعرف على الحركة.",
                    "إتمام إجراءات العضوية والبدء في حضور الأنشطة."
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold shrink-0 mt-1">
                        {i + 1}
                      </div>
                      <p className="text-lg text-muted-foreground pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-black text-primary mb-6">المتطلبات الأساسية</h2>
                <ul className="space-y-4">
                  {["الالتزام بقيم ومبادئ عالم الفهود الكشفي والإرشادي.", "الرغبة الصادقة في التعلم والتطوير الذاتي.", "الموافقة على سياسة حماية الشباب والأطفال.", "التعهد بالمشاركة الفاعلة في الأنشطة المجدولة."].map((req, i) => (
                    <li key={i} className="flex items-center gap-3 text-lg text-muted-foreground">
                      <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-black text-primary mb-6">الأسئلة الشائعة</h2>
                <Accordion type="single" collapsible className="w-full bg-white rounded-2xl p-4 shadow-sm" dir="rtl">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-bold">هل هناك رسوم اشتراك؟</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                      تختلف الرسوم باختلاف المنظمة الوطنية في بلدك، ولكننا نسعى دائماً لتوفير فرص الدعم للمحتاجين.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-bold">كم يستغرق الرد على الطلب؟</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                      نقوم عادة بالتواصل مع المتقدمين خلال 3 إلى 5 أيام عمل من تاريخ تقديم الطلب.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
            
            <div>
              <Card className="border-none shadow-xl sticky top-28 bg-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-black text-primary mb-6 text-center">استمارة التسجيل المبدئي</h3>
                  <JoinForm role={role} />
                </CardContent>
              </Card>
            </div>
            
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
