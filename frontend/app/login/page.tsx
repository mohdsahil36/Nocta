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
  LogParserSection,
  NarrativeBand,
  RecoverySection,
} from "./ui/feature-sections";
import { Hero } from "./ui/hero";
import { LandingFooter } from "./ui/landing-footer";
import { LandingNav } from "./ui/landing-nav";
import { PathSection } from "./ui/path-section";
import { FRAME_PAD, Frame } from "./ui/page-frame";
import { DeskLoader } from "@/components/ui/desk-loader";
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
        onOpenAuth={(mode) => openAuth(mode ?? "login")}
        onBackToTop={() => scrollToId("top")}
      />

      {/*
        Opacity-only exit: transform/filter on this wrapper breaks
        position:sticky inside the Actuity pin scroll.
      */}
      <motion.div
        className="relative isolate w-full bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50"
        animate={
          routeLeaving && !reduceMotion ? { opacity: 0.35 } : { opacity: 1 }
        }
        transition={{ duration: AUTH_EXIT_MS / 1000, ease: authEaseOut }}
      >
        <main className="relative z-10 w-full">
          <Hero
            reduceMotion={reduceMotion}
            onOpenAuth={(mode) => openAuth(mode ?? "signup")}
            onHowItWorks={() => scrollToId("how-it-works")}
          />

          {/* Pin scroll: section stays; slides advance on vertical scroll */}
          <PathSection />

          {/* Remaining demos stay as normal vertical bands */}
          <NarrativeBand which="onboarding" />
          <GoalsSection />
          <LogParserSection />
          <RecoverySection />

          <div id="faq" className="scroll-mt-16">
            <FaqSection />
          </div>

          <section
            id="close"
            className="scroll-mt-16 border-t border-neutral-200 dark:border-neutral-800"
          >
            <Frame>
              <div
                className={[
                  "mx-auto max-w-2xl pt-16 pb-14 text-center sm:pt-20 sm:pb-18",
                  FRAME_PAD,
                ].join(" ")}
              >
                <h2 className="font-sans text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.03em]">
                  {loginContent.close.title}
                </h2>
                <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-neutral-500">
                  {loginContent.close.body}
                </p>
                <Button
                  size="lg"
                  className="mt-8 h-11 min-w-40 bg-neutral-950 px-8 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                  onClick={() => openAuth("signup")}
                >
                  {loginContent.close.cta}
                </Button>
                <p className="mt-4 text-xs text-neutral-500">
                  {loginContent.close.trust}
                </p>
              </div>
            </Frame>
          </section>

          <LandingFooter onNavigate={scrollToId} />
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
