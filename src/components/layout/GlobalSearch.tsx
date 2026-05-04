import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchAll, SearchResult } from "@/lib/globalSearch";
import { isRTL } from "@/lib/i18n";

const TYPE_LABEL: Record<SearchResult["type"], string> = {
  course: "Academy",
  game: "Games",
  news: "News",
  event: "Events",
  product: "Store",
  resource: "Library",
};

interface Props {
  variant?: "header" | "mobile";
  onNavigate?: () => void;
}

export function GlobalSearch({ variant = "header", onNavigate }: Props) {
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const dir = isRTL(i18n.language) ? "rtl" : "ltr";
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the query → 180ms
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 180);
    return () => clearTimeout(id);
  }, [query]);

  const results = useMemo(() => searchAll(debounced, 4), [debounced]);
  const hasResults = results.length > 0;
  const showPanel = open && (debounced.trim().length > 0);

  // Click outside closes
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Cmd/Ctrl + K to focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset highlight when results change
  useEffect(() => setHighlight(0), [debounced]);

  const goTo = (r: SearchResult) => {
    setLocation(r.href);
    setOpen(false);
    setQuery("");
    onNavigate?.();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight(h => Math.min(h + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (results[highlight]) {
        goTo(results[highlight]);
      } else if (debounced.trim()) {
        setLocation(`/search?q=${encodeURIComponent(debounced.trim())}`);
        setOpen(false);
        onNavigate?.();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const widthClass =
    variant === "mobile"
      ? "w-full"
      : "w-40 lg:w-52 xl:w-64";

  return (
    <div ref={containerRef} className={`relative ${widthClass}`} dir={dir}>
      <div className="relative">
        <Search
          className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none ${
            dir === "rtl" ? "right-3" : "left-3"
          }`}
        />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => debounced && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t("search.placeholder", "Search courses, games, news…")}
          aria-label={t("search.label", "Global search")}
          data-testid="input-global-search"
          className={`h-9 rounded-full bg-muted/50 border-border focus-visible:ring-secondary text-sm ${
            dir === "rtl" ? "pr-9 pl-9" : "pl-9 pr-9"
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full grid place-items-center text-muted-foreground hover:text-primary ${
              dir === "rtl" ? "left-2.5" : "right-2.5"
            }`}
            aria-label={t("search.clear", "Clear")}
            data-testid="button-search-clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showPanel && (
        <div
          className="absolute mt-2 w-full md:w-[28rem] max-w-[92vw] rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden"
          style={dir === "rtl" ? { right: 0 } : { left: 0 }}
          data-testid="panel-search-results"
        >
          {!hasResults ? (
            <div className="p-6 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground mb-2 hidden" />
              <p className="text-sm text-muted-foreground">
                {t("search.noResults", "No results for")}{" "}
                <span className="font-bold text-primary">"{debounced}"</span>
              </p>
            </div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto py-2">
              {results.map((r, i) => (
                <li key={`${r.type}-${r.id}`}>
                  <button
                    type="button"
                    onClick={() => goTo(r)}
                    onMouseEnter={() => setHighlight(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                      dir === "rtl" ? "text-right" : "text-left"
                    } ${highlight === i ? "bg-secondary/10" : "hover:bg-muted"}`}
                    data-testid={`result-${r.type}-${r.id}`}
                  >
                    <span className="text-xl shrink-0" aria-hidden>{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-primary truncate">
                        {r.title}
                      </div>
                      {r.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          {r.subtitle}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/15 text-secondary shrink-0">
                      {TYPE_LABEL[r.type]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-border bg-muted/30 px-3 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>↑ ↓ Enter</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-bold text-secondary hover:text-secondary"
              onClick={() => {
                setLocation(`/search?q=${encodeURIComponent(debounced.trim())}`);
                setOpen(false);
                onNavigate?.();
              }}
              data-testid="button-see-all-results"
            >
              {t("search.seeAll", "See all results")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
