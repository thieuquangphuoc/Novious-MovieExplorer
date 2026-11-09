const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

const COLUMNS = 3;
const ROWS = 2;

/*
 * The covered still.
 *
 * A 16:9 backdrop with six tiles laid over it in a 3x2 grid. Tiles are
 * removed one at a time as the player spends guesses, so the picture
 * arrives in pieces.
 *
 * The image is always in the DOM behind the tiles, never swapped in at
 * the end. Loading it at the start means the reveal is instant rather
 * than a blank rectangle waiting on the network at the worst moment —
 * and because the tiles are opaque, nothing is visible early.
 *
 * `blurUntilSolved` keeps a slight blur on the open tiles while the
 * round is live. Six clean sixths of a frame can give away a title from
 * a logo or a face in the corner; the blur leaves the shapes and colours
 * readable, which is the part worth guessing from. It lifts on the
 * reveal.
 *
 * Tile order is shuffled by the parent, not here, so that a re-render
 * cannot change which tile opens next mid-round.
 */
const FrameBoard = ({ movie, openTiles, solved, revealAll }) => {
  const total = COLUMNS * ROWS;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-sm bg-[#0b0b0b]">
      {movie?.backdrop_path && (
        <img
          src={`${BACKDROP_BASE}${movie.backdrop_path}`}
          alt=""
          className={`h-full w-full object-cover transition-all duration-1000 ${
            revealAll ? "scale-100 blur-0" : "scale-[1.02] blur-[3px]"
          }`}
        />
      )}

      {/* the mask */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
        {Array.from({ length: total }).map((unused, index) => {
          const open = revealAll || openTiles.includes(index);
          return (
            <div
              key={index}
              /* staggered only on the full reveal, so it sweeps across;
                 a single tile during play should open immediately */
              style={{ transitionDelay: revealAll ? `${index * 90}ms` : "0ms" }}
              className={`frame-tile border border-[#141414] bg-[#141414] ${
                open ? "is-open" : ""
              }`}
            />
          );
        })}
      </div>

      {/* a faint number in each closed tile, so the grid reads as clues */}
      {!revealAll && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-2"
        >
          {Array.from({ length: total }).map((unused, index) => (
            <div key={index} className="flex items-center justify-center">
              {!openTiles.includes(index) && (
                <span className="text-2xl font-bold tabular-nums text-white/10">
                  {index + 1}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {solved && (
        <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-[#E50914]" />
      )}
    </div>
  );
};

export default FrameBoard;
