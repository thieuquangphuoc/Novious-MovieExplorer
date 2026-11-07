import { useState, useEffect } from "react";
import { getHeroMovies, getTrending, getTopRated } from "../services/api";
import Hero from "../components/Hero";
import ScrollRow from "../components/ScrollRow";

const SLIDE_MS = 4000;    // auto-advance every 4 seconds

/*
 * Geometry of the hero carousel.
 *
 * Each card takes 86% of the width, so 14% is left over — 7% on each side,
 * where the previous and next films peek in.
 *
 * To centre card i, the track shifts by 50% minus the centre of that card:
 *   50 - (i + 0.5) * 86  =  7 - i * 86
 * which is exactly the formula used below. Changing SLIDE_WIDTH alone keeps
 * the maths correct, so the amount of peek is a one-number decision.
 */
const SLIDE_WIDTH = 86;
const trackOffset = (index) => (100 - SLIDE_WIDTH) / 2 - index * SLIDE_WIDTH;

const Home = () => {
  const [heroMovies, setHeroMovies] = useState([]);
  const [index, setIndex] = useState(0);

  const [trendingWeek, setTrendingWeek] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [trendingDay, setTrendingDay] = useState([]);

  /*
   * Load everything the page needs, once, on mount.
   *
   * The four calls run in parallel through Promise.all because none of them
   * depends on another — awaiting them one by one would simply take four
   * times as long for no benefit.
   */
  useEffect(() => {
    const load = async () => {
      const [hero, week, rated, day] = await Promise.all([
        getHeroMovies(),
        getTrending("week"),
        getTopRated(),
        getTrending("day"),
      ]);
      setHeroMovies(hero);
      setTrendingWeek(week);
      setTopRated(rated);
      setTrendingDay(day);
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
        <div className="group/hero relative overflow-hidden">
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
                    i === index ? "scale-100 opacity-100" : "scale-90 opacity-40"
                  }`}
                >
                  <Hero movie={movie} />
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
      <ScrollRow title="Trending this week" movies={trendingWeek} />
      <ScrollRow title="Top rated of all time" movies={topRated} />
      <ScrollRow title="Top 10 today" movies={trendingDay} numbered limit={10} />
    </div>
  );
};

export default Home;
