/*
 * ====================================================================
 *  FILMS SHOWN IN THE HOME PAGE HERO CAROUSEL
 * ====================================================================
 *
 * This is the only file to edit when the hero line-up should change.
 * Every number is a TMDB movie id.
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
 * 3. Add or remove numbers in the list below. The order of the list is the
 *    order of the slides; the first entry is the one shown on arrival.
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
  969681,   // Spider-Man: Brand New Day
  118340,   // Guardians of the Galaxy
  1381071,  // Godzilla Minus Zero
  1751701,  // After Impact
  656908,   // Ramayana: Rise of a Legend
  1263337,  // Heart of the Beast
  157336,   // Interstellar
  693134,   // Dune: Part Two
  155,      // The Dark Knight
  76600,    // Avatar: The Way of Water
];

export default heroMovieIds;
