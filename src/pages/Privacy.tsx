import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";

export default function Privacy() {
  return (
    <SiteLayout>
      <PageHero
        title="سياسة الخصوصية"
        breadcrumbs={[{ label: "سياسة الخصوصية", href: "/privacy" }]}
      />
      <section className="container mx-auto px-4 md:px-8 py-16 max-w-3xl">
        <article className="prose prose-lg max-w-none text-right space-y-6 leading-loose">
          <h2 className="text-2xl font-bold text-primary">١. البيانات التي نجمعها</h2>
          <p className="text-muted-foreground">
            نجمع المعلومات الأساسية التي تقدمها عند التسجيل (الاسم، البريد الإلكتروني، تاريخ الميلاد)،
            بالإضافة إلى بيانات استخدامك للمنصة لتحسين تجربتك.
          </p>

          <h2 className="text-2xl font-bold text-primary">٢. كيف نستخدم بياناتك</h2>
          <p className="text-muted-foreground">
            نستخدم بياناتك لإدارة حسابك، تخصيص تجربتك التعليمية، إرسال تحديثات الفعاليات،
            وحماية المنصة من الاستخدام غير المشروع. لا نبيع بياناتك لأي طرف ثالث.
          </p>

          <h2 className="text-2xl font-bold text-primary">٣. حماية الأطفال</h2>
          <p className="text-muted-foreground">
            نولي اهتماماً خاصاً لحماية بيانات الأطفال والشباب. تخضع جميع الحسابات للأطفال دون
            ١٣ عاماً لإشراف ولي الأمر، ولا نشارك أي معلومات شخصية للأطفال.
          </p>

          <h2 className="text-2xl font-bold text-primary">٤. ملفات تعريف الارتباط (Cookies)</h2>
          <p className="text-muted-foreground">
            نستخدم ملفات تعريف الارتباط لحفظ تفضيلاتك (اللغة، الوضع الداكن، إعدادات الوصول)
            وتحسين أداء المنصة. يمكنك تعطيلها من إعدادات متصفحك.
          </p>

          <h2 className="text-2xl font-bold text-primary">٥. حقوقك</h2>
          <p className="text-muted-foreground">
            لديك الحق في الوصول إلى بياناتك، تعديلها، أو طلب حذفها في أي وقت. تواصل معنا عبر
            صفحة "اتصل بنا" لممارسة هذه الحقوق.
          </p>

          <h2 className="text-2xl font-bold text-primary">٦. التواصل</h2>
          <p className="text-muted-foreground">
            لأي استفسار حول الخصوصية، راسلنا على: <span dir="ltr">privacy@cheetahscity.org</span>
          </p>

          <p className="text-sm text-muted-foreground pt-8 border-t">
            آخر تحديث: أبريل ٢٠٢٦
          </p>
        </article>
      </section>
    </SiteLayout>
  );
}
