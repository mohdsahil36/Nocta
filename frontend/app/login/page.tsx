"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PixelScenery } from "@/components/illustrations/pixel-scenery";
import { loginContent } from "./content";
import {
  AFTER_AUTH_PATH,
  loginWithEmail,
  loginWithGoogle,
  signupWithEmail,
  type AuthMode,
} from "./functions/auth";
import { DynamicLine } from "./ui/dynamic-line";
import { FeatureCell } from "./ui/feature-cell";
import { GoogleMark } from "./ui/google-mark";
import { PasswordField } from "./ui/password-field";
import { AuthHandoff } from "./ui/auth-handoff";
import {
  easeOut,
  fadeUp,
  navReveal,
  sceneryReveal,
  sectionReveal,
  SHELL,
  stagger,
} from "./ui/motion";
import { useIsDark, writeTheme } from "@/lib/theme";
import {
  AUTH_EXIT_MS,
  authEaseOut,
  markAuthEnter,
} from "@/lib/auth-transition";
import { usePageScroll } from "./ui/use-page-scroll";
import { WhyBuiltSection } from "./ui/why-built-section";

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
  const [routeLeaving, setRouteLeaving] = useState(false);
  const dark = useIsDark();
  const { scrolled, scrollToId } = usePageScroll(reduceMotion, authOpen);

  const toggleTheme = () => writeTheme(!dark);

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
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      window.alert(message);
      setAuthBusy(false);
    }
  };

  return (
    <>
    <motion.div
      className="relative isolate min-h-svh w-full bg-nocta-paper text-foreground dark:bg-nocta-paper"
      animate={
        routeLeaving && !reduceMotion
          ? { opacity: 0.35, filter: "blur(6px)", scale: 0.99 }
          : { opacity: 1, filter: "blur(0px)", scale: 1 }
      }
      transition={{ duration: AUTH_EXIT_MS / 1000, ease: authEaseOut }}
    >
      <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4">
        <motion.div
          className="flex w-full justify-center"
          variants={navReveal}
          initial={reduceMotion ? false : "hidden"}
          animate="show"
        >
          <motion.div
            layout
            transition={{ duration: 0.35, ease: easeOut }}
            className={[
              "flex w-full items-center justify-between gap-3 rounded-full border shadow-md backdrop-blur-2xl backdrop-saturate-150 transition-[max-width,padding,background-color,border-color,color] duration-300 ease-out",
              // Glass nav: white over hero, theme colors after scroll
              scrolled
                ? "max-w-3xl border-border/50 bg-background/80 py-3 pr-3 pl-5 text-foreground sm:max-w-4xl sm:py-3.5 sm:pr-3.5 sm:pl-6 dark:border-white/12 dark:bg-background/75"
                : "max-w-2xl border-white/30 bg-white/25 py-3 pr-3 pl-5 text-white sm:max-w-3xl sm:py-3.5 dark:border-white/15 dark:bg-white/10",
            ].join(" ")}
          >
            <a
              href="#top"
              className={[
                "cursor-pointer font-serif text-lg tracking-[-0.03em] transition-colors duration-300 sm:text-xl",
                scrolled ? "text-foreground" : "text-white",
              ].join(" ")}
            >
              {loginContent.brand}
            </a>
            <nav className="flex items-center gap-0.5 sm:gap-1.5">
              <Button
                variant="ghost"
                size="default"
                className={[
                  "hidden cursor-pointer sm:inline-flex",
                  scrolled
                    ? "text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
                    : "text-white/85 hover:bg-white/15 hover:text-white",
                ].join(" ")}
                onClick={() => scrollToId("how-it-works")}
              >
                {loginContent.nav.howItWorks}
              </Button>
              <Button
                variant="ghost"
                size="default"
                className={[
                  "hidden cursor-pointer md:inline-flex",
                  scrolled
                    ? "text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
                    : "text-white/85 hover:bg-white/15 hover:text-white",
                ].join(" ")}
                onClick={() => scrollToId("close")}
              >
                {loginContent.nav.about}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={[
                  "cursor-pointer",
                  scrolled
                    ? "text-foreground hover:bg-foreground/5 hover:text-foreground"
                    : "text-white hover:bg-white/15 hover:text-white",
                ].join(" ")}
                onClick={toggleTheme}
                aria-label={
                  dark ? "Switch to daytime look" : "Switch to evening look"
                }
                title={dark ? "Daytime (override)" : "Evening (override)"}
              >
                {dark ? <Sun /> : <Moon />}
              </Button>
              <Button
                size="default"
                className={[
                  "cursor-pointer rounded-full px-4 sm:px-5",
                  scrolled ? "" : "bg-white text-zinc-900 hover:bg-white/90",
                ].join(" ")}
                onClick={() => openAuth()}
              >
                {loginContent.nav.cta}
              </Button>
            </nav>
          </motion.div>
        </motion.div>
      </header>

      <main className="relative z-10 w-full">
        <section
          id="top"
          className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-nocta-night"
        >
          <div aria-hidden className="absolute inset-0 bg-nocta-night" />
          <motion.div
            className="absolute inset-0"
            variants={sceneryReveal}
            initial={reduceMotion ? false : "hidden"}
            animate="show"
          >
            <PixelScenery className="inset-0" />
          </motion.div>
          {/* Fade hero into page */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-32 bg-linear-to-t from-nocta-paper to-transparent"
          />

          <motion.div
            className="relative z-10 flex w-full flex-col items-center px-4 pt-28 pb-16"
            variants={stagger}
            initial={reduceMotion ? false : "hidden"}
            animate="show"
          >
            <div className={`${SHELL} flex flex-col items-center text-center`}>
              <motion.h1
                variants={fadeUp}
                className="font-serif text-4xl leading-tight tracking-[-0.04em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-6xl"
              >
                <span className="whitespace-nowrap">
                  {loginContent.hero.wordmark}
                </span>
                <span className="mx-2 font-normal text-white/45 sm:mx-3">
                  —
                </span>
                <span className="text-white/90">{loginContent.hero.title}</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mx-auto mt-4 max-w-md text-base font-medium leading-snug text-white/95 drop-shadow-[0_1px_10px_rgba(0,0,0,0.4)] sm:mt-5 sm:max-w-lg sm:text-lg"
              >
                {loginContent.hero.tagline}
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mx-auto mt-3 w-full max-w-lg"
              >
                <DynamicLine lines={loginContent.hero.rotating} />
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)] sm:max-w-md sm:text-[0.95rem]"
              >
                {loginContent.hero.body}
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-9"
              >
                <Button
                  size="lg"
                  className="h-12 min-w-40 cursor-pointer rounded-full bg-white px-7 text-sm font-semibold text-zinc-900 shadow-[0_8px_28px_rgba(0,0,0,0.28)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-white hover:shadow-[0_10px_32px_rgba(0,0,0,0.35)] hover:brightness-105 active:scale-[0.98]"
                  onClick={() => openAuth()}
                >
                  {loginContent.hero.primaryCta}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 min-w-40 cursor-pointer rounded-full border-white/50 bg-white/10 px-7 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,0,0,0.18)] backdrop-blur-md transition-[transform,background-color,border-color] duration-200 hover:border-white/70 hover:bg-white/20 hover:text-white active:scale-[0.98]"
                  onClick={() => scrollToId("how-it-works")}
                >
                  {loginContent.hero.secondaryCta}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <WhyBuiltSection />

        <motion.section
          id="how-it-works"
          className="relative z-10 bg-nocta-paper py-16 sm:py-24"
          variants={sectionReveal}
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:max-w-7xl">
            <motion.h2
              className="text-center font-serif text-3xl tracking-[-0.03em] text-foreground sm:text-4xl"
              variants={fadeUp}
              initial={reduceMotion ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true }}
            >
              {loginContent.features.title}
            </motion.h2>
            <motion.div
              className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[auto_auto]"
              variants={stagger}
              initial={reduceMotion ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {loginContent.features.items.map((feature, index) => (
                <FeatureCell key={feature.id} feature={feature} index={index} />
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="close"
          className="relative z-10 overflow-hidden bg-nocta-paper pt-20 sm:pt-28"
          variants={sectionReveal}
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            className={`${SHELL} relative z-10 text-center`}
            variants={stagger}
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            <motion.h2
              variants={fadeUp}
              className="font-serif text-3xl tracking-[-0.03em] text-foreground sm:text-4xl"
            >
              {loginContent.close.title}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-md text-base leading-7 text-muted-foreground"
            >
              {loginContent.close.body}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Button
                size="lg"
                className="mt-9 h-11 min-w-36 cursor-pointer rounded-full px-6"
                onClick={() => openAuth()}
              >
                {loginContent.close.cta}
              </Button>
            </motion.div>
          </motion.div>

          <footer className="relative z-10 mx-auto mt-14 w-full max-w-6xl px-4 pb-14 sm:mt-16 sm:px-6 sm:pb-16 lg:max-w-7xl">
            <div className="relative grid grid-cols-1 items-baseline gap-6 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-8">
              <p className="order-2 text-center text-sm leading-none text-muted-foreground sm:order-1 sm:text-left">
                {loginContent.footer.copyright}
              </p>

              <motion.p
                aria-hidden
                className="order-1 justify-self-center select-none font-sans text-[clamp(4.5rem,16vw,11rem)] leading-none font-bold tracking-tighter text-nocta-ink/10 sm:order-2 dark:text-white/15"
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, y: 32, filter: "blur(24px)" }
                }
                whileInView={
                  reduceMotion
                    ? undefined
                    : { opacity: 1, y: 0, filter: "blur(0px)" }
                }
                transition={{
                  duration: 2,
                  ease: easeOut,
                  delay: 0.2,
                  opacity: { duration: 2.2, ease: easeOut, delay: 0.15 },
                  filter: { duration: 2.4, ease: easeOut, delay: 0.05 },
                }}
                viewport={{ once: true, amount: 0.55 }}
              >
                {loginContent.brand}
              </motion.p>

              <p className="order-3 text-center text-sm leading-none text-muted-foreground sm:text-right">
                {loginContent.footer.credit}
              </p>
            </div>
          </footer>
        </motion.section>
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
                                : "Something went wrong. Try again.";
                            window.alert(message);
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
                            placeholder={loginContent.auth.passwordPlaceholder}
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
    </motion.div>
    <AuthHandoff open={authBusy || routeLeaving} />
    </>
  );
}
