import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getTrending } from "../services/api";

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

const footerLinks = [
  { path: "/", title: "Home" },
  { path: "/discover", title: "Discover" },
  { path: "/quiz", title: "Quiz" },
  { path: "/insights", title: "Insights" },
];

/*
 * The footer, shared by every page.
 *
 * Its background is a carpet of real posters pulled from TMDB, blurred hard
 * and covered with a dark wash, so it reads as colour and texture rather
 * than competing with the text in front of it.
 *
 * The posters are repeated because /trending only returns twenty films and
 * the grid needs more tiles than that on a wide screen.
 *
 * The whole background block is aria-hidden: it is pure decoration, and a
 * screen reader should not have to announce forty film titles before it
 * reaches the footer content.
 */
const Footer = () => {
  const [posters, setPosters] = useState([]);

  useEffect(() => {
    const load = async () => {
      const movies = await getTrending("week");
      const paths = movies.filter((movie) => movie.poster_path).map((movie) => movie.poster_path);
      setPosters([...paths, ...paths]);
    };
    load();
  }, []);

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/10">
      {/* ===== DECORATIVE BACKGROUND ===== */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="grid h-full w-full grid-cols-6 sm:grid-cols-10 lg:grid-cols-12">
          {posters.map((path, index) => (
            <img
              key={`${path}-${index}`}
              src={`${POSTER_BASE}${path}`}
              alt=""
              className="aspect-[2/3] w-full object-cover"
            />
          ))}
        </div>

        {/* blur and darken so the text in front stays readable */}
        <div className="absolute inset-0 bg-[#141414]/70 backdrop-blur-[6px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#141414] via-[#141414]/40 to-[#141414]" />
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <img src={`${import.meta.env.BASE_URL}logo-96.png`} alt="" className="h-10 w-10" />
              <p className="font-display text-3xl tracking-[0.15em] text-white">NOVIOUS</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              Browse what the world is watching, search the catalogue, test your film
              knowledge, and see the numbers behind the trends.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Explore
            </p>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className="text-sm text-neutral-300 transition-colors hover:text-[#E50914]"
                  >
                    {link.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="max-w-xs">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Data
            </p>
            <p className="text-sm leading-relaxed text-neutral-400">
              All film data, posters and stills come from{" "}
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-200 underline decoration-[#E50914] underline-offset-4 hover:text-[#E50914]"
              >
                TMDB
              </a>
              . Novious shows information only — there is no video playback.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Final project | Web Programming I
          </p>
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
