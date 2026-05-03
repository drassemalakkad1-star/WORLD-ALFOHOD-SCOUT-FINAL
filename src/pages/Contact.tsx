import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Contact() {
  return (
    <SiteLayout>
      <PageHero
        title="اتصل بنا"
        description="نحن هنا للإجابة على استفساراتكم. تواصلوا مع مكاتبنا حول العالم."
        breadcrumbs={[{ label: "اتصل بنا", href: "/contact" }]}
      />
      
      <section className="py-20 bg-muted/10">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            <div>
              <h2 className="text-3xl font-black text-primary mb-8">أرسل لنا رسالة</h2>
              <ContactForm />
            </div>
            
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-primary mb-8">مكاتبنا العالمية</h2>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
                <h3 className="text-xl font-bold text-primary mb-4">المكتب الرئيسي (سويسرا)</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-secondary shrink-0" />
                    <span>1 Rue de la Ville, 1205 Geneva, Switzerland</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-secondary shrink-0" />
                    <span dir="ltr">+41 22 705 10 10</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-secondary shrink-0" />
                    <span dir="ltr">educational.times2025@gmail.com</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
                <h3 className="text-xl font-bold text-primary mb-4">المكتب الإقليمي العربي (مصر)</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-secondary shrink-0" />
                    <span>مدينة نصر، القاهرة، جمهورية مصر العربية</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-secondary shrink-0" />
                    <span dir="ltr">+20 2 2261 4321</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-secondary shrink-0" />
                    <span dir="ltr">arab@cheetahscity.org</span>
                  </div>
                </div>
              </div>

              <div className="h-64 rounded-2xl overflow-hidden relative bg-muted/30 border border-border/50 flex items-center justify-center">
                {/* SVG Map Placeholder */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                <MapPin className="h-12 w-12 text-secondary z-10" />
                <span className="absolute bottom-4 right-4 text-sm font-bold text-muted-foreground z-10">خريطة المكاتب</span>
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
