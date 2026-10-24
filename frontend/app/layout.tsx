import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { ThemeSync } from "@/app/store/themeStore";
import "./globals.css";
import { Providers } from "./providers";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  applicationName: "Nocta",
  title: {
    default: "Nocta",
    template: "%s · Nocta",
  },
  description: "One meaningful action, every night.",
};

/** Apply stored / system theme before paint (light fallback). Surface = CSS --nocta-paper. */
const themeBoot = `(function(){try{var s=localStorage.getItem("nocta-theme");var sys=!!(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);var dark=s==="dark"||(s!=="light"&&sys);document.documentElement.classList.toggle("dark",dark);document.documentElement.style.backgroundColor="";var b=document.body;if(b)b.style.backgroundColor="";}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistMono.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        {/* Native script — next/script in <head> trips a client console error in App Router */}
        <script
          id="nocta-theme-boot"
          dangerouslySetInnerHTML={{ __html: themeBoot }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-nocta-canvas text-foreground"
      >
        <ThemeSync />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
