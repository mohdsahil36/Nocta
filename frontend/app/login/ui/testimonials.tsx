/** Testimonials strip — 3 cards in a bordered grid, autosend-style. */
export function Testimonials() {
  const items = [
    {
      quote:
        "I stopped staring at my task list wondering what to touch. Nocta just gives me one thing and a reason. That's it.",
      name: "Aditya R.",
      role: "Senior SWE, early user",
    },
    {
      quote:
        "The scorer doesn't guess. It uses the numbers I gave it — deadline, neglect, weight. Feels honest in a way that AI todo apps don't.",
      name: "Priya M.",
      role: "Product manager, beta",
    },
    {
      quote:
        "Recovery nights are underrated. Knowing the system won't punish me for resting actually makes me more consistent.",
      name: "Keiran T.",
      role: "Indie builder",
    },
  ];

  return (
    <section className="border-t border-stone-200 dark:border-neutral-800">
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 dark:divide-neutral-800">
        {items.map(({ quote, name, role }) => (
          <div
            key={name}
            className="flex flex-col gap-4 px-6 py-8 sm:px-8 bg-stone-50 dark:bg-neutral-950 hover:bg-stone-100 dark:hover:bg-neutral-900 transition-colors duration-150"
          >
            <p className="font-mono text-[13px] leading-7 text-neutral-700 dark:text-neutral-300 flex-1">
              "{quote}"
            </p>
            <div>
              <p className="font-mono text-[12px] font-semibold text-neutral-950 dark:text-neutral-50">
                {name}
              </p>
              <p className="font-mono text-[11px] text-stone-500 dark:text-neutral-500 mt-0.5">
                {role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
