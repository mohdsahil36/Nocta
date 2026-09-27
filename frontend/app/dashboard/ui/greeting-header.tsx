"use client";

import { useEffect, useState } from "react";

import { dashboardContent } from "../content";
import {
  getDisplayName,
  greetingForHour,
  welcomeMessage,
} from "../functions/dashboard";

/**
 * Scenic-navbar welcome — time line + name as the strip’s focal content.
 */
export function GreetingHeader() {
  const [timeGreeting] = useState(() => greetingForHour(new Date().getHours()));
  const [welcome, setWelcome] = useState(
    welcomeMessage(dashboardContent.greeting.fallbackName),
  );

  useEffect(() => {
    void getDisplayName().then((name) => {
      setWelcome(welcomeMessage(name));
    });
  }, []);

  return (
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium tracking-wide text-nocta-ink/60 sm:text-xs dark:text-muted-foreground">
        {timeGreeting}
      </p>
      <h1 className="mt-0.5 truncate font-serif text-xl tracking-[-0.03em] text-nocta-ink sm:text-2xl">
        {welcome}
      </h1>
    </div>
  );
}
