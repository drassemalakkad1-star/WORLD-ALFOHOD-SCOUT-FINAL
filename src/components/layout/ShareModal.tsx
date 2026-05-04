import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, X, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

const platforms = [
  {
    name: "WhatsApp",
    color: "#25D366",
    hoverColor: "#1da851",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
      </svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
  },
  {
    name: "Facebook",
    color: "#1877F2",
    hoverColor: "#0d65d8",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Messenger",
    color: "#0099FF",
    hoverColor: "#007acc",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.652V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z"/>
      </svg>
    ),
    getUrl: (url: string) =>
      `https://m.me/?link=${encodeURIComponent(url)}`,
  },
  {
    name: "Telegram",
    color: "#26A5E4",
    hoverColor: "#1a8fc0",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "Twitter / X",
    color: "#000000",
    hoverColor: "#333333",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "LinkedIn",
    color: "#0A66C2",
    hoverColor: "#0852a0",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    getUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Instagram",
    color: "#E1306C",
    hoverColor: "#c52460",
    gradient: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
    getUrl: (url: string) =>
      `https://www.instagram.com/`,
    action: (url: string) => {
      navigator.clipboard.writeText(url);
      toast.info("تم نسخ الرابط — افتح Instagram ولصق الرابط في قصتك أو رسالتك");
    },
  },
  {
    name: "Snapchat",
    color: "#FFFC00",
    hoverColor: "#e6e300",
    textColor: "#000000",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.317 4.814l-.004.08c-.012.322-.023.637-.02.929.15.04.625.138 1.216-.048a1.49 1.49 0 0 1 .96.007c.36.138.583.443.583.795 0 .424-.316.832-.93 1.21a4.94 4.94 0 0 1-.318.174c-.55.283-1.236.636-1.47 1.2-.015.032-.025.066-.038.099l-.013.032c-.182.467.01.953.252 1.481.127.28.259.569.328.867.14.61.037 1.126-.319 1.53-.348.396-.895.644-1.615.735a2.68 2.68 0 0 1-.275.021c-.133 0-.269-.012-.407-.035-.243.499-.64 1.08-1.277 1.08-.217 0-.45-.063-.715-.192-.415-.2-.848-.31-1.225-.31-.35 0-.755.104-1.12.292-.307.158-.6.238-.868.238-.643 0-1.034-.55-1.277-1.049a3.56 3.56 0 0 1-.407.034c-.09 0-.183-.007-.275-.02-.72-.091-1.267-.34-1.615-.736-.356-.404-.458-.92-.32-1.53.07-.298.201-.587.329-.867.241-.528.433-1.014.251-1.48l-.014-.033c-.012-.033-.022-.067-.037-.099-.234-.564-.92-.917-1.47-1.2a4.94 4.94 0 0 1-.318-.174c-.614-.378-.93-.786-.93-1.21 0-.352.223-.657.582-.795.286-.11.592-.09.896.007.61.19 1.088.091 1.238.05l-.003-.08c-.085-1.595-.212-3.622.317-4.814C7.859 1.07 11.216.793 12.206.793z"/>
      </svg>
    ),
    getUrl: (url: string) => `https://www.snapchat.com/`,
    action: (url: string) => {
      navigator.clipboard.writeText(url);
      toast.info("تم نسخ الرابط — الصقه في Snapchat");
    },
  },
];

export function ShareModal({ open, onClose, url, title = "" }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("تم نسخ الرابط بنجاح ✓");
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePlatformShare = (platform: typeof platforms[0]) => {
    if (platform.action) {
      platform.action(url);
      return;
    }
    // Instead of opening an external window, copy the share URL + toast
    const shareUrl = platform.getUrl(url, title);
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success(`تم نسخ رابط المشاركة عبر ${platform.name} ✓`);
    }).catch(() => {
      // Fallback: try native share
      if (navigator.share) {
        navigator.share({ title, url }).catch(() => {});
      } else {
        toast.info(`افتح ${platform.name} والصق الرابط: ${url}`);
      }
    });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-border/50 bg-card shadow-2xl p-0 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent px-8 pt-8 pb-6">
          <div className="flex items-center justify-between mb-1">
            <DialogTitle className="text-xl font-black text-primary flex items-center gap-2">
              <Share2 className="w-5 h-5 text-secondary" />
              مشاركة المحتوى
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-primary transition-colors rounded-full p-1 hover:bg-muted/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {title && (
            <p className="text-sm text-muted-foreground line-clamp-1 font-medium mt-1">{title}</p>
          )}
        </div>

        <div className="px-8 pb-8 space-y-6">
          {/* Social platforms grid */}
          <div className="grid grid-cols-4 gap-4">
            {platforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handlePlatformShare(platform)}
                className="flex flex-col items-center gap-2 group"
                title={platform.name}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl group-active:scale-95"
                  style={{
                    background: platform.gradient || platform.color,
                    color: platform.textColor || "#ffffff",
                  }}
                >
                  {platform.icon}
                </div>
                <span className="text-[11px] font-bold text-muted-foreground group-hover:text-primary transition-colors text-center leading-tight">
                  {platform.name}
                </span>
              </button>
            ))}
            {/* Native Share (mobile) */}
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-2 group"
                title="مشاركة"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md bg-muted/80 text-primary transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl group-hover:bg-primary group-hover:text-white group-active:scale-95">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground group-hover:text-primary transition-colors text-center">
                  مشاركة
                </span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground font-medium">أو انسخ الرابط</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Copy link */}
          <div className="flex gap-2">
            <Input
              value={url}
              readOnly
              className="bg-muted/30 border-border/50 text-sm font-mono rounded-xl h-11 flex-1 text-muted-foreground select-all"
              dir="ltr"
            />
            <Button
              onClick={handleCopy}
              className={`rounded-xl h-11 px-5 font-bold gap-2 transition-all duration-300 ${
                copied
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-primary hover:bg-primary/90 text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  تم
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  نسخ
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
