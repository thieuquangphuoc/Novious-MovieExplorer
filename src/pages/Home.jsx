import { useState, useEffect } from "react";
import { getHeroMovies, getTopRated } from "../services/api";
import Hero from "../components/home/Hero";
import ScrollRow from "../components/home/ScrollRow";
import MovieMachine from "../components/home/MovieMachine";
import OneMovieChallenge from "../components/home/OneMovieChallenge";
import TrailerSection from "../components/home/TrailerSection";

const SLIDE_MS = 4000;    // auto-advance every 4 seconds

const SLIDE_WIDTH = 76;
const ROW_PAGES = 4;      // four TMDB pages, so roughly 80 films per row
const trackOffset = (index) => (100 - SLIDE_WIDTH) / 2 - index * SLIDE_WIDTH;

const Home = () => {
  const [heroMovies, setHeroMovies] = useState([]);
  const [index, setIndex] = useState(0);

  const [topRated, setTopRated] = useState([]);

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

      
      <TrailerSection />
      <MovieMachine />
      <ScrollRow title="Top rated of all time" movies={topRated} />
      <OneMovieChallenge />

      
    </div>
  );
};

export default Home;
