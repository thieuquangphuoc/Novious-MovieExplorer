import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import MovieTooltip from "./MovieTooltip";
import { money } from "./format";
import { hasCredibleMoney } from "../../services/insights";

const axisStyle = { fill: "#6b6b6b", fontSize: 11 };

const medianOf = (numbers) => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const SuccessMatrix = ({ movies, genres }) => {
  const navigate = useNavigate();
  const [genre, setGenre] = useState("All");

  const { points, caption } = useMemo(() => {
    const withGross = movies.filter((m) => hasCredibleMoney(m) && m.rating > 0);
    const filtered =
      genre === "All" ? withGross : withGross.filter((m) => m.genres.includes(genre));

    if (filtered.length < 4) {
      return { points: filtered, caption: null };
    }

    const ratingMedian = medianOf(filtered.map((m) => m.rating));
    const better = filtered.filter((m) => m.rating >= ratingMedian);
    const worse = filtered.filter((m) => m.rating < ratingMedian);

    const betterMoney = medianOf(better.map((m) => m.revenue));
    const worseMoney = medianOf(worse.map((m) => m.revenue));

    const biggest = [...filtered].sort((a, b) => b.revenue - a.revenue)[0];
    const bestRated = [...filtered].sort((a, b) => b.rating - a.rating)[0];

    return {
      points: filtered,
      caption: {
        count: filtered.length,
        ratingMedian,
        betterMoney,
        worseMoney,
        ratio: worseMoney > 0 ? betterMoney / worseMoney : null,
        biggest,
        bestRated,
      },
    };
  }, [movies, genre]);

  const chips = ["All", ...genres.slice(0, 7).map((g) => g.name)];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {chips.map((name) => (
          <button
            key={name}
            onClick={() => setGenre(name)}
            className={`border px-3 py-1 text-xs tracking-wide transition-colors ${
              genre === name
                ? "border-[#E50914] bg-[#E50914] text-white"
                : "border-white/15 text-neutral-400 hover:border-white/40 hover:text-white"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {points.length < 4 ? (
        <p className="py-20 text-center text-sm text-neutral-500">
          Only {points.length} film{points.length === 1 ? "" : "s"} in this genre has a
          recorded gross — too few to read anything into. Try another.
        </p>
      ) : (
        <>
          <div className="h-[26rem] w-full sm:h-[30rem]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 16, bottom: 28, left: 8 }}>
                <CartesianGrid stroke="#ffffff" strokeOpacity={0.06} />

                <XAxis
                  type="number"
                  dataKey="rating"
                  domain={[5, 9.5]}
                  tick={axisStyle}
                  tickLine={false}
                  axisLine={{ stroke: "#ffffff", strokeOpacity: 0.14 }}
                  label={{
                    value: "AUDIENCE SCORE",
                    position: "insideBottom",
                    offset: -16,
                    fill: "#6b6b6b",
                    fontSize: 10,
                    letterSpacing: 2,
                  }}
                />

                <YAxis
                  type="number"
                  dataKey="revenue"
                  scale="log"
                  domain={["auto", "auto"]}
                  tick={axisStyle}
                  tickLine={false}
                  axisLine={false}
                  width={58}
                  tickFormatter={money}
                />

                <ZAxis type="number" dataKey="votes" range={[40, 620]} />

                <Tooltip
                  cursor={{ strokeDasharray: "3 3", stroke: "#ffffff", strokeOpacity: 0.2 }}
                  content={
                    <MovieTooltip
                      rows={(m) => [
                        { label: "Score", value: m.rating.toFixed(1) },
                        { label: "Gross", value: money(m.revenue) },
                        { label: "Votes", value: m.votes.toLocaleString("en-US") },
                      ]}
                    />
                  }
                />

                <Scatter
                  data={points}
                  onClick={(point) => point?.id && navigate(`/movie/${point.id}`)}
                  cursor="pointer"
                  isAnimationActive
                  animationDuration={700}
                >
                  {points.map((movie) => (
                    <Cell
                      key={movie.id}
                      fill={movie.rating >= 8 ? "#E50914" : "#d8d8d8"}
                      fillOpacity={movie.rating >= 8 ? 0.85 : 0.35}
                      stroke={movie.rating >= 8 ? "#ff5a62" : "transparent"}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {caption && (
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-neutral-400">
              Across {caption.count} films with a recorded worldwide gross, the better
              reviewed half — anything from{" "}
              <span className="text-white">{caption.ratingMedian.toFixed(1)}</span> up —
              took a median of{" "}
              <span className="text-white">{money(caption.betterMoney)}</span>, against{" "}
              <span className="text-white">{money(caption.worseMoney)}</span> for the
              weaker half.{" "}
              {caption.ratio && caption.ratio < 1.6 ? (
                <>
                  That is a difference, but a modest one: a good score is worth far less at
                  the box office than the size of the release behind it.
                </>
              ) : (
                <>
                  In this slice the gap is wide — reviews and takings move together more
                  than they usually do.
                </>
              )}{" "}
              The biggest earner here is{" "}
              <span className="text-white">{caption.biggest.title}</span> at{" "}
              {money(caption.biggest.revenue)}; the best reviewed is{" "}
              <span className="text-white">{caption.bestRated.title}</span> at{" "}
              {caption.bestRated.rating.toFixed(1)}.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default SuccessMatrix;
