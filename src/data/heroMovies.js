/*
 * ====================================================================
 *  POOL OF FILMS THE HOME PAGE HERO CAN SHOW
 * ====================================================================
 *
 * This is the only file to edit when the hero line-up should change.
 * Every number is a TMDB movie id.
 *
 * The carousel does NOT show all of these. On every page load it shuffles
 * this pool and takes ten, so a visitor who comes back sees a different
 * line-up — which is the whole reason the pool is longer than ten. Keep it
 * comfortably above ten or the shuffle has nothing to work with.
 *
 * --- HOW TO FIND A FILM'S ID ---
 *
 * 1. Go to https://www.themoviedb.org and search for the film.
 * 2. Open its page and read the address bar:
 *
 *       https://www.themoviedb.org/movie/969681-spider-man-brand-new-day
 *                                       ^^^^^^
 *                                       this is the id
 *
 *    The words after the dash do not matter, only the number.
 *
 * --- WORTH KNOWING ---
 *
 * - A film needs both a backdrop and a poster or the slide looks broken,
 *   so getHeroMovies drops any that are missing one. Films announced but
 *   not yet shot usually have neither.
 * - A wrong id is dropped the same way rather than breaking the carousel,
 *   which also means a typo shows up as a missing slide, not an error.
 * - The comment beside each id is only a note to yourself; nothing checks
 *   that it still matches the film the id points at.
 * - Saving this file reloads the page on its own, no server restart.
 */
const heroMovieIds = [
  // current releases
  969681,   // Spider-Man: Brand New Day
  118340,   // Guardians of the Galaxy
  1381071,  // Godzilla Minus Zero
  1751701,  // After Impact
  656908,   // Ramayana: Rise of a Legend
  1263337,  // Heart of the Beast

  // modern blockbusters
  157336,   // Interstellar
  693134,   // Dune: Part Two
  155,      // The Dark Knight
  76600,    // Avatar: The Way of Water
  27205,    // Inception
  299534,   // Avengers: Endgame
  361743,   // Top Gun: Maverick
  76341,    // Mad Max: Fury Road
  245891,   // John Wick
  335984,   // Blade Runner 2049

  // classics and award winners
  238,      // The Godfather
  872585,   // Oppenheimer
  545611,   // Everything Everywhere All at Once
  120,      // The Lord of the Rings: The Fellowship of the Ring
  129,      // Spirited Away
  12445,    // Harry Potter and the Deathly Hallows: Part 2
];

export default heroMovieIds;
