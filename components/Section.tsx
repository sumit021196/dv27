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
    <section className="py-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-gray-900">{subtitle}</p>
            ) : null}
          </div>
          {ctaHref && ctaLabel ? (
            <a
              href={ctaHref}
              className="hidden md:inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
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
