import { useState, useEffect } from "react";
import { getHeroMovies, getTopRated } from "../services/api";
import Hero from "../components/Hero";
import ScrollRow from "../components/ScrollRow";
import MovieMachine from "../components/MovieMachine";
import TrailerSection from "../components/TrailerSection";

const SLIDE_MS = 4000;    // auto-advance every 4 seconds

/*
 * Geometry of the hero carousel.
 *
 * Each card takes SLIDE_WIDTH% of the width, leaving the rest split evenly
 * between the two edges, where the previous and next films peek in.
 *
 * To centre card i the track shifts by 50% minus the centre of that card,
 * which is what trackOffset works out.
 *
 * The two numbers are tied together. A card off to the side is also scaled
 * down, and scaling pulls its edges inward, away from the screen edge — so
 * shrinking the neighbours eats into the peek. At 86% wide and 0.84 scale
 * the neighbours retreated so far that nothing showed at all, and 82% with
 * 0.90 still left only about 43px. 76% with a 0.92 scale shows roughly 90px
 * of artwork on each side, which reads clearly as another film waiting.
 */
const SLIDE_WIDTH = 76;
const ROW_PAGES = 4;      // four TMDB pages, so roughly 80 films per row
const trackOffset = (index) => (100 - SLIDE_WIDTH) / 2 - index * SLIDE_WIDTH;

const Home = () => {
  const [heroMovies, setHeroMovies] = useState([]);
  const [index, setIndex] = useState(0);

  const [topRated, setTopRated] = useState([]);

  /*
   * Load what this page owns, once, on mount.
   *
   * The two calls run in parallel through Promise.all because neither
   * depends on the other. MovieMachine and TrailerSection fetch their own
   * data, since what they need changes with the decade or tab the visitor
   * picks and only they know which one that is.
   */
  useEffect(() => {
    const load = async () => {
      const [hero, rated] = await Promise.all([
        getHeroMovies(),
        getTopRated(ROW_PAGES),
      ]);
      setHeroMovies(hero);
      setTopRated(rated);
    };
    load();
  }, []);

  /*
   * The auto-advance clock.
   *
   * index sits in the dependency array on purpose: every time the visitor
   * presses an arrow the effect re-runs, the old interval is cleared and the
   * four seconds start again. Without that, pressing an arrow just before
   * the old timer fired would jump straight on to the next film.
   */
  useEffect(() => {
    if (heroMovies.length === 0) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroMovies.length);
    }, SLIDE_MS);

    return () => clearInterval(timer);
  }, [heroMovies.length, index]);

  const goPrev = () => setIndex((index - 1 + heroMovies.length) % heroMovies.length);
  const goNext = () => setIndex((index + 1) % heroMovies.length);

  return (
    // pt-24 clears the fixed navigation bar floating above the page
    <div className="pt-24">
      {/* ===== HERO CAROUSEL ===== */}
      {heroMovies.length === 0 ? (
        // grey block of the right height so the page does not jump when the images land
        <div className="mx-auto h-[58vh] max-h-[560px] min-h-[400px] w-[86%] animate-pulse rounded-xl bg-[#1c1c1c]" />
      ) : (
        <div className="group/hero relative overflow-hidden py-4">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(${trackOffset(index)}%)` }}
          >
            {heroMovies.map((movie, i) => (
              <div
                key={movie.id}
                className="h-[58vh] max-h-[560px] min-h-[400px] shrink-0 px-2 transition-all duration-700 ease-out"
                style={{ width: `${SLIDE_WIDTH}%` }}
              >
                {/* only the centre card is at full size; the neighbours sit back */}
                <div
                  className={`h-full transition-all duration-700 ease-out ${
                    i === index ? "scale-[1.04] opacity-100" : "scale-[0.92] opacity-60"
                  }`}
                >
                  <Hero movie={movie} isActive={i === index} />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={goPrev}
            aria-label="Previous movie"
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white opacity-70 transition hover:bg-[#E50914] hover:opacity-100 focus:opacity-100 lg:p-3"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goNext}
            aria-label="Next movie"
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white opacity-70 transition hover:bg-[#E50914] hover:opacity-100 focus:opacity-100 lg:p-3"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* dots show which film is centred, and jump straight to it */}
          <div className="mt-5 flex justify-center gap-2">
            {heroMovies.map((movie, i) => (
              <button
                key={movie.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to ${movie.title}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-[#E50914]" : "w-4 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ===== FILM ROWS ===== */}
      
      <TrailerSection />
      <MovieMachine />

      <ScrollRow title="Top rated of all time" movies={topRated} />

      {/* Parked, not deleted. Both rows still work — ScrollRow and the
          trending endpoints are untouched — so either can come back with
          one line plus its fetch:
          <ScrollRow title="Trending this week" movies={trendingWeek} />
          <ScrollRow title="Top 10 today" movies={trendingDay} numbered limit={10} /> */}
    </div>
  );
};

export default Home;
