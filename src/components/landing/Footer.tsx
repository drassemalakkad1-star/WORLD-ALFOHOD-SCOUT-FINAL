import { useState } from "react";
import { Link } from "wouter";
import { PawPrint, Mail, MapPin, Phone, X } from "lucide-react";
import { SiFacebook, SiX, SiInstagram, SiYoutube } from "react-icons/si";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const QUICK_LINKS = [
  { label: "من نحن", href: "/about" },
  { label: "ما نقوم به", href: "/what-we-do" },
  { label: "الأكاديمية", href: "/academy" },
  { label: "الألعاب", href: "/games" },
  { label: "التطوع", href: "/get-involved" },
  { label: "اتصل بنا", href: "/contact" },
];

const SOCIAL_LINKS = [
  { label: "Facebook",  url: "https://www.facebook.com",  icon: SiFacebook },
  { label: "Twitter",   url: "https://www.twitter.com",   icon: SiX },
  { label: "Instagram", url: "https://www.instagram.com", icon: SiInstagram },
  { label: "Youtube",   url: "https://www.youtube.com",   icon: SiYoutube },
];

export function Footer() {
  const [socialModal, setSocialModal] = useState<{ label: string; url: string } | null>(null);

  return (
    <>
      <footer className="bg-primary text-white pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 hover:opacity-90 transition-opacity" data-testid="link-footer-home">
              <PawPrint className="h-10 w-10 text-secondary" strokeWidth={2.5} />
              <span className="font-black text-3xl tracking-tight">عالم الفهود</span>
            </Link>
            <p className="text-white/70 text-lg leading-relaxed max-w-md mb-8 font-medium">
              حركة شبابية عالمية تهدف إلى تمكين الشباب وبناء قادة المستقبل. نؤمن بأن كل شاب يمتلك القدرة على تغيير العالم.
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map(({ label, url, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setSocialModal({ label, url })}
                  aria-label={label}
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors"
                  data-testid={`link-social-${label.toLowerCase()}`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 text-secondary">روابط سريعة</h4>
            <ul className="space-y-4 text-lg font-medium text-white/80">
              {QUICK_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors" data-testid={`link-footer-${link.href.replace("/", "")}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-6 text-secondary">تواصل معنا</h4>
            <ul className="space-y-4 text-lg font-medium text-white/80">
              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-accent" />
                <span>المركز الكشفي العالمي</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent" />
                <span dir="ltr">educational.times2025@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent" />
                <span dir="ltr">+41 22 705 10 10</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/60 font-medium">
          <p>© ٢٠٢٤ عالم الفهود الكشفي والإرشادي. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-2 text-sm">
            <span>في إطار حركة عالمية</span>
            <PawPrint className="h-4 w-4 text-white/40" />
          </div>
        </div>
      </div>
    </footer>

    {/* Social Media In-Site Modal */}
    <Dialog open={!!socialModal} onOpenChange={(o) => !o && setSocialModal(null)}>
      <DialogContent className="max-w-[95vw] h-[85vh] p-0 overflow-hidden bg-black border-none">
        <DialogTitle className="sr-only">{socialModal?.label}</DialogTitle>
        <div className="absolute top-3 right-3 z-50">
          <button
            onClick={() => setSocialModal(null)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {socialModal && (
          <iframe
            src={socialModal.url}
            className="w-full h-full border-none"
            title={socialModal.label}
            allow="autoplay; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </DialogContent>
    </Dialog>
  </>
  );
}
