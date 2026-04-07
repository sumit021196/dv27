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
    <section className="py-8 md:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 mb-6 md:mb-10">
          <div>
            <h2 className="text-xl md:text-3xl lg:text-5xl font-black tracking-tighter uppercase text-foreground leading-none">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 md:mt-4 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-foreground/40">
                {subtitle}
              </p>
            ) : null}
          </div>
          {ctaHref && ctaLabel ? (
            <a
              href={ctaHref}
              className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-foreground border-b-2 border-brand-accent pb-1 hover:text-brand-accent transition-all"
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
