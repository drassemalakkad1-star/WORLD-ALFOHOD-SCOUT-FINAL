import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";

export default function Terms() {
  return (
    <SiteLayout>
      <PageHero
        title="شروط الخدمة"
        breadcrumbs={[{ label: "شروط الخدمة", href: "/terms" }]}
      />
      <section className="container mx-auto px-4 md:px-8 py-16 max-w-3xl">
        <article className="prose prose-lg max-w-none text-right space-y-6 leading-loose">
          <h2 className="text-2xl font-bold text-primary">١. القبول بالشروط</h2>
          <p className="text-muted-foreground">
            باستخدامك لمنصة عالم الفهود، فإنك توافق على الالتزام بهذه الشروط والأحكام.
            إذا كنت لا توافق على أي جزء من هذه الشروط، فيرجى التوقف عن استخدام الخدمة.
          </p>

          <h2 className="text-2xl font-bold text-primary">٢. استخدام الحساب</h2>
          <p className="text-muted-foreground">
            أنت مسؤول عن الحفاظ على سرية بيانات الدخول الخاصة بك وعن جميع الأنشطة التي تتم
            تحت حسابك. يجب إبلاغنا فوراً بأي استخدام غير مصرح به.
          </p>

          <h2 className="text-2xl font-bold text-primary">٣. السلوك المقبول</h2>
          <p className="text-muted-foreground">
            يلتزم جميع المستخدمين باحترام قيم الحركة الكشفية والإرشادية، وعدم نشر أي محتوى
            مسيء أو مخالف للقوانين أو ضار بالأطفال والشباب.
          </p>

          <h2 className="text-2xl font-bold text-primary">٤. الملكية الفكرية</h2>
          <p className="text-muted-foreground">
            جميع المحتويات على الموقع — من نصوص ورسومات وشعارات ودورات — هي ملك لـ "عالم الفهود"
            ومحمية بموجب قوانين الملكية الفكرية. لا يجوز نسخها أو إعادة استخدامها بدون إذن.
          </p>

          <h2 className="text-2xl font-bold text-primary">٥. تعديل الشروط</h2>
          <p className="text-muted-foreground">
            نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إعلام المستخدمين بأي تغييرات جوهرية
            عبر البريد الإلكتروني أو إشعار داخل المنصة.
          </p>

          <p className="text-sm text-muted-foreground pt-8 border-t">
            آخر تحديث: أبريل ٢٠٢٦
          </p>
        </article>
      </section>
    </SiteLayout>
  );
}
