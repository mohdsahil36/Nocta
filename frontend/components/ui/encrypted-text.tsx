"use client";
import React, { useEffect, useRef, useState } from "react";
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
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [revealCount, setRevealCount] = useState(0);
  const [scramble, setScramble] = useState<string>(() => text);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const lastFlipTimeRef = useRef(0);
  const scrambleCharsRef = useRef<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Begin once mounted + (in view, or immediate for hero)
  useEffect(() => {
    if (!mounted) return;
    if (playOnMount || isInView) setActive(true);
  }, [mounted, playOnMount, isInView]);

  useEffect(() => {
    if (!active || !text) return;

    const initial = generateGibberishPreservingSpaces(text, charset);
    scrambleCharsRef.current = initial.split("");
    setScramble(initial);
    setRevealCount(0);
    startTimeRef.current = performance.now();
    lastFlipTimeRef.current = startTimeRef.current;

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

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      isCancelled = true;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, text, revealDelayMs, charset, flipDelayMs]);

  if (!text) return null;

  // Stable SSR / pre-mount: real headline, no random chars
  if (!mounted || !active) {
    return (
      <span ref={ref} className={cn(className)} aria-label={text}>
        {text}
      </span>
    );
  }

  return (
    <motion.span
      ref={ref}
      className={cn(className)}
      aria-label={text}
      role="text"
    >
      {text.split("").map((char, index) => {
        const isRevealed = index < revealCount;
        const displayChar = isRevealed
          ? char
          : char === " "
            ? " "
            : (scramble[index] ?? char);

        return (
          <span
            key={index}
            className={cn(isRevealed ? revealedClassName : encryptedClassName)}
          >
            {displayChar}
          </span>
        );
      })}
    </motion.span>
  );
};
