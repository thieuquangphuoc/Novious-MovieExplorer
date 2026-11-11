import { useState, useEffect } from "react";
import {
  loadInsightDataset,
  headlineStats,
  genresInSet,
} from "../services/insights";
import CountUp from "../components/common/CountUp";
import Reveal from "../components/insights/Reveal";
import SuccessMatrix from "../components/insights/SuccessMatrix";
import BoxOfficeDNA from "../components/insights/BoxOfficeDNA";
import HiddenGems from "../components/insights/HiddenGems";
import GenreWars from "../components/insights/GenreWars";

const Section = ({ number, kicker, title, children }) => (
  <section className="rule-top py-16 sm:py-20">
    <Reveal>
      <p className="tick mb-3 text-[11px] uppercase tracking-[0.3em] text-neutral-500">
        {number} — {kicker}
      </p>
      <h2 className="mb-8 max-w-3xl text-2xl font-bold leading-tight text-white sm:text-4xl">
        {title}
      </h2>
    </Reveal>

    <Reveal delay={80}>{children}</Reveal>
  </section>
);

const Stat = ({ value, label, wide = false }) => (
  <div className={wide ? "sm:col-span-2" : ""}>
    <p className="text-3xl font-bold tabular-nums text-white sm:text-4xl">{value}</p>
    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-neutral-500">{label}</p>
  </div>
);

// A page-shaped placeholder, so the layout does not jump when data lands.
const Skeleton = () => (
  <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
    <div className="decoded-skeleton h-4 w-40" />
    <div className="decoded-skeleton mt-6 h-16 w-full max-w-2xl" />
    <div className="decoded-skeleton mt-3 h-5 w-full max-w-md" />

    <div className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <div className="decoded-skeleton h-9 w-24" />
          <div className="decoded-skeleton mt-2 h-3 w-20" />
        </div>
      ))}
    </div>

    <div className="decoded-skeleton mt-20 h-[26rem] w-full" />
    <p className="mt-6 text-xs uppercase tracking-[0.25em] text-neutral-600">
      Reading {" "}
      <span className="text-neutral-400">budgets, grosses and ballots</span> from TMDB…
    </p>
  </div>
);

const Insights = () => {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadInsightDataset()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#E50914]">
          No signal
        </p>
        <h1 className="mt-3 text-2xl font-bold text-white">The archive would not open</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
          This page reads every figure live from TMDB, so with the connection down there
          is nothing honest to show. Reload once you are back online — nothing here is
          stored or invented.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-7 border border-neutral-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) return <Skeleton />;

  const { movies } = data;
  const stats = headlineStats(movies);
  const genres = genresInSet(movies);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      
      <Reveal>
        <p className="text-[11px] uppercase tracking-[0.35em] text-[#E50914]">
          Novious Intelligence
        </p>

        <h1 className="mt-4 text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
          CINEMA
          <br />
          <span className="text-neutral-600">DECODED</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-400">
          The stories behind the numbers. {stats.filmCount} films from{" "}
          {stats.earliestYear} to {stats.latestYear}, read live from TMDB — what they
          cost, what they took, who turned up, and what that is worth knowing.
        </p>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-white/10 pt-10 sm:grid-cols-4">
          <Stat value={<CountUp end={stats.filmCount} duration={1.4} />} label="Films read" />
          <Stat
            value={<CountUp end={stats.averageRating} decimals={1} duration={1.6} />}
            label="Mean score"
          />
          <Stat
            value={
              <>
                $<CountUp end={stats.grossTotalBillions} decimals={1} duration={1.8} />B
              </>
            }
            label="Combined gross"
          />
          <Stat
            value={<CountUp end={stats.medianRuntime} duration={1.5} suffix=" min" />}
            label="Median runtime"
          />
        </div>

        <p className="mt-5 text-xs leading-relaxed text-neutral-600">
          TMDB holds box-office figures for {stats.moneyCoverage}% of these films. The
          rest are absent from the money charts rather than counted as zero — an empty
          field means nobody has filled it in, not that a film earned nothing.
        </p>
      </Reveal>

      <Section
        number="01"
        kicker="The Success Matrix"
        title="Does being good pay? Score against worldwide gross, one dot per film."
      >
        <SuccessMatrix movies={movies} genres={genres} />
      </Section>

      <Section
        number="02"
        kicker="Box Office DNA"
        title="What it cost against what it took — and the line where a film starts earning."
      >
        <BoxOfficeDNA movies={movies} />
      </Section>

      <Section
        number="03"
        kicker="Hidden Gems"
        title="Rated as highly as the classics, watched by almost nobody."
      >
        <HiddenGems movies={movies} />
      </Section>

      <Section
        number="04"
        kicker="Genre Wars"
        title="What each decade was making, as a share of everything it labelled."
      >
        <GenreWars movies={movies} genres={genres} />
      </Section>

      <p className="rule-top pt-8 text-xs leading-relaxed text-neutral-600">
        Every figure on this page is computed from the {stats.filmCount} films above at
        the moment you loaded it. Nothing is stored, rounded in advance or written by
        hand, so the prose and the charts cannot disagree. Data from TMDB.
      </p>
    </div>
  );
};

export default Insights;
