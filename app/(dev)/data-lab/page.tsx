import { NflDataTest } from "@/components/dev/nfl-data-test";

export default function DataLabPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <section className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-mint">949Fantasy V0</p>
        <h1 className="font-heading text-4xl text-white-mint">Data Connection Lab</h1>
        <p className="max-w-2xl text-slate-text">
          First pass for proving server-side NFL data can move into the local app without
          exposing provider keys in the browser.
        </p>
      </section>
      <NflDataTest />
    </main>
  );
}
