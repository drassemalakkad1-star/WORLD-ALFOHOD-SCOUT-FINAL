import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/auth/authContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useTheme } from "@/context/ThemeContext";
import { apiRequest } from "@/lib/queryClient";
import { SUPPORTED_LANGS } from "@/lib/i18n";

type RemotePrefs = {
  language?: string;
  signLanguageMode?: number | boolean;
  theme?: "light" | "dark";
};

export function usePreferencesSync() {
  const { state } = useAuth();
  const { user } = state;
  const { i18n } = useTranslation();
  const { mode, setMode } = useAccessibility();
  const { theme, setTheme } = useTheme();

  const hydratedForRef = useRef<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef<string>("");

  // Pull preferences once per logged-in user, then apply to local state.
  useEffect(() => {
    if (!user) {
      hydratedForRef.current = null;
      return;
    }
    if (hydratedForRef.current === user.id) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<{ preferences: RemotePrefs }>("GET", "/api/preferences");
        if (cancelled) return;
        const p = data?.preferences || {};

        if (
          typeof p.language === "string" &&
          SUPPORTED_LANGS.includes(p.language as any) &&
          p.language !== (i18n.resolvedLanguage || i18n.language)
        ) {
          i18n.changeLanguage(p.language);
        }

        const remoteSign = typeof p.signLanguageMode === "boolean"
          ? p.signLanguageMode
          : Number(p.signLanguageMode) === 1;
        const localSign = mode === "sign-language";
        if (remoteSign !== localSign) {
          setMode(remoteSign ? "sign-language" : "normal");
        }

        if ((p.theme === "light" || p.theme === "dark") && p.theme !== theme) {
          setTheme(p.theme);
        }

        hydratedForRef.current = user.id;
        lastSentRef.current = JSON.stringify({
          language: p.language,
          signLanguageMode: remoteSign,
          theme: p.theme,
        });
      } catch {
        hydratedForRef.current = user.id;
      }
    })();

    return () => { cancelled = true; };
  }, [user, i18n, mode, setMode, theme, setTheme]);

  // Push local changes to server (debounced) — only after we've hydrated.
  useEffect(() => {
    if (!user) return;
    if (hydratedForRef.current !== user.id) return;

    const payload = {
      language: i18n.resolvedLanguage || i18n.language || "ar",
      signLanguageMode: mode === "sign-language",
      theme,
    };
    const serialized = JSON.stringify(payload);
    if (serialized === lastSentRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      apiRequest("PUT", "/api/preferences", payload)
        .then(() => {
          lastSentRef.current = serialized;
        })
        .catch(() => {
          // self-healing: queryClient already retried; swallow to avoid noise.
        });
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [user, i18n.language, i18n.resolvedLanguage, mode, theme]);
}
