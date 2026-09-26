export const loginContent = {
  brand: "Nocta",
  nav: {
    howItWorks: "How it works",
    about: "About",
    cta: "Get started",
  },
  hero: {
    wordmark: "Nocta",
    title: "Decide tonight",
    tagline: "One meaningful action, every night.",
    body: "Each evening, Nocta scores your goals, picks one next step, and protects rest when you need it.",
    rotating: [
      "Deadlines and neglect — not noise — set the score.",
      "One next step. Then the night is yours.",
      "Recovery nights count. Rest is a valid priority.",
      "Quiet categories rise when they have waited too long.",
      "Leave the desk with clarity, not another list.",
    ],
    primaryCta: "Start tonight",
    secondaryCta: "See how it works",
  },
  why: {
    eyebrow: "Why Nocta exists",
    before: "After work the list never ended, and the night was already short.",
    // Italic line — lights up on scroll
    emphasis: "Score what matters. Pick one next step.",
    after: "Let rest stay honest.",
  },
  features: {
    title: "How Nocta works.",
    items: [
      {
        id: "scoring",
        title: "Deterministic scoring",
        description:
          "Clear rules on deadlines and neglect decide priority — never a model guessing what matters.",
        span: "third",
      },
      {
        id: "one-action",
        title: "One action, not a list",
        description:
          "Tonight ends with a single next step, so you close the laptop knowing what mattered.",
        span: "two-thirds",
      },
      {
        id: "reflection",
        title: "Weekly reflection",
        description:
          "A short weekly pass to notice patterns — without turning life into a dashboard.",
        span: "third",
      },
      {
        id: "recovery",
        title: "Recovery nights",
        description:
          "Some nights the right action is rest. Nocta protects that choice without guilt.",
        span: "third",
      },
      {
        id: "neglected",
        title: "Neglected-area tracking",
        description:
          "Quiet goal categories surface when they have been ignored for too long.",
        span: "third",
      },
    ],
  },
  close: {
    title: "Tonight, do one thing that matters",
    body: "Open Nocta after work, see the score, and choose a single action before you sleep.",
    cta: "Get started",
  },
  footer: {
    copyright: "© 2026 Nocta. All rights reserved.",
    credit: "Built by Mohd Sahil Siddiqui",
  },
  auth: {
    panelTitle: "One meaningful action, every night.",
    panelBody: "The calm way to decide what matters before you sleep.",
    google: "Continue with Google",
    or: "or",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "Your password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    // Auth later
    close: "Close",
    login: {
      tab: "Sign in",
      title: "Welcome back",
      body: "Sign in to continue your evening.",
      forgot: "Forgot password?",
      cta: "Sign in",
      switchPrompt: "New to Nocta?",
      switchAction: "Create an account",
    },
    signup: {
      tab: "Sign up",
      title: "Create your account",
      body: "Start with one clear action tonight.",
      name: "Name",
      namePlaceholder: "Your name",
      confirmPassword: "Confirm password",
      confirmPlaceholder: "Repeat your password",
      cta: "Create account",
      switchPrompt: "Already have an account?",
      switchAction: "Sign in",
    },
  },
} as const;

export type NoctaFeatureId = (typeof loginContent.features.items)[number]["id"];
