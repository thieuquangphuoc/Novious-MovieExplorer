const STARS = "★★★★★";

/*
 * TMDB rates films out of 10; cinema audiences read stars out of 5, so the
 * score is halved before it is drawn.
 *
 * Rather than rounding to whole stars, two identical rows of stars are
 * stacked: a grey one underneath and a gold one on top, clipped to the exact
 * percentage of the score. A 7.3 therefore shows as three and a bit stars
 * instead of being flattened to three or four.
 *
 * whitespace-nowrap matters on the gold row: once its box is narrowed to the
 * clip width the stars would otherwise wrap onto new lines.
 */
const StarRating = ({ value = 0, className = "" }) => {
  const percent = Math.max(0, Math.min(100, (value / 10) * 100));
  const outOfFive = (value / 2).toFixed(1);

  return (
    <span
      className={`relative inline-block leading-none ${className}`}
      title={`${outOfFive} / 5`}
      aria-label={`Rated ${outOfFive} out of 5`}
    >
      <span className="text-neutral-700">{STARS}</span>

      <span
        aria-hidden="true"
        className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-yellow-400"
        style={{ width: `${percent}%` }}
      >
        {STARS}
      </span>
    </span>
  );
};

export default StarRating;
