import * as schema from "../../shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless"; // أو حسب نوع قاعدة بياناتك
// إذا كنت تستخدم التخزين المحلي المؤقت كما يظهر في Terminal
import { db } from "../db";

async function seed() {
    console.log("🌱 بدء إضافة قنوات اليوتيوب الكشفية لمجموعة الفهود...");

    // التأكد من وجود جدول الموارد
    const targetTable = (schema as any).resources || (schema as any).youtubeChannels;

    if (!db || !targetTable) {
        console.error("❌ خطأ: لم يتم العثور على قاعدة البيانات أو الجدول. تأكد من إعداد DATABASE_URL.");
        return;
    }

    const youtubeChannels = [
        {
            title: "قناة مهارات الكشافة للأسوياء",
            url: "https://www.youtube.com/@scoutskills",
            category: "general",
            description: "فيديوهات العقد والربطات وحياة الخلاء"
        },
        {
            title: "قناة الترويح العلاجي والدمج",
            url: "https://www.youtube.com/@therapeutic-scouting",
            category: "special-needs",
            description: "برامج الدمج والأنشطة الترويحية لذوي الهمم"
        }
    ];

    for (const channel of youtubeChannels) {
        try {
            await db.insert(targetTable).values({
                title: channel.title,
                url: channel.url,
                type: "video",
                category: channel.category,
                description: channel.description
            });
            console.log(`✅ تمت إضافة: ${channel.title}`);
        } catch (err) {
            console.error(`❌ خطأ في إضافة ${channel.title}:`, err);
        }
    }

    console.log("🏁 تم الانتهاء من تحديث البيانات بنجاح!");
}

seed().catch(console.error);