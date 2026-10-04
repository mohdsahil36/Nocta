"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { loginContent } from "./content";
import {
  AFTER_AUTH_PATH,
  loginWithEmail,
  signupWithEmail,
  type AuthMode,
} from "./functions/auth";
import { AuthDialog } from "./ui/auth-dialog";
import { FaqSection } from "./ui/faq";
import {
  AiSubGrid,
  CheckInSection,
  GoalsSection,
  LogParserSection,
  NarrativeBand,
  RecoverySection,
  ReflectionSection,
  ScoringSection,
} from "./ui/feature-sections";
import { Hero, HeroTryIt } from "./ui/hero";
import { LandingFooter } from "./ui/landing-footer";
import { LandingNav } from "./ui/landing-nav";
import { OptionSwapSection } from "./ui/option-swap";
import { FullRule } from "./ui/section";
import { FRAME_PAD, Frame, PageFrameRails } from "./ui/page-frame";
import { TonightDemo } from "./ui/tonight-demo";
import { NoctaLoader } from "@/components/ui/nocta-loader";
import useThemeStore from "@/app/store/themeStore";
import {
  AUTH_EXIT_MS,
  authEaseOut,
  markAuthEnter,
} from "@/lib/auth-transition";
import { toast } from "@/components/ui/toast";
import { usePageScroll } from "./ui/use-page-scroll";

export default function LoginPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [routeLeaving, setRouteLeaving] = useState(false);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const { scrolled, scrollToId } = usePageScroll(reduceMotion, authOpen);

  const openAuth = (mode: AuthMode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const resetAuthFields = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setAuthError(null);
  };

  const closeAuth = () => {
    setAuthOpen(false);
    resetAuthFields();
    setAuthMode("login");
  };

  const switchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetAuthFields();
  };

  const enterDashboard = async () => {
    markAuthEnter();
    setAuthOpen(false);
    setRouteLeaving(true);
    if (!reduceMotion) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, AUTH_EXIT_MS);
      });
    }
    router.push(AFTER_AUTH_PATH);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authBusy || routeLeaving) return;
    setAuthBusy(true);
    try {
      if (authMode === "login") {
        const displayName = await loginWithEmail({ email, password });
        toast.add({
          title: `Welcome back, ${displayName}`,
          type: "success",
          timeout: 2200,
        });
      } else {
        const displayName = await signupWithEmail({
          name,
          email,
          password,
          confirmPassword,
        });
        toast.add({
          title: `Welcome, ${displayName}`,
          type: "success",
          timeout: 2200,
        });
      }
      await enterDashboard();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : loginContent.auth.error.fallback;
      setAuthError(message);
      setAuthBusy(false);
    }
  };

  return (
    <>
      <LandingNav
        scrolled={scrolled}
        reduceMotion={reduceMotion}
        onHowItWorks={() => scrollToId("how-it-works")}
        onFaq={() => scrollToId("faq")}
        onOpenAuth={() => openAuth()}
        onToggleTheme={toggleTheme}
      />

      <motion.div
        className="relative isolate w-full bg-nocta-paper text-foreground"
        animate={
          routeLeaving && !reduceMotion
            ? { opacity: 0.35, filter: "blur(6px)", scale: 0.99 }
            : { opacity: 1, filter: "blur(0px)", scale: 1 }
        }
        transition={{ duration: AUTH_EXIT_MS / 1000, ease: authEaseOut }}
      >
        <main className="relative z-10 w-full">
          {/* Hero sits outside the rail band — wider, no vertical grid lines */}
          <Hero
            reduceMotion={reduceMotion}
            onOpenAuth={() => openAuth()}
            onHowItWorks={() => scrollToId("how-it-works")}
          />

          {/* Rails: TRY IT → FAQ only (not wide hero, not close CTA, not footer) */}
          <div className="relative w-full overflow-hidden">
            <PageFrameRails />
            <FullRule />
            <HeroTryIt />

            <NarrativeBand which="product" />
            <TonightDemo />
            <NarrativeBand which="onboarding" />
            <GoalsSection />
            <CheckInSection />
            <NarrativeBand which="process" />
            <ScoringSection />
            <AiSubGrid />
            <OptionSwapSection />
            <LogParserSection />
            <RecoverySection />
            <ReflectionSection />
            <FaqSection />
            <FullRule />
          </div>

          {/* Close + footer — no vertical grid lines */}
          <section id="close" className="scroll-mt-16">
            <Frame>
              <div
                className={[
                  "mx-auto max-w-2xl pt-28 pb-20 text-center sm:pt-36 sm:pb-24",
                  FRAME_PAD,
                ].join(" ")}
              >
                <h2 className="font-sans text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-foreground">
                  {loginContent.close.title}
                </h2>
                <p className="mx-auto mt-5 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
                  {loginContent.close.body}
                </p>
                <Button
                  size="lg"
                  className="mt-10 h-12 min-w-40 rounded-full px-8 text-sm font-semibold"
                  onClick={() => openAuth("signup")}
                >
                  {loginContent.close.cta}
                </Button>
                <p className="mt-5 text-xs text-muted-foreground">
                  {loginContent.close.trust}
                </p>
              </div>
            </Frame>
          </section>

          <LandingFooter />
        </main>

        <AuthDialog
          open={authOpen}
          onOpenChange={(open) => {
            setAuthOpen(open);
            if (!open) {
              resetAuthFields();
              setAuthMode("login");
            }
          }}
          authMode={authMode}
          onSwitchMode={switchAuthMode}
          email={email}
          onEmailChange={setEmail}
          password={password}
          onPasswordChange={setPassword}
          confirmPassword={confirmPassword}
          onConfirmPasswordChange={setConfirmPassword}
          name={name}
          onNameChange={setName}
          showPassword={showPassword}
          onShowPasswordChange={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          onShowConfirmPasswordChange={setShowConfirmPassword}
          authBusy={authBusy}
          routeLeaving={routeLeaving}
          onSubmit={handleAuthSubmit}
          onClose={closeAuth}
          authError={authError}
          onAuthErrorChange={setAuthError}
        />
      </motion.div>
      <NoctaLoader
        variant="overlay"
        open={authBusy || routeLeaving}
        title={loginContent.brand}
        label={loginContent.auth.handoff}
      />
    </>
  );
}
