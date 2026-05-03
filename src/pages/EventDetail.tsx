import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { useParams } from "wouter";
import { events } from "@/data/events";
import NotFound from "./not-found";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const event = events.find(e => e.slug === slug);

  if (!event) return <NotFound />;

  return (
    <SiteLayout>
      <PageHero
        title={event.title}
        image={event.image}
        breadcrumbs={[
          { label: "الفعاليات", href: "/events" },
          { label: event.title, href: `/events/${slug}` }
        ]}
      />
      
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-black text-primary mb-6">عن الفعالية</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-12">
                {event.description}
              </p>

              <h2 className="text-3xl font-black text-primary mb-6">برنامج الفعالية</h2>
              <Accordion type="single" collapsible className="w-full" dir="rtl">
                {event.schedule?.map((item, i) => (
                  <AccordionItem value={`item-${i}`} key={i}>
                    <AccordionTrigger className="text-xl font-bold text-primary">{item.day}</AccordionTrigger>
                    <AccordionContent className="text-lg text-muted-foreground">
                      {item.activities}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div>
              <div className="bg-muted/20 p-8 rounded-3xl sticky top-28">
                <h3 className="text-2xl font-bold text-primary mb-6">تفاصيل الفعالية</h3>
                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <Calendar className="h-6 w-6 text-secondary shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-primary">التاريخ</div>
                      <div className="text-muted-foreground">{event.date} - {event.endDate}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-secondary shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-primary">الموقع</div>
                      <div className="text-muted-foreground">{event.location}</div>
                    </div>
                  </div>
                </div>
                <Button className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-full">
                  سجل الآن
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
