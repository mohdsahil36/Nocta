"use client";

import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { useEffect } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
  /** Seconds between each character reveal. Default 0.1. */
  charDelay = 0.1,
  /** Seconds for each character fade-in. Default 0.3. */
  charDuration = 0.3,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
  charDelay?: number;
  charDuration?: number;
}) => {
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { amount: 0.2 });

  useEffect(() => {
    if (!isInView) return;

    void animate(
      "span[data-tw-char]",
      {
        display: "inline-block",
        opacity: 1,
        width: "fit-content",
      },
      {
        duration: charDuration,
        delay: stagger(charDelay),
        ease: "easeInOut",
      },
    );
  }, [isInView, animate, charDelay, charDuration]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <motion.span
                  data-tw-char
                  initial={{}}
                  key={`char-${index}`}
                  className={cn(
                    `hidden text-black opacity-0 dark:text-white`,
                    word.className,
                  )}
                >
                  {char}
                </motion.span>
              ))}
              {idx < wordsArray.length - 1 ? <span>&nbsp;</span> : null}
            </div>
          );
        })}
      </motion.div>
    );
  };
  return (
    <div
      className={cn(
        "text-center text-base font-bold sm:text-xl md:text-3xl lg:text-5xl",
        className,
      )}
    >
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block h-4 w-1 rounded-sm bg-blue-500 md:h-6 lg:h-10",
          cursorClassName,
        )}
      ></motion.span>
    </div>
  );
};

/**
 * Smooth left→right reveal of the full line (not per-character typing).
 * Full text is always in the layout — nothing gets truncated mid-loop.
 */
export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
  /** Total reveal duration in seconds. */
  duration = 2.4,
  /** Delay before reveal starts. */
  delay = 0.15,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
  duration?: number;
  delay?: number;
}) => {
  const renderWords = () =>
    words.map((word, idx) => (
      <span key={`word-${idx}`}>
        <span className={cn("text-black dark:text-white", word.className)}>
          {word.text}
        </span>
        {idx < words.length - 1 ? " " : null}
      </span>
    ));

  const cursor = (
    <motion.span
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className={cn(
        "ml-1 inline-block h-[0.85em] w-[2.5px] translate-y-[0.06em] align-baseline rounded-sm bg-blue-500",
        cursorClassName,
      )}
    />
  );

  return (
    <div
      className={cn("relative inline-block max-w-full text-center", className)}
    >
      {/* Layout sizer — full sentence + cursor width */}
      <span className="invisible select-none" aria-hidden>
        {renderWords()}
        <span className="ml-1 inline-block h-[0.85em] w-[2.5px] align-baseline" />
      </span>

      <motion.span
        className="absolute inset-0 text-center"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {renderWords()}
        {cursor}
      </motion.span>
    </div>
  );
};
