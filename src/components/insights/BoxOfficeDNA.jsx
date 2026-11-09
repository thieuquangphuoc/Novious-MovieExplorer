import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import MovieTooltip from "./MovieTooltip";
import { money } from "./format";
import { withReturnMultiple, MIN_CREDIBLE_BUDGET } from "../../services/insights";

const axisStyle = { fill: "#6b6b6b", fontSize: 11 };

// A film has to clear roughly twice its production budget to be in profit:
// cinemas keep about half the ticket, and marketing is not in the budget.
const BREAK_EVEN_MULTIPLE = 2;

/*
 * BOX OFFICE DNA — what a film cost against what it took.
 *
 * Both axes are logarithmic because the spread is enormous in both
 * directions: budgets here run from under a million to over three hundred
 * million, grosses from a few million to nearly three billion. On linear
 * axes the whole set collapses into one corner.
 *
 * The dashed diagonal is the break-even line, drawn at 2x budget rather
 * than 1x. A studio does not keep the gross: cinemas take roughly half of
 * every ticket, and the marketing spend is not counted in the production
 * budget at all. Anything below that line almost certainly lost money.
 *
 * Films with a budget under one million are excluded entirely — see
 * MIN_CREDIBLE_BUDGET in services/insights.js for why.
 */
const BoxOfficeDNA = ({ movies }) => {
  const navigate = useNavigate();

  const { points, breakEven, caption } = useMemo(() => {
    const ranked = withReturnMultiple(movies);

    if (ranked.length < 4) return { points: [], breakEven: [], caption: null };

    const budgets = ranked.map((m) => m.budget);
    const low = Math.min(...budgets);
    const high = Math.max(...budgets);

    const winners = ranked.filter((m) => m.multiple >= BREAK_EVEN_MULTIPLE);

    return {
      points: ranked,
      breakEven: [
        { budget: low, revenue: low * BREAK_EVEN_MULTIPLE },
        { budget: high, revenue: high * BREAK_EVEN_MULTIPLE },
      ],
      caption: {
        total: ranked.length,
        winners: winners.length,
        best: ranked[0],
        worst: ranked[ranked.length - 1],
        biggestBudget: [...ranked].sort((a, b) => b.budget - a.budget)[0],
      },
    };
  }, [movies]);

  if (points.length < 4) {
    return (
      <p className="py-20 text-center text-sm text-neutral-500">
        TMDB has credible budget and gross figures for too few of these films to compare.
      </p>
    );
  }

  return (
    <div>
      <div className="h-[26rem] w-full sm:h-[30rem]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 16, bottom: 28, left: 8 }}>
            <CartesianGrid stroke="#ffffff" strokeOpacity={0.06} />

            <XAxis
              type="number"
              dataKey="budget"
              scale="log"
              domain={["auto", "auto"]}
              tick={axisStyle}
              tickLine={false}
              axisLine={{ stroke: "#ffffff", strokeOpacity: 0.14 }}
              tickFormatter={money}
              label={{
                value: "PRODUCTION BUDGET",
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

            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: "#ffffff", strokeOpacity: 0.2 }}
              content={
                <MovieTooltip
                  rows={(m) => [
                    { label: "Budget", value: money(m.budget) },
                    { label: "Gross", value: money(m.revenue) },
                    { label: "Return", value: `${m.multiple.toFixed(1)}×` },
                  ]}
                />
              }
            />

            {/* the break-even diagonal: two points joined, dots hidden */}
            <Scatter
              data={breakEven}
              line={{ stroke: "#ffffff", strokeOpacity: 0.3, strokeDasharray: "5 5" }}
              shape={() => null}
              legendType="none"
              isAnimationActive={false}
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
                  r={7}
                  fill={movie.multiple >= BREAK_EVEN_MULTIPLE ? "#E50914" : "#5a5a5a"}
                  fillOpacity={movie.multiple >= BREAK_EVEN_MULTIPLE ? 0.85 : 0.6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-[2fr_1fr]">
        <p className="text-sm leading-relaxed text-neutral-400">
          <span className="text-white">{caption.winners}</span> of {caption.total} films
          sit above the dashed line — they took at least twice what they cost to make,
          which is roughly where a cinema release starts earning rather than spending.
          The steepest return is{" "}
          <span className="text-white">{caption.best.title}</span>, which turned{" "}
          {money(caption.best.budget)} into {money(caption.best.revenue)} —{" "}
          <span className="text-[#E50914]">{caption.best.multiple.toFixed(1)}×</span> its
          budget. The most expensive film here,{" "}
          <span className="text-white">{caption.biggestBudget.title}</span>, cost{" "}
          {money(caption.biggestBudget.budget)} and returned{" "}
          {caption.biggestBudget.multiple.toFixed(1)}×.
        </p>

        <p className="border-l border-white/15 pl-5 text-xs leading-relaxed text-neutral-500">
          Gross is not profit. These figures leave out marketing, which on a wide release
          can match the production budget, and the share of every ticket that stays with
          the cinema. Films whose recorded budget is under{" "}
          {money(MIN_CREDIBLE_BUDGET)} are left out: TMDB&apos;s budget field is
          community-entered, and a placeholder there against a real gross produces
          returns in the hundreds that would swamp the chart.
        </p>
      </div>
    </div>
  );
};

export default BoxOfficeDNA;
