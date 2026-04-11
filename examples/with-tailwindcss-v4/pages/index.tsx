import React from 'react';

const badges = [
  'Tailwind CSS v4',
  '@tailwindcss/postcss',
  'extraPostCSSPlugins',
  'User-land setup',
];

const cards = [
  {
    title: 'CSS-first entry',
    description:
      'The example imports tailwind.css directly and lets PostCSS expand the framework styles during bundling.',
  },
  {
    title: 'Works with Umi config',
    description:
      'This example passes @tailwindcss/postcss through extraPostCSSPlugins and lets bundler-utoopack bridge it into its PostCSS pipeline.',
  },
  {
    title: 'No generated temp CSS',
    description:
      'Tailwind v4 runs directly in the normal PostCSS pipeline, so there is no separate CLI process generating a temp stylesheet.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Tailwind CSS v4 via extraPostCSSPlugins
        </div>

        <h1 className="mt-8 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl">
          Umi + Tailwind CSS v4 without the extra CLI step.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          This example shows a pure user-land Tailwind CSS v4 setup for Umi by
          wiring @tailwindcss/postcss through extraPostCSSPlugins and importing
          the stylesheet from app.tsx.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/10"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                Example
              </p>
              <h2 className="mt-4 text-2xl font-bold text-white">
                {card.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {card.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/20 via-slate-900 to-fuchsia-400/10 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">
                Current setup
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                extraPostCSSPlugins
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
              <div className="rounded-2xl bg-slate-900/60 px-4 py-3 ring-1 ring-white/10">
                <p className="text-slate-400">Tailwind package</p>
                <p className="mt-1 font-semibold text-white">tailwindcss@4</p>
              </div>
              <div className="rounded-2xl bg-slate-900/60 px-4 py-3 ring-1 ring-white/10">
                <p className="text-slate-400">PostCSS package</p>
                <p className="mt-1 font-semibold text-white">
                  @tailwindcss/postcss
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
