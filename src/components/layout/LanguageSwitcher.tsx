import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LANGUAGES, applyLanguageDirection, isRTL } from "@/lib/i18n";

interface Props {
  variant?: "icon" | "compact" | "full";
}

export function LanguageSwitcher({ variant = "compact" }: Props) {
  const { i18n, t } = useTranslation();
  const normalize = (l?: string) => (l || "").toLowerCase().split(/[-_]/)[0];
  const activeCode =
    normalize(i18n.resolvedLanguage) ||
    normalize(i18n.language) ||
    "ar";
  const current =
    LANGUAGES.find(l => l.code === activeCode) || LANGUAGES[1]; // fallback English

  const dir = isRTL(activeCode) ? "rtl" : "ltr";

  const change = (code: string) => {
    i18n.changeLanguage(code);
    applyLanguageDirection(code);
  };

  return (
    <DropdownMenu dir={dir as any}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={
            variant === "icon"
              ? "h-9 w-9 p-0 rounded-full text-primary hover:text-secondary"
              : "h-9 px-2.5 gap-1.5 rounded-full text-primary hover:text-secondary font-bold text-xs"
          }
          aria-label={t("nav.language", "Language")}
          data-testid="button-language-switcher"
        >
          <Globe className="h-4 w-4 shrink-0" />
          {variant !== "icon" && (
            <span className="hidden lg:inline truncate max-w-[80px]">
              {current.name}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 p-2 rounded-xl shadow-xl border border-border bg-card max-h-[70vh] overflow-y-auto"
      >
        <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("nav.language", "Language")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map(lang => {
          const active = current.code === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => change(lang.code)}
              className={`gap-3 cursor-pointer rounded-lg py-2.5 ${
                active ? "bg-secondary/10 text-secondary font-bold" : ""
              }`}
              data-testid={`menu-lang-${lang.code}`}
            >
              <span className="text-lg leading-none shrink-0" aria-hidden>
                {lang.flag}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm leading-tight">{lang.name}</div>
                <div className="text-[11px] text-muted-foreground leading-tight">
                  {lang.english}
                </div>
              </div>
              {active && <Check className="h-4 w-4 text-secondary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
