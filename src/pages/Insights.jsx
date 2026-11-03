import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { getTrending, getGenres } from "../services/api";
import InsightSection from "../components/InsightSection";
import CountUp from "react-countup";

const COLORS = ["#E50914", "#b81d24", "#f5c518", "#4a9eff", "#46d369", "#9b59b6"];

function Insights() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState("week");   


  useEffect(() => {
    const load = async () => {
      setLoading(true);                                   
      // 2 request độc lập → chạy song song
      const [movieList, genreList] = await Promise.all([getTrending(timeWindow), getGenres()]);
      setMovies(movieList);
      setGenres(genreList);
      setLoading(false);
    };
    load();
  }, [timeWindow]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#141414] text-neutral-400">Analysing data...</div>;
  }
  if (movies.length === 0) {
    return <div className="flex min-h-screen items-center justify-center bg-[#141414] text-neutral-400">No data available.</div>;
  }

  /* ---------- TÍNH TOÁN ---------- */

  // A. đếm thể loại
  const counts = {};
  movies.forEach((m) => {
    m.genre_ids?.forEach((id) => {
      const name = genres.find((g) => g.id === id)?.name;
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
  });
  const genreData = Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const totalTags = genreData.reduce((sum, g) => sum + g.value, 0);
  const topGenre = genreData[0];
  const topPct = Math.round((topGenre.value / totalTags) * 100);

  // B. rating vs popularity
  const scatterData = movies.map((m) => ({
    rating: Number(m.vote_average.toFixed(1)),
    popularity: Math.round(m.popularity),
    votes: m.vote_count,
    title: m.title,
  }));
  const avgRating = (movies.reduce((s, m) => s + m.vote_average, 0) / movies.length).toFixed(1);
  const avgPop = movies.reduce((s, m) => s + m.popularity, 0) / movies.length;
  const hyped = [...movies].sort((a, b) => b.popularity - a.popularity)[0];
  const hiddenGems = movies.filter((m) => m.vote_average >= 7.5 && m.popularity < avgPop);

  // C. phân bố rating
  const buckets = [
    { range: "< 6",   count: movies.filter((m) => m.vote_average < 6).length },
    { range: "6 – 7", count: movies.filter((m) => m.vote_average >= 6 && m.vote_average < 7).length },
    { range: "7 – 8", count: movies.filter((m) => m.vote_average >= 7 && m.vote_average < 8).length },
    { range: "8 +",   count: movies.filter((m) => m.vote_average >= 8).length },
  ];
  const best = [...movies].sort((a, b) => b.vote_average - a.vote_average)[0];
  const goodCount = movies.filter((m) => m.vote_average >= 7).length;
  const goodPct = Math.round((goodCount / movies.length) * 100);

  const tooltipStyle = {
    backgroundColor: "#1c1c1c",
    border: "1px solid #333",
    borderRadius: 6,
    color: "#fff",
    fontSize: 12,
  };

  const ScatterTip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ ...tooltipStyle, padding: "8px 10px" }}>
        <p style={{ fontWeight: 700 }}>{d.title}</p>
        <p>★ {d.rating} · popularity {d.popularity}</p>
      </div>
    );
  };

  return (
    <div className="bg-[#141414]">

      {/* ===== HERO ===== */}
      <section className="border-b border-neutral-800 px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#E50914]">Data Lab</p>
        <h1 className="mx-auto mb-5 max-w-3xl text-4xl font-extrabold text-white sm:text-5xl">
          What is the world <span className="text-[#E50914]">actually</span> watching?
        </h1>
        <p className="mx-auto mb-14 max-w-xl text-neutral-400">
          Live analysis of this week's trending films on TMDB.
        </p>

        <div className="mb-12 inline-flex rounded-full border border-neutral-700 p-1">
        {["day", "week"].map((w) => (
            <button
            key={w}
            onClick={() => setTimeWindow(w)}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                timeWindow === w ? "bg-[#E50914] text-white" : "text-neutral-400 hover:text-white"
            }`}
            >
            {w === "day" ? "Today" : "This week"}
            </button>
        ))}
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        <div>
            <p className="text-3xl font-bold text-white">
            <CountUp end={movies.length} duration={1.5} />
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">Films analysed</p>
        </div>
        <div>
            <p className="text-3xl font-bold text-white">
            ★ <CountUp end={Number(avgRating)} decimals={1} duration={1.8} />
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">Average rating</p>
        </div>
        <div>
            <p className="text-3xl font-bold text-white">{topGenre.name}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">Top genre</p>
        </div>
        <div>
            <p className="text-3xl font-bold text-white">
            <CountUp end={goodPct} duration={2} suffix="%" />
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">Rated 7+</p>
        </div>
        </div>
      </section>

      {/* ===== 1: chart TRÁI / chữ PHẢI, nền thường ===== */}
      <InsightSection
        kicker="Genre breakdown"
        title={`${topGenre.name} dominates this week`}
        text={
          <>
            <p>
              Across the {movies.length} trending films, <strong className="text-white">{topGenre.name}</strong>{" "}
              appears {topGenre.value} times — about <strong className="text-white">{topPct}%</strong> of all
              genre tags.
            </p>
            <p>
              Films carry multiple genres, so the total exceeds the film count. The spread shows how narrow
              global taste currently is: the top three genres alone make up{" "}
              {Math.round(((genreData[0].value + (genreData[1]?.value || 0) + (genreData[2]?.value || 0)) / totalTags) * 100)}%
              of everything trending.
            </p>
          </>
        }
      >
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={genreData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={115} paddingAngle={2} animationDuration={1000} animationBegin={200}>
              {genreData.map((entry, i) => (
                <Cell key={entry.name} fill={COLORS[i % COLORS.length]} stroke="#141414" strokeWidth={3} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {genreData.map((g, i) => (
            <span key={g.name} className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
              {g.name}
            </span>
          ))}
        </div>
      </InsightSection>

      {/* ===== 2: chart PHẢI / chữ TRÁI, nền tối hơn ===== */}
      <InsightSection
        reverse
        dark
        kicker="Hype vs quality"
        title="Being popular is not the same as being good"
        text={
          <>
            <p>
              Each bubble is a film: horizontal = audience rating, vertical = TMDB popularity, size = number
              of votes.
            </p>
            <p>
              The most hyped title right now is{" "}
              <strong className="text-white">{hyped.title}</strong> (popularity {Math.round(hyped.popularity)},
              rated ★ {hyped.vote_average.toFixed(1)}) — {hyped.vote_average >= avgRating
                ? "and it holds up, scoring above the weekly average."
                : `yet it sits below the weekly average of ★ ${avgRating}.`}
            </p>
            <p>
              {hiddenGems.length > 0
                ? `${hiddenGems.length} film${hiddenGems.length > 1 ? "s" : ""} score ★ 7.5 or higher while staying below average popularity — the quiet picks worth finding.`
                : "This week every highly rated film is also widely watched."}
            </p>
          </>
        }
      >
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid stroke="#2a2a2a" />
            <XAxis type="number" dataKey="rating" name="Rating" domain={[0, 10]}
              stroke="#8c8c8c" tick={{ fontSize: 11 }}
              label={{ value: "Rating", position: "insideBottom", offset: -10, fill: "#8c8c8c", fontSize: 11 }} />
            <YAxis type="number" dataKey="popularity" name="Popularity"
              stroke="#8c8c8c" tick={{ fontSize: 11 }} />
            <ZAxis type="number" dataKey="votes" range={[60, 500]} />
            <Tooltip content={<ScatterTip />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={scatterData} fill="#E50914" fillOpacity={0.65} animationDuration={1500} />
          </ScatterChart>
        </ResponsiveContainer>
      </InsightSection>

      {/* ===== 3: chart TRÁI / chữ PHẢI, nền thường ===== */}
      <InsightSection
        kicker="Rating distribution"
        title={`${goodPct}% of trending films score 7 or above`}
        text={
          <>
            <p>
              Ratings cluster tightly: {buckets[2].count + buckets[3].count} of {movies.length} films sit at
              ★ 7 or higher, and only {buckets[0].count} fall below ★ 6.
            </p>
            <p>
              The highest rated this week is <strong className="text-white">{best.title}</strong> at ★{" "}
              {best.vote_average.toFixed(1)} from {best.vote_count.toLocaleString()} votes.
            </p>
            <p className="text-sm text-neutral-500">
              Note: trending lists are self-selecting — films already reach them by being watched and liked,
              so this distribution is skewed upward and is not representative of all cinema.
            </p>
          </>
        }
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={buckets} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid stroke="#2a2a2a" vertical={false} />
            <XAxis dataKey="range" stroke="#8c8c8c" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} stroke="#8c8c8c" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff0d" }} />
            <Bar dataKey="count" fill="#E50914" radius={[4, 4, 0, 0]} animationDuration={1200} animationEasing="ease-out" />
          </BarChart>
        </ResponsiveContainer>
      </InsightSection>
    </div>
  );
}

export default Insights;