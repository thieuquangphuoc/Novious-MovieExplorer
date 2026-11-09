import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { genreByDecade } from "../../services/insights";

// Picked to stay apart on a dark ground without resorting to neon.
const GENRE_COLOURS = ["#E50914", "#f0a04b", "#4fd6c0", "#7aa6ff", "#c9a0ff"];

const axisStyle = { fill: "#6b6b6b", fontSize: 11 };

/*
 * GENRE WARS — what each decade was making.
 *
 * Share of genre tags by decade, stacked. Share rather than counts,
 * because the dataset is not evenly spread across time: there are far
 * more recent films in it than films from the sixties, so raw counts
 * would only redraw that imbalance.
 *
 * Counted by tag, not by film. A film listed as Action and Adventure adds
 * one to each, so a decade's bars answer "of all the genre labels used in
 * this decade, what fraction were Action" — which is the only honest
 * reading when films carry several genres at once. The percentages do not
 * sum to 100 because only the five most common genres are drawn.
 *
 * Decades holding very few films are dropped: a decade with three films
 * in it produces swings of thirty percentage points that mean nothing.
 */
const MIN_FILMS_PER_DECADE = 3;

const GenreWars = ({ movies, genres }) => {
  const topGenres = useMemo(() => genres.slice(0, 5).map((g) => g.name), [genres]);
  const [hidden, setHidden] = useState([]);

  const { rows, caption } = useMemo(() => {
    const all = genreByDecade(movies, topGenres).filter(
      (row) => row.films >= MIN_FILMS_PER_DECADE
    );

    if (all.length < 2) return { rows: all, caption: null };

    const first = all[0];
    const last = all[all.length - 1];

    const moves = topGenres
      .map((name) => ({ name, change: (last[name] || 0) - (first[name] || 0) }))
      .sort((a, b) => b.change - a.change);

    return {
      rows: all,
      caption: {
        from: first,
        to: last,
        riser: moves[0],
        faller: moves[moves.length - 1],
      },
    };
  }, [movies, topGenres]);

  const toggle = (name) =>
    setHidden((current) =>
      current.includes(name) ? current.filter((n) => n !== name) : [...current, name]
    );

  if (rows.length < 2) {
    return (
      <p className="py-20 text-center text-sm text-neutral-500">
        This set does not span enough decades to show a trend.
      </p>
    );
  }

  return (
    <div>
      {/* the legend doubles as the control: click a genre to drop it out */}
      <div className="mb-5 flex flex-wrap gap-4">
        {topGenres.map((name, i) => {
          const off = hidden.includes(name);
          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              aria-pressed={!off}
              className={`flex items-center gap-2 text-xs tracking-wide transition-opacity ${
                off ? "opacity-35" : "opacity-100"
              }`}
            >
              <span
                className="h-2.5 w-2.5"
                style={{ background: GENRE_COLOURS[i % GENRE_COLOURS.length] }}
              />
              <span className={off ? "text-neutral-500 line-through" : "text-neutral-200"}>
                {name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="h-[22rem] w-full sm:h-[26rem]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
            <defs>
              {topGenres.map((name, i) => (
                <linearGradient key={name} id={`genre-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={GENRE_COLOURS[i % GENRE_COLOURS.length]}
                    stopOpacity={0.75}
                  />
                  <stop
                    offset="100%"
                    stopColor={GENRE_COLOURS[i % GENRE_COLOURS.length]}
                    stopOpacity={0.15}
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid stroke="#ffffff" strokeOpacity={0.06} vertical={false} />

            <XAxis
              dataKey="label"
              tick={axisStyle}
              tickLine={false}
              axisLine={{ stroke: "#ffffff", strokeOpacity: 0.14 }}
            />
            <YAxis
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              cursor={{ stroke: "#ffffff", strokeOpacity: 0.2 }}
              contentStyle={{
                background: "rgba(11,11,11,0.95)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 0,
                fontSize: 12,
              }}
              labelStyle={{ color: "#ffffff", fontWeight: 600 }}
              formatter={(value, name) => [`${value}% of tags`, name]}
            />

            {topGenres.map((name, i) =>
              hidden.includes(name) ? null : (
                <Area
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stackId="genres"
                  stroke={GENRE_COLOURS[i % GENRE_COLOURS.length]}
                  strokeWidth={1.5}
                  fill={`url(#genre-${i})`}
                  animationDuration={700}
                />
              )
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {caption && (
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-neutral-400">
          Between the {caption.from.label} and the {caption.to.label},{" "}
          <span className="text-white">{caption.riser.name}</span> gained the most ground
          — up{" "}
          <span className="text-[#E50914]">
            {caption.riser.change > 0 ? "+" : ""}
            {caption.riser.change.toFixed(1)}
          </span>{" "}
          percentage points of all genre tags — while{" "}
          <span className="text-white">{caption.faller.name}</span> moved{" "}
          {caption.faller.change.toFixed(1)}. Shares are of genre labels rather than
          films, since most films carry two or three at once, and only the five most
          common are drawn, so the bands do not add up to a hundred.
        </p>
      )}
    </div>
  );
};

export default GenreWars;
