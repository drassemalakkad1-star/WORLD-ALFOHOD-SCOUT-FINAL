import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/authContext";
import { CartProvider } from "@/components/store/cartContext";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { FloatingSignLanguageButton } from "@/components/accessibility/FloatingSignLanguageButton";
import { PWAInstallPrompt } from "@/components/layout/PWAInstallPrompt";
import { SeoHead } from "@/components/layout/SeoHead";
import { ConnectionStatus } from "@/components/layout/ConnectionStatus";
import { usePreferencesSync } from "@/hooks/usePreferencesSync";
import { queryClient } from "@/lib/queryClient";

import { LandingPage } from "@/components/landing/LandingPage";

// Lazy-load every secondary route to keep the initial bundle small
// (each `import()` becomes its own chunk, fetched on demand)
const NotFound = lazy(() => import("@/pages/not-found"));
const About = lazy(() => import("@/pages/About"));
const WhatWeDo = lazy(() => import("@/pages/WhatWeDo"));
const ProgrammeDetail = lazy(() => import("@/pages/ProgrammeDetail"));
const News = lazy(() => import("@/pages/News"));
const ArticleDetail = lazy(() => import("@/pages/ArticleDetail"));
const Events = lazy(() => import("@/pages/Events"));
const EventDetail = lazy(() => import("@/pages/EventDetail"));
const Regions = lazy(() => import("@/pages/Regions"));
const RegionDetail = lazy(() => import("@/pages/RegionDetail"));
const Resources = lazy(() => import("@/pages/Resources"));
const Videos = lazy(() => import("@/pages/Videos"));
const Store = lazy(() => import("@/pages/Store"));
const StoreCollection = lazy(() => import("@/pages/StoreCollection"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const SolidarityStore = lazy(() => import("@/pages/SolidarityStore"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const GetInvolved = lazy(() => import("@/pages/GetInvolved"));
const JoinRole = lazy(() => import("@/pages/JoinRole"));
const Donate = lazy(() => import("@/pages/Donate"));
const Contact = lazy(() => import("@/pages/Contact"));
const SearchPage = lazy(() => import("@/pages/Search"));
const Games = lazy(() => import("@/pages/Games"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const Account = lazy(() => import("@/pages/Account"));
const Academy = lazy(() => import("@/pages/Academy"));
const AcademyCourse = lazy(() => import("@/pages/AcademyCourse"));
const AcademyLearn = lazy(() => import("@/pages/AcademyLearn"));
const InstructorDashboard = lazy(() => import("@/pages/InstructorDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const HallOfFame = lazy(() => import("@/pages/HallOfFame"));

function RouteFallback() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center bg-background"
      data-testid="status-route-loading"
      aria-busy="true"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/about" component={About} />
        <Route path="/what-we-do" component={WhatWeDo} />
        <Route path="/programmes/:slug" component={ProgrammeDetail} />
        <Route path="/news" component={News} />
        <Route path="/news/:slug" component={ArticleDetail} />
        <Route path="/events" component={Events} />
        <Route path="/events/:slug" component={EventDetail} />
        <Route path="/regions" component={Regions} />
        <Route path="/regions/:slug" component={RegionDetail} />
        <Route path="/resources" component={Resources} />
        <Route path="/videos" component={Videos} />
        <Route path="/store" component={Store} />
        <Route path="/store/c/:slug" component={StoreCollection} />
        <Route path="/store/p/:slug" component={ProductDetail} />
        <Route path="/solidarity" component={SolidarityStore} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/academy" component={Academy} />
        <Route path="/academy/c/:slug" component={AcademyCourse} />
        <Route path="/academy/learn/:slug" component={AcademyLearn} />
        <Route path="/get-involved" component={GetInvolved} />
        <Route path="/join/:role" component={JoinRole} />
        <Route path="/donate" component={Donate} />
        <Route path="/contact" component={Contact} />
        <Route path="/search" component={SearchPage} />
        <Route path="/games" component={Games} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/account" component={Account} />
        <Route path="/instructor" component={InstructorDashboard} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/hall-of-fame" component={HallOfFame} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function PreferencesBridge() {
  usePreferencesSync();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AccessibilityProvider>
            <AuthProvider>
              <CartProvider>
                <SeoHead />
                <PreferencesBridge />
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <Router />
                  <FloatingSignLanguageButton />
                  <PWAInstallPrompt />
                  <ConnectionStatus />
                </WouterRouter>
              </CartProvider>
            </AuthProvider>
            <Toaster />
          </AccessibilityProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
