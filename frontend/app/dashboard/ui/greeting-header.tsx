"use client";

import { useEffect, useState } from "react";

import { dashboardContent } from "../content";
import {
  getDisplayName,
  greetingForHour,
  welcomeMessage,
} from "../functions/dashboard";

/** Navbar welcome — sans, matching landing type hierarchy. */
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
      <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase sm:text-xs">
        {timeGreeting}
      </p>
      <h1 className="mt-1 truncate font-sans text-xl leading-tight font-semibold tracking-[-0.03em] text-nocta-ink sm:text-2xl">
        {welcome}
      </h1>
    </div>
  );
}
