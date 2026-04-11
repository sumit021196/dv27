export default function Section({
  title,
  subtitle,
  children,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="py-6 md:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between text-center md:text-left gap-4 mb-8 md:mb-12">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase text-foreground leading-none">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-3 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-foreground/40 max-w-[280px] md:max-w-none">
                {subtitle}
              </p>
            ) : null}
          </div>
          {ctaHref && ctaLabel ? (
            <a
              href={ctaHref}
              className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent border-b border-brand-accent/30 pb-1 hover:border-brand-accent transition-all md:mb-1"
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </section>
  );
}
