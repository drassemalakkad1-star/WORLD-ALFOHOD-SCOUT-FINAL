import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PawPrint, ChevronDown, ShoppingCart, User as UserIcon, LogOut, Settings, CreditCard, ShoppingBag, GraduationCap, ShieldCheck } from "lucide-react";
import { useCart } from "../store/cartContext";
import { useAuth } from "../auth/authContext";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { isRTL } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { state: authState, dispatch: authDispatch } = useAuth();
  const { t, i18n } = useTranslation();
  const dir = isRTL(i18n.language) ? "rtl" : "ltr";
  
  const totalItems = cartState.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSignOut = () => {
    authDispatch({ type: "SIGN_OUT" });
    setLocation("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const mainLinks = [
    { key: "home", name: t("nav.home"), href: "/" },
    {
      key: "therapeutic",
      name: "الترويح والدمج",
      href: "/resources",
      children: [
        { name: "الفئة الحركية", href: "/resources" },
        { name: "الفئة الذهنية", href: "/resources" },
        { name: "فئة التوحد", href: "/resources" },
        { name: "الموسوعة الصوتية", href: "/resources" },
        { name: "لوحة الشرف الكبرى", href: "/hall-of-fame" },
      ]
    },
    { 
      key: "academy", 
      name: t("nav.academy"), 
      href: "/academy",
      children: [
        { name: t("nav.overview"), href: "/academy" },
        { name: t("nav.games"), href: "/games" },
        { name: t("nav.instructorPanel"), href: "/instructor" },
      ]
    },
    {
      key: "store",
      name: t("nav.store"),
      href: "/store",
      children: [
        { name: t("nav.allProducts"), href: "/store" },
        { name: t("nav.newIn"), href: "/store/c/new-in" },
        { name: t("nav.kids"), href: "/store/c/kids" },
        { name: t("nav.leaders"), href: "/store/c/leaders" },
        { name: "متجر التكافل", href: "/solidarity" },
      ],
    },
    {
      key: "resources",
      name: t("nav.resources"),
      href: "/resources",
      children: [
        { name: t("nav.library"), href: "/resources" },
        { name: t("nav.videos"), href: "/videos" },
      ],
    },
    {
      key: "movement",
      name: t("nav.movement", "الحركة"),
      href: "/about",
      children: [
        { name: t("nav.about"), href: "/about" },
        { name: t("nav.whatWeDo"), href: "/what-we-do" },
        { name: t("nav.regions"), href: "/regions" },
        { name: t("nav.news"), href: "/news" },
        { name: t("nav.events"), href: "/events" },
      ],
    },
  ];

  const isHidden = (key: string) => "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/90 backdrop-blur-lg" dir={dir}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">

        {/* Logo — far right in RTL */}
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity shrink-0" data-testid="link-logo-home">
          <PawPrint className="h-6 w-6 text-secondary shrink-0" strokeWidth={2.5} />
          <div className="leading-tight">
            <div className="font-black text-sm lg:text-lg tracking-tight whitespace-nowrap">عالم الفهود</div>
            <div className="text-[8px] font-bold text-secondary tracking-widest uppercase whitespace-nowrap hidden lg:block">WORLD ALFOHOD SCOUT</div>
          </div>
        </Link>

        {/* Desktop Nav — fills remaining space */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 xl:gap-4 min-w-0 overflow-hidden">
          {mainLinks.map((link, idx) => (
            link.children ? (
              <DropdownMenu key={`${link.key}-${idx}`} dir={dir as any}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 h-9 px-1.5 lg:px-3 rounded-full font-bold text-[10px] lg:text-[13px] xl:text-sm text-primary hover:text-secondary hover:bg-muted/50 focus:outline-none transition-all data-[state=open]:text-secondary group whitespace-nowrap"
                  >
                    {link.name}
                    <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  sideOffset={8}
                  className="w-56 p-2 rounded-2xl shadow-2xl border border-border bg-card/95 backdrop-blur-sm"
                >
                  {link.children.map((child) => (
                    <DropdownMenuItem key={child.name} asChild className="rounded-xl p-0 focus:bg-muted">
                      <Link
                        href={child.href}
                        className={`block w-full px-4 py-2.5 font-semibold text-xs lg:text-sm text-primary hover:text-secondary cursor-pointer ${dir === "rtl" ? "text-right" : "text-left"}`}
                      >
                        {child.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={`${link.key}-${idx}`}
                href={link.href}
                className="inline-flex items-center h-9 px-1.5 lg:px-3 rounded-full font-bold text-[10px] lg:text-[13px] xl:text-sm text-primary hover:text-secondary hover:bg-muted/50 transition-all whitespace-nowrap"
              >
                {link.name}
              </Link>
            )
          ))}
        </nav>

        {/* Auth + Cart — far left in RTL */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
          <div className="hidden xl:block">
            <GlobalSearch variant="header" />
          </div>
          <ThemeToggle />
          <LanguageSwitcher variant="compact" />
          <Button variant="ghost" size="icon" onClick={() => cartDispatch({ type: "TOGGLE_CART" })} className="relative text-primary hover:text-secondary">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Button>

          {authState.user ? (
            <DropdownMenu dir={dir as any}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="pl-0 pr-2 gap-3 h-12 rounded-full hover:bg-muted">
                  <span className="font-bold hidden lg:block">{authState.user.name.split(' ')[0]}</span>
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: authState.user.avatarColor }}
                  >
                    {getInitials(authState.user.name)}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                <div className="px-2 py-1.5 mb-2">
                  <p className="font-bold text-sm">{authState.user.name}</p>
                  <p className="text-xs text-muted-foreground">{authState.user.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-lg">
                  <Link href="/account">
                    <UserIcon className="h-4 w-4" /> {t("nav.myAccount")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-lg">
                  <Link href="/account?tab=membership">
                    <CreditCard className="h-4 w-4" /> {t("nav.myMembership", "Membership")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-lg">
                  <Link href="/account?tab=orders">
                    <ShoppingBag className="h-4 w-4" /> {t("nav.myOrders", "Orders")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-lg">
                  <Link href="/account?tab=settings">
                    <Settings className="h-4 w-4" /> {t("nav.settings", "Settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-lg font-bold text-primary">
                  <Link href="/instructor">
                    <GraduationCap className="h-4 w-4" /> {t("nav.instructorPanel", "Instructor")}
                  </Link>
                </DropdownMenuItem>
                {authState.user.role === "admin" && (
                  <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-lg font-bold text-secondary">
                    <Link href="/admin">
                      <ShieldCheck className="h-4 w-4" /> لوحة المدير
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive focus:text-destructive rounded-lg">
                  <LogOut className="h-4 w-4" /> {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="font-bold text-sm h-10 rounded-full">
                  {t("nav.signIn")}
                </Button>
              </Link>
              <Link href="/register" className="font-bold text-sm bg-secondary text-white hover:bg-secondary/90 px-5 py-2 rounded-full inline-flex items-center justify-center h-10 whitespace-nowrap">
                {t("nav.joinUs")}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher variant="icon" />
          <Button variant="ghost" size="icon" onClick={() => cartDispatch({ type: "TOGGLE_CART" })} className="relative text-primary">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary">
                <Menu className="h-8 w-8" />
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === "rtl" ? "right" : "left"} className="w-[300px] flex flex-col gap-6 pt-16 overflow-y-auto" dir={dir}>
              <nav className="flex flex-col gap-4 font-bold text-xl">
                {mainLinks.map((link, idx) => (
                  <div key={`m-${link.key}-${idx}`}>
                    {link.children ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-primary/70">
                          <span>{link.name}</span>
                          <ChevronDown className="h-5 w-5" />
                        </div>
                        <div className={`flex flex-col gap-3 ${dir === "rtl" ? "pr-4 border-r-2" : "pl-4 border-l-2"} border-border`}>
                          {link.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              onClick={() => setIsOpen(false)}
                              className="text-lg text-primary hover:text-secondary transition-colors"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="block text-primary hover:text-secondary transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
              <div className="flex flex-col gap-4 mt-auto pb-8 pt-8 border-t border-border">
                {authState.user ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: authState.user.avatarColor }}
                      >
                        {getInitials(authState.user.name)}
                      </div>
                      <div>
                        <p className="font-bold">{authState.user.name}</p>
                        <p className="text-xs text-muted-foreground">{authState.user.role}</p>
                      </div>
                    </div>
                    <Link href="/account" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full text-lg h-12 justify-start gap-3">
                        <UserIcon className="h-5 w-5" /> {t("nav.myAccount")}
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      className="w-full text-lg h-12 justify-start gap-3"
                      onClick={() => {
                        setIsOpen(false);
                        handleSignOut();
                      }}
                    >
                      <LogOut className="h-5 w-5" /> {t("nav.signOut")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full text-lg h-12">{t("nav.signIn")}</Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full text-lg h-12 bg-secondary text-white hover:bg-secondary/90">{t("nav.joinUs")}</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
