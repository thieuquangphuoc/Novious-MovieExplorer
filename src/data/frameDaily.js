/*
 * ====================================================================
 *  THE DAILY ROTA FOR FRAME BY FRAME
 * ====================================================================
 *
 * TMDB ids only — every title, poster and backdrop is still fetched live.
 * Nothing about the films is written down here, just which films are in
 * the rota.
 *
 * Why a fixed list rather than asking /discover each day: the daily
 * puzzle has to be the same film for everyone, and the same film after a
 * refresh. /discover is ordered by popularity, which shifts hourly, so
 * "the third most popular thriller" is a different film by the evening.
 * A fixed list indexed by the UTC date cannot drift.
 *
 * Every entry was checked to be released, Thriller (53) or Adventure
 * (12), carrying both a poster and a backdrop, and with at least 500
 * votes — the game is unfair with a film nobody has seen.
 *
 * To change the rota, add or remove ids. Order does not matter; the day
 * index is taken modulo the length, so the rota simply gets longer.
 */
const frameDailyIds = [
  155,      // The Dark Knight
  157336,   // Interstellar
  550,      // Fight Club
  680,      // Pulp Fiction
  807,      // Se7en
  98,       // Gladiator
  11,       // Star Wars
  120,      // The Lord of the Rings: The Fellowship of the Ring
  121,      // The Lord of the Rings: The Two Towers
  122,      // The Lord of the Rings: The Return of the King
  496243,   // Parasite
  1726,     // Iron Man
  24428,    // The Avengers
  99861,    // Avengers: Age of Ultron
  299536,   // Avengers: Infinity War
  299534,   // Avengers: Endgame
  438631,   // Dune
  693134,   // Dune: Part Two
  634649,   // Spider-Man: No Way Home
  324857,   // Spider-Man: Into the Spider-Verse
  569094,   // Spider-Man: Across the Spider-Verse
  671,      // Harry Potter and the Philosopher's Stone
  672,      // Harry Potter and the Chamber of Secrets
  673,      // Harry Potter and the Prisoner of Azkaban
  354912,   // Coco
  1108427,  // Moana
  4935,     // Howl's Moving Castle
  101299,   // The Hunger Games: Catching Fire
  131631,   // The Hunger Games: Mockingjay - Part 1
  985939,   // Fall
  755898,   // War of the Worlds
  687163,   // Project Hail Mary
  969681,   // Spider-Man: Brand New Day
  1368337,  // The Odyssey
  980431,   // Avatar Aang: The Last Airbender
  83533,    // Avatar: Fire and Ash
];

export default frameDailyIds;
