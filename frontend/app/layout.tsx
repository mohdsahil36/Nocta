import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
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
  title: "Cadence",
  description: "Engineering activity intelligence",
};

/** Apply stored / evening-aware theme before paint (inline — not next/script). */
const themeBoot = `(function(){try{var s=localStorage.getItem("nocta-theme");var h=new Date().getHours();var dark=s==="dark"||(s!=="light"&&(h>=17||h<7));var c=dark?"#0a0a0a":"#f4f5f8";document.documentElement.classList.toggle("dark",dark);document.documentElement.style.backgroundColor=c;var b=document.body;if(b)b.style.backgroundColor=c;}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans"
      >
        {children}
      </body>
    </html>
  );
}
