type GreetingHeaderProps = {
  timeGreeting: string;
  welcome: string;
};

/** Top greeting — compact in the glass navbar; readable in light and dark. */
export function GreetingHeader({ timeGreeting, welcome }: GreetingHeaderProps) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium tracking-wide text-nocta-ink/55 sm:text-xs dark:text-muted-foreground">
        {timeGreeting}
      </p>
      <h1 className="mt-0.5 truncate font-serif text-lg tracking-[-0.03em] text-nocta-ink sm:text-xl md:text-2xl">
        {welcome}
      </h1>
    </div>
  );
}
