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
 * The backdrop keeps a slight blur on the open tiles while the
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
    <div className="relative aspect-video w-full overflow-hidden border border-[#414141] bg-[#0b0b0b]">
      {movie?.backdrop_path && (
        <img
          src={`${BACKDROP_BASE}${movie.backdrop_path}`}
          alt=""
          className={`h-full w-full object-cover transition-[transform,filter] duration-1000 motion-reduce:transition-none ${
            revealAll ? "scale-100 blur-0" : "scale-[1.02] blur-[3px]"
          }`}
        />
      )}

      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => {
          const open = revealAll || openTiles.includes(index);
          return (
            <div
              key={index}
              style={{ transitionDelay: revealAll ? `${index * 90}ms` : "0ms" }}
              className={`frame-tile ${open ? "is-open" : ""}`}
            >
              <span className="absolute left-2 top-2 font-mono text-[10px] text-[#a3a3a3] sm:left-3 sm:top-3">
                CUT
              </span>
              <span className="font-display text-[clamp(2rem,5.5vw,5rem)] leading-none text-[#d4d4d4]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="absolute bottom-2 right-2 size-2 border-b border-r border-[#737373] sm:bottom-3 sm:right-3" />
            </div>
          );
        })}
      </div>

      {solved && (
        <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-[#ff515b]" />
      )}
    </div>
  );
};

export default FrameBoard;
