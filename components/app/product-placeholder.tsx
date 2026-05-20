import Link from "next/link"

type ProductPlaceholderProps = {
  title: string
  description: string
}

export function ProductPlaceholder({ title, description }: ProductPlaceholderProps) {
  return (
    <div className="view-enter mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-mint">
        Authenticated preview
      </p>
      <h1 className="font-display mt-2 text-3xl tracking-tight text-white-mint sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-text sm:text-base">
        {description}
      </p>
      <p className="mt-6 text-xs text-slate-text">
        Charts and data wiring follow{" "}
        <span className="font-mono text-white-mint/90">949fantasy-page-content-spec.md</span>{" "}
        and{" "}
        <span className="font-mono text-white-mint/90">949fantasy-metrics-glossary.md</span>.
        Open the{" "}
        <Link href="/" className="text-mint underline-offset-2 hover:underline">
          marketing home
        </Link>{" "}
        for the public preview.
      </p>
    </div>
  )
}
