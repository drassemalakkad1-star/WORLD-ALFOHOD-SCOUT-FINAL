import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShoppingBag, Download, Star, X, Users } from "lucide-react";

type ActivityKind = "order" | "download" | "review" | "join";

type Activity = {
  id: string;
  kind: ActivityKind;
  text: string;
  timeAgo: string;
};

const NAMES = [
  "قائد من الإسكندرية",
  "يافع من الرياض",
  "متطوعة من تونس",
  "قائدة من بغداد",
  "والد من الدوحة",
  "كشاف من المدينة المنورة",
  "أكاديمي من بيروت",
  "مدربة من الدار البيضاء",
  "قائد من عمّان",
  "مرشد من القاهرة",
  "كشافة من دبي",
  "والدة من الكويت",
];

const ITEMS = [
  "دليل قائد المخيمات",
  "موسوعة العقد الكشفية",
  "حقيبة الفهود الميدانية",
  "قميص الفهود الرسمي",
  "كتاب الإسعافات الأولية",
  "بوصلة الاستكشاف الذهبية",
  "خيمة الفهد الجبلية",
  "مكتب الذكاء الاصطناعي للقادة",
  "دفتر يوميات الكشاف",
  "زي الناشئة الكامل",
];

const ICONS: Record<ActivityKind, JSX.Element> = {
  order: <ShoppingBag className="h-4 w-4" />,
  download: <Download className="h-4 w-4" />,
  review: <Star className="h-4 w-4 fill-current" />,
  join: <Users className="h-4 w-4" />,
};

const KIND_ACCENT: Record<ActivityKind, string> = {
  order: "#D4AF37",
  download: "#F5E199",
  review: "#FFD700",
  join: "#E6C56C",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeActivity(): Activity {
  const kind = pick<ActivityKind>(["order", "download", "review", "join"]);
  const name = pick(NAMES);
  const item = pick(ITEMS);
  let text = "";
  switch (kind) {
    case "order":
      text = `${name} اشترى ${item} الآن`;
      break;
    case "download":
      text = `${name} قام بتحميل ${item} الآن`;
      break;
    case "review":
      text = `${name} قيّم ${item} بـ 5 نجوم`;
      break;
    case "join":
      text = `${name} انضم إلى مجتمع الفهود`;
      break;
  }
  const minutes = Math.floor(Math.random() * 14) + 1;
  return {
    id: Math.random().toString(36).slice(2),
    kind,
    text,
    timeAgo: `قبل ${minutes} دقيقة`,
  };
}

interface Props {
  enabled?: boolean;
  intervalMs?: number;
  initialDelayMs?: number;
}

export function LiveActivityFeed({
  enabled = true,
  intervalMs = 9000,
  initialDelayMs = 4000,
}: Props) {
  const [current, setCurrent] = useState<Activity | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!enabled || dismissed) return;

    let intervalId: NodeJS.Timeout | null = null;
    const timeoutId = setTimeout(() => {
      setCurrent(makeActivity());
      intervalId = setInterval(() => {
        setCurrent(null);
        setTimeout(() => setCurrent(makeActivity()), 350);
      }, intervalMs);
    }, initialDelayMs);

    return () => {
      if (intervalId) clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [enabled, dismissed, intervalMs, initialDelayMs]);

  if (!enabled || dismissed) return null;

  return (
    <div
      className="fixed bottom-5 left-5 z-[60] pointer-events-none"
      data-testid="live-activity-feed"
    >
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-auto max-w-[340px] rounded-2xl border border-[#D4AF37]/30 bg-[#0a0a0a]/95 backdrop-blur shadow-2xl"
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.15)",
            }}
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `${KIND_ACCENT[current.kind]}1f`,
                  color: KIND_ACCENT[current.kind],
                  border: `1px solid ${KIND_ACCENT[current.kind]}55`,
                }}
              >
                {ICONS[current.kind]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-snug">
                  {current.text}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-[11px] text-white/60 font-medium">
                    {current.timeAgo}
                  </span>
                  <CheckCircle2 className="h-3 w-3 text-[#D4AF37] mr-auto" />
                </div>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="text-white/40 hover:text-white/80 transition-colors shrink-0"
                aria-label="إغلاق"
                data-testid="button-dismiss-live"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
