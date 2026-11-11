const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

const COLUMNS = 6;

const DURATIONS = ["74s", "96s", "82s", "110s", "88s", "102s"];

const PosterWall = ({ posters }) => {
  if (posters.length < 12) return null;

  const columns = Array.from({ length: COLUMNS }, (unused, columnIndex) =>
    posters.filter((item, index) => index % COLUMNS === columnIndex)
  );

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="flex h-full gap-3 px-3">
        {columns.map((column, index) => (
          <div
            key={index}
            className={`h-full flex-1 overflow-hidden ${
              index >= 3 ? "hidden sm:block" : ""
            } ${index >= 4 ? "hidden lg:block" : ""}`}
          >
            <div
              className={index % 2 === 0 ? "poster-up" : "poster-down"}
              style={{ "--dur": DURATIONS[index % DURATIONS.length] }}
            >
              {[...column, ...column].map((path, copy) => (
                <img
                  key={`${path}-${copy}`}
                  src={`${POSTER_BASE}${path}`}
                  alt=""
                  loading="lazy"
                  className="mb-3 w-full rounded-sm object-cover"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PosterWall;
