"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Monitor, Sun, type LucideIcon } from "lucide-react";

import useThemeStore, { type ThemePreference } from "@/app/store/themeStore";
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
import { NoctaMark } from "@/components/ui/nocta-mark";
import { cn } from "cn";

import { loginContent } from "../content";
import { loginWithGoogle, type AuthMode } from "../functions/auth";
import { GoogleMark } from "./google-mark";
import { PasswordField } from "./password-field";
import { easeOut } from "./motion";

const AUTH_INPUT_CLASS =
  "auth-input h-11 rounded-xl border px-3.5 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

type ThemeMode = "light" | "dark" | "system";
type ThemeIcon = LucideIcon | typeof NoctaMark;

function preferenceToMode(preference: ThemePreference): ThemeMode {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return "system";
}

function modeToPreference(mode: ThemeMode): ThemePreference {
  if (mode === "system") return null;
  return mode;
}

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authMode: AuthMode;
  onSwitchMode: (mode: AuthMode) => void;
  email: string;
  onEmailChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (v: string) => void;
  name: string;
  onNameChange: (v: string) => void;
  showPassword: boolean;
  onShowPasswordChange: (v: boolean) => void;
  showConfirmPassword: boolean;
  onShowConfirmPasswordChange: (v: boolean) => void;
  authBusy: boolean;
  routeLeaving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  authError: string | null;
  onAuthErrorChange: (error: string | null) => void;
};

export function AuthDialog({
  open,
  onOpenChange,
  authMode,
  onSwitchMode,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  name,
  onNameChange,
  showPassword,
  onShowPasswordChange,
  showConfirmPassword,
  onShowConfirmPasswordChange,
  authBusy,
  routeLeaving,
  onSubmit,
  onClose,
  authError,
  onAuthErrorChange,
}: AuthDialogProps) {
  const reduceMotion = useReducedMotion();
  const c = loginContent.auth;
  const isSignup = authMode === "signup";
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const activeTheme = preferenceToMode(preference);

  const themeOptions: {
    mode: ThemeMode;
    label: string;
    hint: string;
    icon: ThemeIcon;
  }[] = [
    {
      mode: "light",
      label: c.themeLight,
      hint: c.themeLightHint,
      icon: Sun,
    },
    {
      mode: "dark",
      label: c.themeDark,
      hint: c.themeDarkHint,
      icon: NoctaMark,
    },
    {
      mode: "system",
      label: c.themeSystem,
      hint: c.themeSystemHint,
      icon: Monitor,
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-nocta-night/70 duration-200 supports-backdrop-filter:backdrop-blur-md"
          className="flex! w-[calc(100%-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-nocta-night p-0 text-zinc-900 shadow-none ring-1 ring-white/10 sm:rounded-3xl md:max-w-240"
          style={{
            height: "min(48rem, 94svh)",
            maxHeight: "min(48rem, 94svh)",
          }}
        >
          <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden md:flex-row">
            <div
              aria-hidden
              className="nocta-auth-dusk pointer-events-none absolute inset-0 hidden md:block"
            />

            {/* Mobile — dusk band above the form */}
            <div className="relative h-36 shrink-0 overflow-hidden sm:h-40 md:hidden">
              <div
                aria-hidden
                className="nocta-auth-dusk pointer-events-none absolute inset-0"
              />
              <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.16em] text-white/55 uppercase">
                    {c.panelEyebrow}
                  </p>
                  <p className="mt-2 flex items-center gap-2 font-sans text-lg font-semibold tracking-[-0.03em]">
                    <NoctaMark className="size-4 text-white" />
                    {loginContent.brand}
                  </p>
                </div>
                <div className="max-w-72">
                  <p className="font-sans text-base leading-snug font-semibold tracking-[-0.03em]">
                    {c.panelTitle}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/70">
                    {c.panelBody}
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop — left dusk copy */}
            <div className="relative z-10 hidden min-h-0 min-w-0 flex-1 flex-col justify-between overflow-hidden p-8 text-white md:flex lg:p-10">
              <div>
                <p className="text-[11px] font-medium tracking-[0.16em] text-white/50 uppercase">
                  {c.panelEyebrow}
                </p>
                <p className="mt-3 flex items-center gap-2 font-sans text-xl font-semibold tracking-[-0.03em]">
                  <NoctaMark className="size-4 text-white" />
                  {loginContent.brand}
                </p>
              </div>
              <div className="max-w-68 space-y-4 lg:max-w-xs">
                <p className="font-sans text-2xl leading-tight font-semibold tracking-[-0.035em] lg:text-[1.75rem]">
                  {c.panelTitle}
                </p>
                <p className="text-sm leading-6 text-white/70">{c.panelBody}</p>
              </div>
              <p className="text-[11px] text-white/40">
                {loginContent.footer.copyright}
              </p>
            </div>

            {/* Mac-window form card */}
            <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col p-3 sm:p-4 md:h-full md:w-120 md:flex-none md:p-5 lg:w-lg">
              <div
                className="nocta-auth-form h-full min-h-0 w-full min-w-0 overflow-hidden rounded-2xl"
                data-lenis-prevent
              >
                {/* Titlebar */}
                <div className="auth-chrome flex h-11 items-center gap-2 border-b px-3.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={c.close}
                      onClick={onClose}
                      className="auth-traffic auth-traffic-close cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-(--auth-glow) focus-visible:ring-offset-1"
                    />
                    <span
                      aria-hidden
                      className="auth-traffic auth-traffic-min"
                    />
                    <span
                      aria-hidden
                      className="auth-traffic auth-traffic-max"
                    />
                  </div>
                  <p className="min-w-0 flex-1 truncate text-center text-xs font-medium text-(--auth-soft)">
                    {loginContent.brand} ·{" "}
                    {isSignup ? c.signup.tab : c.login.tab}
                  </p>
                  <div
                    role="group"
                    aria-label={c.theme}
                    className="flex shrink-0 items-center rounded-lg border border-(--auth-line) bg-(--auth-field) p-0.5"
                  >
                    {themeOptions.map(({ mode, label, hint, icon: Icon }) => {
                      const selected = activeTheme === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          aria-label={hint}
                          aria-pressed={selected}
                          title={hint}
                          className={cn(
                            "flex size-6 items-center justify-center rounded-md outline-none transition-colors duration-150",
                            "focus-visible:ring-2 focus-visible:ring-(--auth-glow)",
                            selected
                              ? "bg-(--auth-muted) text-(--auth-ink)"
                              : "text-(--auth-soft) hover:text-(--auth-ink)",
                          )}
                          onClick={() => setPreference(modeToPreference(mode))}
                        >
                          <Icon className="size-3" aria-hidden />
                          <span className="sr-only">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable fields */}
                <div
                  className="auth-scroll px-6 pt-6 sm:px-8 sm:pt-7"
                  data-lenis-prevent
                >
                  <div
                    role="tablist"
                    aria-label="Account"
                    className="auth-tabs grid grid-cols-2 rounded-full p-1"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={authMode === "login"}
                      className={[
                        "h-9 cursor-pointer rounded-full text-sm font-medium outline-none transition-colors duration-150",
                        authMode === "login"
                          ? "auth-tab-active"
                          : "auth-tab-idle",
                      ].join(" ")}
                      onClick={() => onSwitchMode("login")}
                    >
                      {c.login.tab}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isSignup}
                      className={[
                        "h-9 cursor-pointer rounded-full text-sm font-medium outline-none transition-colors duration-150",
                        isSignup ? "auth-tab-active" : "auth-tab-idle",
                      ].join(" ")}
                      onClick={() => onSwitchMode("signup")}
                    >
                      {c.signup.tab}
                    </button>
                  </div>

                  <DialogHeader className="mt-6 gap-1.5 text-left">
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
                          <DialogTitle className="font-sans text-xl font-semibold tracking-[-0.03em] text-(--auth-ink) sm:text-2xl">
                            {isSignup ? c.signup.title : c.login.title}
                          </DialogTitle>
                          <DialogDescription className="text-sm leading-5 text-(--auth-soft)">
                            {isSignup ? c.signup.body : c.login.body}
                          </DialogDescription>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </DialogHeader>

                  <form
                    id="nocta-auth-form"
                    className="mt-5 flex flex-col pb-8"
                    onSubmit={onSubmit}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        void loginWithGoogle().catch((err) => {
                          const message =
                            err instanceof Error
                              ? err.message
                              : c.error.fallback;
                          onAuthErrorChange(message);
                        });
                      }}
                      className="auth-input inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors hover:bg-(--auth-muted)"
                    >
                      <GoogleMark />
                      {c.google}
                    </button>

                    <div className="my-5 flex items-center gap-3">
                      <div className="h-px flex-1 bg-(--auth-line)" />
                      <span className="text-[11px] tracking-wide text-(--auth-soft) uppercase">
                        {c.or}
                      </span>
                      <div className="h-px flex-1 bg-(--auth-line)" />
                    </div>

                    <div className="flex flex-col gap-3.5">
                      {isSignup ? (
                        <div className="flex flex-col gap-2">
                          <Label
                            htmlFor="nocta-auth-name"
                            className="text-sm font-medium text-(--auth-ink)"
                          >
                            {c.signup.name}
                          </Label>
                          <Input
                            id="nocta-auth-name"
                            type="text"
                            name="name"
                            autoComplete="name"
                            placeholder={c.signup.namePlaceholder}
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            className={AUTH_INPUT_CLASS}
                          />
                        </div>
                      ) : null}

                      <div className="flex flex-col gap-2">
                        <Label
                          htmlFor="nocta-auth-email"
                          className="text-sm font-medium text-(--auth-ink)"
                        >
                          {c.email}
                        </Label>
                        <Input
                          id="nocta-auth-email"
                          type="email"
                          name="email"
                          autoComplete="email"
                          placeholder={c.emailPlaceholder}
                          value={email}
                          onChange={(e) => onEmailChange(e.target.value)}
                          className={AUTH_INPUT_CLASS}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex h-5 items-center justify-between gap-3">
                          <Label
                            htmlFor="nocta-auth-password"
                            className="text-sm font-medium text-(--auth-ink)"
                          >
                            {c.password}
                          </Label>
                          {authMode === "login" ? (
                            <button
                              type="button"
                              className="auth-link shrink-0 cursor-pointer text-xs transition-opacity hover:opacity-80"
                            >
                              {c.login.forgot}
                            </button>
                          ) : (
                            <span aria-hidden className="invisible text-xs">
                              {c.login.forgot}
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
                          placeholder={c.passwordPlaceholder}
                          value={password}
                          onChange={onPasswordChange}
                          visible={showPassword}
                          onVisibleChange={onShowPasswordChange}
                        />
                      </div>

                      {isSignup ? (
                        <div className="flex flex-col gap-2">
                          <Label
                            htmlFor="nocta-auth-confirm"
                            className="text-sm font-medium text-(--auth-ink)"
                          >
                            {c.signup.confirmPassword}
                          </Label>
                          <PasswordField
                            id="nocta-auth-confirm"
                            name="confirmPassword"
                            autoComplete="new-password"
                            placeholder={c.signup.confirmPlaceholder}
                            value={confirmPassword}
                            onChange={onConfirmPasswordChange}
                            visible={showConfirmPassword}
                            onVisibleChange={onShowConfirmPasswordChange}
                          />
                        </div>
                      ) : null}
                    </div>
                  </form>
                </div>

                {/* Sticky footer */}
                <div className="auth-footer border-t px-6 pt-4 pb-6 sm:px-8 sm:pt-5 sm:pb-7">
                  <button
                    type="submit"
                    form="nocta-auth-form"
                    disabled={authBusy || routeLeaving}
                    className="auth-cta inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-70"
                  >
                    {isSignup ? c.signup.cta : c.login.cta}
                  </button>
                  <p className="mt-4 text-center text-sm text-(--auth-soft)">
                    {isSignup
                      ? c.signup.switchPrompt
                      : c.login.switchPrompt}{" "}
                    <button
                      type="button"
                      className="auth-link cursor-pointer font-medium transition-opacity hover:opacity-80"
                      onClick={() =>
                        onSwitchMode(isSignup ? "login" : "signup")
                      }
                    >
                      {isSignup
                        ? c.signup.switchAction
                        : c.login.switchAction}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={authError != null}
        onOpenChange={(next) => {
          if (!next) onAuthErrorChange(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          overlayClassName="z-[60] bg-nocta-night/55 duration-200 supports-backdrop-filter:backdrop-blur-sm"
          className="z-60 w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl border-0 bg-nocta-paper p-0 text-foreground shadow-[0_20px_48px_rgba(0,0,0,0.35)] ring-1 ring-border sm:max-w-sm"
        >
          <DialogHeader className="gap-2 px-5 pt-5 pb-1 sm:px-6 sm:pt-6">
            <DialogTitle className="font-sans text-xl font-semibold tracking-[-0.03em]">
              {c.error.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-muted-foreground">
              {authError}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mx-0 mb-0 rounded-none border-border/60 bg-muted/40 px-5 py-4 sm:justify-stretch sm:px-6">
            <Button
              type="button"
              className="h-11 w-full cursor-pointer rounded-full"
              onClick={() => onAuthErrorChange(null)}
            >
              {c.error.dismiss}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
