import { useState, useEffect, useRef } from "react";
import { searchMovies } from "../../services/api";

const POSTER_BASE = "https://image.tmdb.org/t/p/w92";
const MAX_SUGGESTIONS = 6;
const DEBOUNCE_MS = 300;

const GuessInput = ({ onGuess, danger }) => {
  const [text, setText] = useState("");
  const [options, setOptions] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [searching, setSearching] = useState(false);

  const boxRef = useRef(null);

  useEffect(() => {
    if (chosen || text.trim().length < 2) return undefined;

    let cancelled = false;

    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchMovies(text.trim());
      if (cancelled) return;

      setOptions(results.filter((m) => m.release_date).slice(0, MAX_SUGGESTIONS));
      setActive(0);
      setOpen(true);
      setSearching(false);
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, chosen]);

  // a click anywhere else closes the list
  useEffect(() => {
    const onDocumentClick = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const suggestions = !chosen && text.trim().length >= 2 ? options : [];

  const choose = (movie) => {
    setChosen(movie);
    setText(movie.title);
    setOpen(false);
  };

  const reset = () => {
    setChosen(null);
    setText("");
    setOptions([]);
  };

  const submit = (event) => {
    event.preventDefault();
    if (!chosen) return;
    onGuess(chosen);
    reset();
  };

  const onKeyDown = (event) => {
    if (!open || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(suggestions[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <form onSubmit={submit} className="relative" ref={boxRef}>
      <div className="grid gap-2">
        <div className="relative">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#ff515b]"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="8.5" cy="8.5" r="4.5" />
            <path d="m12 12 4 4" />
          </svg>
          <input
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setChosen(null);
            }}
            onKeyDown={onKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search for a film…"
            aria-label="Type a film title and pick it from the list"
            autoComplete="off"
            className={`min-h-12 w-full border bg-[#101010] py-3 pl-9 pr-10 text-white placeholder-neutral-400 transition-colors ${
              chosen
                ? "border-[#ff515b]"
                : danger
                  ? "frame-danger border-[#ff8087]"
                  : "border-white/25 hover:border-white/50"
            }`}
          />

          {text && (
            <button
              type="button"
              onClick={reset}
              aria-label="Clear the guess"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-500 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={!chosen}
          className="flex min-h-11 items-center justify-between bg-[#c7121b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e01822] disabled:cursor-not-allowed disabled:bg-[#303030] disabled:text-neutral-400"
        >
          Submit guess <span aria-hidden="true">→</span>
        </button>
      </div>

      {!chosen && text.trim().length >= 2 && (
        <p className="mt-2 text-xs text-neutral-300">
          {searching
            ? "Searching…"
            : open && suggestions.length === 0
              ? "No matching films."
              : "Pick a film from the list to submit."}
        </p>
      )}

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-y-auto border border-[#505050] bg-[#171717] shadow-2xl shadow-black/70"
        >
          {suggestions.map((movie, index) => (
            <li key={movie.id}>
              <button
                type="button"
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(movie)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                  index === active ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                {movie.poster_path ? (
                  <img
                    src={`${POSTER_BASE}${movie.poster_path}`}
                    alt=""
                    className="h-12 w-8 shrink-0 object-cover"
                  />
                ) : (
                  <span className="h-12 w-8 shrink-0 bg-white/5" />
                )}

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-white">{movie.title}</span>
                  <span className="block text-xs text-neutral-400">
                    {movie.release_date.slice(0, 4)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
};

export default GuessInput;
