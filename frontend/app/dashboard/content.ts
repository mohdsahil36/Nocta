export const dashboardContent = {
  brand: "Nocta",
  sidebar: {
    eyebrow: "Nightly focus",
    navLabel: "Navigate",
    tagline: "One meaningful action",
    taglineSupport: "Score what matters. Close the night with clarity.",
  },
  nav: {
    tonight: "Tonight",
    goals: "Goals",
    reflect: "Reflect",
    activity: "Activity",
  },
  greeting: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    night: "Still up?",
    welcome: (name: string) => `Welcome back, ${name}.`,
    fallbackName: "there",
  },
  actions: {
    platformCommits: "Platform commits",
    logout: "Log out",
    openSidebar: "Open sidebar",
    closeSidebar: "Close sidebar",
    themeLight: "Switch to light mode",
    themeDark: "Switch to dark mode",
  },
  tonight: {
    eyebrow: "Tonight",
    title: "One next step",
    body: "When your goals are in, Nocta will score them and pick a single action for the night.",
    emptyCta: "Goals come next",
  },
  pulse: {
    eyebrow: "This week",
    title: "Quiet pulse",
    body: "Streaks and neglected areas will live here — calm signals, not another feed.",
  },
  tip: {
    eyebrow: "Remember",
    title: "Rest counts",
    body: "A recovery night is a valid priority. Protect it when the score says so.",
  },
};
