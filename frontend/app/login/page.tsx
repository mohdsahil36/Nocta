"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { loginContent } from "./content";
import {
  AFTER_AUTH_PATH,
  loginWithEmail,
  signupWithEmail,
  syncWithUserTable,
  type AuthMode,
} from "./functions/auth";
import {
  getCurrentUserId,
  shouldEnterGoalsOnboarding,
} from "@/app/goals/functions/goals";
import { AuthDialog } from "./ui/auth-dialog";
import { FaqSection } from "./ui/faq";
import {
  GoalsSection,
  CheckInSection,
  LogParserSection,
  RecoverySection,
  StatsCard,
} from "./ui/feature-sections";
import { Hero } from "./ui/hero";
import { LandingFooter } from "./ui/landing-footer";
import { LandingNav } from "./ui/landing-nav";
import { PathSection } from "./ui/path-section";
import { DeskLoader } from "@/components/ui/desk-loader";
import {
  AUTH_EXIT_MS,
  authEaseOut,
  markAuthEnter,
  markAuthWelcome,
} from "@/lib/auth-transition";
import { usePageScroll } from "./ui/use-page-scroll";
import { Button } from "@/components/ui/button";

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

    let nextPath = AFTER_AUTH_PATH;
    try {
      await syncWithUserTable();
      const userId = await getCurrentUserId();
      if (await shouldEnterGoalsOnboarding(userId)) {
        nextPath = "/goals/onboarding";
      }
    } catch {
      nextPath = "/dashboard";
    }
    router.push(nextPath);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authBusy || routeLeaving) return;
    setAuthBusy(true);
    try {
      if (authMode === "login") {
        const displayName = await loginWithEmail({ email, password });
        markAuthWelcome(`Welcome back, ${displayName}`);
      } else {
        const displayName = await signupWithEmail({
          name,
          email,
          password,
          confirmPassword,
        });
        markAuthWelcome(`Welcome, ${displayName}`);
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
        onOpenAuth={(mode) => openAuth(mode ?? "login")}
        onBackToTop={() => scrollToId("top")}
      />

      <motion.div
        className="relative isolate w-full bg-[#f8f8f6] text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50"
        animate={
          routeLeaving && !reduceMotion ? { opacity: 0.35 } : { opacity: 1 }
        }
        transition={{ duration: AUTH_EXIT_MS / 1000, ease: authEaseOut }}
      >
        <main className="relative z-10 w-full flex flex-col gap-16 py-16">
          {/* Hero */}
          <Hero
            reduceMotion={reduceMotion}
            onOpenAuth={(mode) => openAuth(mode ?? "signup")}
            onHowItWorks={() => scrollToId("how-it-works")}
          />

          {/* Stats — full-width section to match hero card width */}
          <section className="w-full">
            <StatsCard />
          </section>

          {/* #01 Goal scoring */}
          <GoalsSection />

          {/* #02 Check-in */}
          <CheckInSection />

          {/* #03 Log */}
          <LogParserSection />

          {/* #04 Recovery */}
          <RecoverySection />

          {/* FAQ */}
          <div id="faq" className="scroll-mt-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <FaqSection />
            </div>
          </div>

          {/* Close CTA */}
          <div className="mx-auto max-w-4xl px-4 sm:px-6 w-full">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-8 py-12 sm:px-10 text-center">
              <h2 className="font-heading text-[clamp(1.75rem,4vw,2.5rem)] font-normal text-neutral-950 dark:text-neutral-50">
                {loginContent.close.title}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-neutral-500">
                {loginContent.close.body}
              </p>
              <Button
                size="lg"
                className="mt-8 h-10 rounded-lg bg-primary px-8 font-mono text-[11px] font-semibold tracking-[0.06em] uppercase text-white hover:bg-primary/90"
                onClick={() => openAuth("signup")}
              >
                {loginContent.close.cta} →
              </Button>
              <p className="mt-4 font-mono text-[11px] text-neutral-400">
                {loginContent.close.trust}
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-4xl w-full px-4 sm:px-6">
            <LandingFooter onNavigate={scrollToId} />
          </div>
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

      <DeskLoader
        variant="overlay"
        open={authBusy || routeLeaving}
        label={loginContent.auth.handoff}
      />
    </>
  );
}
