const STARS = "★★★★★";

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
