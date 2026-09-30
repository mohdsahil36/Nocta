"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

type EncryptedTextProps = {
  text: string;
  className?: string;
  revealDelayMs?: number;
  charset?: string;
  flipDelayMs?: number;
  encryptedClassName?: string;
  revealedClassName?: string;
  /** Start as soon as mounted (hero). Default waits until in view. */
  playOnMount?: boolean;
  /** Replay scramble→reveal after finishing. */
  loop?: boolean;
  /** Pause after a full reveal before restarting (ms). */
  loopDelayMs?: number;
};

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";

function generateRandomCharacter(charset: string): string {
  const index = Math.floor(Math.random() * charset.length);
  return charset.charAt(index);
}

function generateGibberishPreservingSpaces(
  original: string,
  charset: string,
): string {
  if (!original) return "";
  let result = "";
  for (let i = 0; i < original.length; i += 1) {
    const ch = original[i];
    result += ch === " " ? " " : generateRandomCharacter(charset);
  }
  return result;
}

/** true after hydration; false on the server (stable SSR text). */
function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Decrypt reveal — SSR-safe (plain text first), then scramble on client.
 */
export const EncryptedText: React.FC<EncryptedTextProps> = ({
  text,
  className,
  revealDelayMs = 50,
  charset = DEFAULT_CHARSET,
  flipDelayMs = 50,
  encryptedClassName,
  revealedClassName,
  playOnMount = false,
  loop = false,
  loopDelayMs = 5000,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const mounted = useIsMounted();
  const active = mounted && (playOnMount || isInView);
  const [cycle, setCycle] = useState(0);
  const [revealCount, setRevealCount] = useState(0);
  const [scramble, setScramble] = useState<string>(() => text);
  const animationFrameRef = useRef<number | null>(null);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);
  const lastFlipTimeRef = useRef(0);
  const scrambleCharsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!active || !text) return;

    let isCancelled = false;

    const update = (now: number) => {
      if (isCancelled) return;

      const totalLength = text.length;
      const currentRevealCount = Math.min(
        totalLength,
        Math.floor((now - startTimeRef.current) / Math.max(1, revealDelayMs)),
      );
      setRevealCount(currentRevealCount);

      if (currentRevealCount >= totalLength) {
        setScramble(text);
        if (loop) {
          loopTimeoutRef.current = setTimeout(
            () => {
              if (!isCancelled) setCycle((n) => n + 1);
            },
            Math.max(0, loopDelayMs),
          );
        }
        return;
      }

      if (now - lastFlipTimeRef.current >= Math.max(0, flipDelayMs)) {
        for (let index = 0; index < totalLength; index += 1) {
          if (index >= currentRevealCount) {
            scrambleCharsRef.current[index] =
              text[index] === " " ? " " : generateRandomCharacter(charset);
          }
        }
        lastFlipTimeRef.current = now;
        setScramble(scrambleCharsRef.current.join(""));
      }

      animationFrameRef.current = requestAnimationFrame(update);
    };

    // Kick off via rAF so setState lives in the frame callback, not the effect body.
    animationFrameRef.current = requestAnimationFrame((now) => {
      if (isCancelled) return;
      const initial = generateGibberishPreservingSpaces(text, charset);
      scrambleCharsRef.current = initial.split("");
      setScramble(initial);
      setRevealCount(0);
      startTimeRef.current = now;
      lastFlipTimeRef.current = now;
      animationFrameRef.current = requestAnimationFrame(update);
    });

    return () => {
      isCancelled = true;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (loopTimeoutRef.current !== null) {
        clearTimeout(loopTimeoutRef.current);
        loopTimeoutRef.current = null;
      }
    };
  }, [
    active,
    text,
    revealDelayMs,
    charset,
    flipDelayMs,
    loop,
    loopDelayMs,
    cycle,
  ]);

  if (!text) return null;

  // Stable SSR / pre-mount: real headline, no random chars
  if (!active) {
    return (
      <span ref={ref} className={cn(className)} aria-label={text}>
        {text}
      </span>
    );
  }

  // Split into words so wrap happens at spaces only — never mid-word
  // (inline-block glyphs would otherwise break "night" → "nig" / "ht").
  const tokens: { start: number; chars: string }[] = [];
  {
    let i = 0;
    while (i < text.length) {
      if (text[i] === " ") {
        tokens.push({ start: i, chars: " " });
        i += 1;
        continue;
      }
      const start = i;
      while (i < text.length && text[i] !== " ") i += 1;
      tokens.push({ start, chars: text.slice(start, i) });
    }
  }

  return (
    <motion.span
      ref={ref}
      className={cn("inline", className)}
      aria-label={text}
      role="text"
    >
      {tokens.map((token) => {
        if (token.chars === " ") {
          return <span key={`sp-${token.start}`}> </span>;
        }

        return (
          <span key={`w-${token.start}`} className="inline-block whitespace-nowrap">
            {token.chars.split("").map((char, offset) => {
              const index = token.start + offset;
              const isRevealed = index < revealCount;
              const displayChar = isRevealed
                ? char
                : (scramble[index] ?? char);

              // Glyphs reserve final character width so scramble↔reveal
              // never reflows the hero.
              return (
                <span
                  key={index}
                  className={cn(
                    "relative inline-block",
                    isRevealed ? revealedClassName : encryptedClassName,
                  )}
                >
                  <span aria-hidden className="invisible">
                    {char}
                  </span>
                  <span className="absolute inset-0 flex justify-center">
                    {displayChar}
                  </span>
                </span>
              );
            })}
          </span>
        );
      })}
    </motion.span>
  );
};
