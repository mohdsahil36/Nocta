"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { dashboardContent } from "../content";
import { getDisplayName, navbarGreeting } from "../functions/dashboard";

/** Navbar greeting — one calm line: "Good afternoon, Sahil". */
export function GreetingHeader() {
  // Greeting-only until the session name resolves (never flash ", there").
  const [line, setLine] = useState(() =>
    navbarGreeting(12, dashboardContent.greeting.fallbackName),
  );

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const hour = new Date().getHours();
      const name = await getDisplayName();
      if (!cancelled) setLine(navbarGreeting(hour, name));
    };

    void refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-w-0 flex-1">
      <h1 className="truncate font-sans text-[0.95rem] leading-snug font-medium tracking-[-0.02em] text-nocta-ink sm:text-lg sm:leading-tight">
        {line}
      </h1>
    </div>
  );
}
