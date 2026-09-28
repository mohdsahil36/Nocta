"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginContent } from "./content";
import {
  AFTER_AUTH_PATH,
  loginWithEmail,
  loginWithGoogle,
  signupWithEmail,
  type AuthMode,
} from "./functions/auth";
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
import { FooterWordmark } from "./ui/footer-wordmark";
import { GoogleMark } from "./ui/google-mark";
import { Hero } from "./ui/hero";
import { LandingNav } from "./ui/landing-nav";
import { OptionSwapSection } from "./ui/option-swap";
import { PasswordField } from "./ui/password-field";
import { FullRule } from "./ui/section";
import { FRAME_PAD, Frame } from "./ui/page-frame";
import { TonightDemo } from "./ui/tonight-demo";
import { NoctaLoader } from "@/components/ui/nocta-loader";
import { easeOut } from "./ui/motion";
import useThemeStore from "@/app/store/themeStore";
import {
  AUTH_EXIT_MS,
  authEaseOut,
  markAuthEnter,
} from "@/lib/auth-transition";
import { usePageScroll } from "./ui/use-page-scroll";

const AUTH_INPUT_CLASS =
  "auth-input h-10 rounded-xl border px-3.5 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

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
        await loginWithEmail({ email, password });
      } else {
        await signupWithEmail({ name, email, password, confirmPassword });
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
          <Hero
            reduceMotion={reduceMotion}
            onOpenAuth={() => openAuth()}
            onHowItWorks={() => scrollToId("how-it-works")}
          />
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

          <section id="close" className="scroll-mt-16">
            <FullRule />
            <Frame>
              <div
                className={[
                  "mx-auto max-w-2xl pt-28 pb-24 text-center sm:pt-36 sm:pb-28",
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

            <FullRule />
            <Frame>
              <footer
                className={["bg-landing-sand pt-10 pb-12 sm:pt-12 sm:pb-14", FRAME_PAD].join(
                  " ",
                )}
              >
                <FooterWordmark />
                <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-foreground/10 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
                  <p>{loginContent.footer.copyright}</p>
                  <p>{loginContent.footer.credit}</p>
                </div>
              </footer>
            </Frame>
          </section>
        </main>

        <Dialog
          open={authOpen}
          onOpenChange={(open) => {
            setAuthOpen(open);
            if (!open) {
              resetAuthFields();
              setAuthMode("login");
            }
          }}
        >
          <DialogContent
            showCloseButton={false}
            overlayClassName="bg-nocta-night/70 duration-200 supports-backdrop-filter:backdrop-blur-md"
            className="flex h-[min(48rem,94svh)] w-[calc(100%-1.5rem)] max-w-240 flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-nocta-night p-0 text-zinc-900 shadow-[0_24px_64px_rgba(0,0,0,0.4)] ring-1 ring-white/12 sm:max-w-240 sm:rounded-3xl"
          >
            <div className="relative h-full min-h-0 w-full overflow-hidden">
              {/* Full-bleed night image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/nocta-auth-panel.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
              />
              <div className="absolute inset-0 bg-linear-to-r from-nocta-night/60 via-nocta-night/30 to-nocta-night/55" />
              <div className="absolute inset-0 bg-linear-to-t from-nocta-night/75 via-transparent to-nocta-night/35" />

              <div className="relative z-10 flex h-full min-h-0 w-full">
                {/* Left atmosphere */}
                <div className="hidden min-h-0 min-w-0 flex-1 flex-col justify-between p-8 text-white md:flex lg:p-10">
                  <p className="font-serif text-xl tracking-[-0.03em]">
                    {loginContent.brand}
                  </p>
                  <div className="max-w-[16rem] space-y-3 lg:max-w-xs">
                    <p className="font-serif text-2xl leading-tight tracking-[-0.03em] lg:text-3xl">
                      {loginContent.auth.panelTitle}
                    </p>
                    <p className="text-sm leading-6 text-white/75">
                      {loginContent.auth.panelBody}
                    </p>
                  </div>
                  <p className="text-[11px] text-white/45">
                    {loginContent.footer.credit}
                  </p>
                </div>

                {/* Right form */}
                <div className="flex h-full min-h-0 w-full shrink-0 justify-end p-5 sm:p-6 md:w-120 lg:w-lg">
                  <div className="nocta-auth-form relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-2xl">
                    <button
                      type="button"
                      aria-label={loginContent.auth.close}
                      onClick={() => {
                        setAuthOpen(false);
                        resetAuthFields();
                        setAuthMode("login");
                      }}
                      className="absolute top-4 right-4 z-20 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-(--auth-soft) transition-colors hover:bg-(--auth-muted) hover:text-(--auth-ink)"
                    >
                      <XIcon className="size-4" />
                    </button>

                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-7 pr-12 sm:px-8 sm:pt-8 sm:pr-14">
                      <p className="mb-4 shrink-0 font-serif text-base tracking-[-0.02em] text-(--auth-ink) md:hidden">
                        {loginContent.brand}
                      </p>

                      <div
                        role="tablist"
                        aria-label="Account"
                        className="auth-tabs grid shrink-0 grid-cols-2 rounded-xl p-1"
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={authMode === "login"}
                          className={[
                            "h-9 cursor-pointer rounded-lg text-sm font-medium outline-none transition-colors duration-150",
                            authMode === "login"
                              ? "auth-tab-active"
                              : "auth-tab-idle",
                          ].join(" ")}
                          onClick={() => switchAuthMode("login")}
                        >
                          {loginContent.auth.login.tab}
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={authMode === "signup"}
                          className={[
                            "h-9 cursor-pointer rounded-lg text-sm font-medium outline-none transition-colors duration-150",
                            authMode === "signup"
                              ? "auth-tab-active"
                              : "auth-tab-idle",
                          ].join(" ")}
                          onClick={() => switchAuthMode("signup")}
                        >
                          {loginContent.auth.signup.tab}
                        </button>
                      </div>

                      <DialogHeader className="mt-5 shrink-0 gap-1.5 text-left">
                        <div className="relative min-h-14">
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                              key={authMode}
                              initial={
                                reduceMotion ? false : { opacity: 0, y: 6 }
                              }
                              animate={{ opacity: 1, y: 0 }}
                              exit={
                                reduceMotion ? undefined : { opacity: 0, y: -4 }
                              }
                              transition={{ duration: 0.2, ease: easeOut }}
                              className="absolute inset-x-0 top-0 flex flex-col gap-1.5"
                            >
                              <DialogTitle className="font-serif text-xl font-normal tracking-[-0.04em] text-(--auth-ink) sm:text-2xl">
                                {authMode === "login"
                                  ? loginContent.auth.login.title
                                  : loginContent.auth.signup.title}
                              </DialogTitle>
                              <DialogDescription className="text-sm leading-5 text-(--auth-soft)">
                                {authMode === "login"
                                  ? loginContent.auth.login.body
                                  : loginContent.auth.signup.body}
                              </DialogDescription>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </DialogHeader>

                      <form
                        id="nocta-auth-form"
                        className="mt-4 flex flex-col pb-5"
                        onSubmit={handleAuthSubmit}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            void loginWithGoogle().catch((err) => {
                              const message =
                                err instanceof Error
                                  ? err.message
                                  : loginContent.auth.error.fallback;
                              setAuthError(message);
                            });
                          }}
                          className="auth-input inline-flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors hover:bg-(--auth-muted)"
                        >
                          <GoogleMark />
                          {loginContent.auth.google}
                        </button>

                        <div className="my-4 flex shrink-0 items-center gap-3">
                          <div className="h-px flex-1 bg-(--auth-line)" />
                          <span className="text-xs text-(--auth-soft)">
                            {loginContent.auth.or}
                          </span>
                          <div className="h-px flex-1 bg-(--auth-line)" />
                        </div>

                        <div className="flex flex-col gap-3.5">
                          <div
                            className={[
                              "grid transition-[grid-template-rows] duration-200 ease-out",
                              authMode === "signup"
                                ? "grid-rows-[1fr]"
                                : "grid-rows-[0fr]",
                            ].join(" ")}
                            aria-hidden={authMode !== "signup"}
                          >
                            <div
                              className={[
                                "min-h-0",
                                authMode === "signup"
                                  ? "overflow-visible"
                                  : "overflow-hidden",
                              ].join(" ")}
                            >
                              <div
                                className={[
                                  "flex flex-col gap-2 pb-3.5 transition-opacity duration-200 ease-out",
                                  authMode === "signup"
                                    ? "opacity-100"
                                    : "opacity-0",
                                ].join(" ")}
                              >
                                <Label
                                  htmlFor="nocta-auth-name"
                                  className="text-sm font-medium text-(--auth-ink)"
                                >
                                  {loginContent.auth.signup.name}
                                </Label>
                                <Input
                                  id="nocta-auth-name"
                                  type="text"
                                  name="name"
                                  autoComplete="name"
                                  tabIndex={authMode === "signup" ? 0 : -1}
                                  placeholder={
                                    loginContent.auth.signup.namePlaceholder
                                  }
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  className={AUTH_INPUT_CLASS}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Label
                              htmlFor="nocta-auth-email"
                              className="text-sm font-medium text-(--auth-ink)"
                            >
                              {loginContent.auth.email}
                            </Label>
                            <Input
                              id="nocta-auth-email"
                              type="email"
                              name="email"
                              autoComplete="email"
                              placeholder={loginContent.auth.emailPlaceholder}
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className={AUTH_INPUT_CLASS}
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex h-5 items-center justify-between gap-3">
                              <Label
                                htmlFor="nocta-auth-password"
                                className="text-sm font-medium text-(--auth-ink)"
                              >
                                {loginContent.auth.password}
                              </Label>
                              {authMode === "login" ? (
                                <button
                                  type="button"
                                  className="auth-link shrink-0 cursor-pointer text-xs transition-opacity hover:opacity-80"
                                >
                                  {loginContent.auth.login.forgot}
                                </button>
                              ) : (
                                <span aria-hidden className="invisible text-xs">
                                  {loginContent.auth.login.forgot}
                                </span>
                              )}
                            </div>
                            <PasswordField
                              id="nocta-auth-password"
                              name="password"
                              autoComplete={
                                authMode === "login"
                                  ? "current-password"
                                  : "new-password"
                              }
                              placeholder={
                                loginContent.auth.passwordPlaceholder
                              }
                              value={password}
                              onChange={setPassword}
                              visible={showPassword}
                              onVisibleChange={setShowPassword}
                            />
                          </div>

                          <div
                            className={[
                              "grid transition-[grid-template-rows] duration-200 ease-out",
                              authMode === "signup"
                                ? "grid-rows-[1fr]"
                                : "grid-rows-[0fr]",
                            ].join(" ")}
                            aria-hidden={authMode !== "signup"}
                          >
                            <div
                              className={[
                                "min-h-0",
                                authMode === "signup"
                                  ? "overflow-visible"
                                  : "overflow-hidden",
                              ].join(" ")}
                            >
                              <div
                                className={[
                                  "flex flex-col gap-2 pb-1 transition-opacity duration-200 ease-out",
                                  authMode === "signup"
                                    ? "opacity-100"
                                    : "opacity-0",
                                ].join(" ")}
                              >
                                <Label
                                  htmlFor="nocta-auth-confirm"
                                  className="text-sm font-medium text-(--auth-ink)"
                                >
                                  {loginContent.auth.signup.confirmPassword}
                                </Label>
                                <PasswordField
                                  id="nocta-auth-confirm"
                                  name="confirmPassword"
                                  autoComplete="new-password"
                                  tabIndex={authMode === "signup" ? 0 : -1}
                                  placeholder={
                                    loginContent.auth.signup.confirmPlaceholder
                                  }
                                  value={confirmPassword}
                                  onChange={setConfirmPassword}
                                  visible={showConfirmPassword}
                                  onVisibleChange={setShowConfirmPassword}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Sticky footer */}
                    <div className="auth-footer shrink-0 border-t px-6 pt-4 pb-6 sm:px-8 sm:pt-5 sm:pb-7">
                      <button
                        type="submit"
                        form="nocta-auth-form"
                        disabled={authBusy || routeLeaving}
                        className="auth-cta inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-70"
                      >
                        {authMode === "login"
                          ? loginContent.auth.login.cta
                          : loginContent.auth.signup.cta}
                      </button>
                      <p className="mt-4 text-center text-sm text-(--auth-soft)">
                        {authMode === "login"
                          ? loginContent.auth.login.switchPrompt
                          : loginContent.auth.signup.switchPrompt}{" "}
                        <button
                          type="button"
                          className="auth-link cursor-pointer font-medium transition-opacity hover:opacity-80"
                          onClick={() =>
                            switchAuthMode(
                              authMode === "login" ? "signup" : "login",
                            )
                          }
                        >
                          {authMode === "login"
                            ? loginContent.auth.login.switchAction
                            : loginContent.auth.signup.switchAction}
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={authError != null}
          onOpenChange={(open) => {
            if (!open) setAuthError(null);
          }}
        >
          <DialogContent
            showCloseButton={false}
            overlayClassName="z-[60] bg-nocta-night/55 duration-200 supports-backdrop-filter:backdrop-blur-sm"
            className="z-60 w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl border-0 bg-background p-0 text-foreground shadow-[0_20px_48px_rgba(0,0,0,0.35)] ring-1 ring-border sm:max-w-sm"
          >
            <DialogHeader className="gap-2 px-5 pt-5 pb-1 sm:px-6 sm:pt-6">
              <DialogTitle className="font-serif text-xl tracking-[-0.03em]">
                {loginContent.auth.error.title}
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-muted-foreground">
                {authError}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mx-0 mb-0 rounded-none border-border/60 bg-muted/40 px-5 py-4 sm:justify-stretch sm:px-6">
              <Button
                type="button"
                className="w-full cursor-pointer"
                onClick={() => setAuthError(null)}
              >
                {loginContent.auth.error.dismiss}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
