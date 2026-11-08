/*
 * ====================================================================
 *  THE LOOK OF EACH DECADE
 * ====================================================================
 *
 * The Movie Machine repaints itself as the visitor drags through time, and
 * every value that changes lives here. The component reads this table and
 * holds no styling of its own, so a decade can be retuned without touching
 * any logic.
 *
 * Per entry:
 *   start     first year of the decade; also what /discover is asked for
 *   label     what the tick under the slider says
 *   era       a short name for the period, shown beside the years
 *   blurb     one line of context, so the slider teaches as well as filters
 *   from/via/to   the three stops of the background gradient
 *   accent    the decade's highlight colour, used on the handle and the era
 *   font      display face, for the decade number and the era
 *   bodyFont  face for the smaller text underneath

 *             Two faces, not one, because the display choice cannot carry
 *             body copy: Bebas Neue has no lower case worth reading at
 *             14px. Each pair is from the same family of shapes, so the
 *             panel still reads as one typeface decision per decade.
 *   grain     0 to 1; how much film grain sits over the panel
 *
 * Why it starts at 1920: TMDB does hold older films — A Trip to the Moon is
 * from 1902 — but the 1900s return twelve titles in total and the 1910s
 * barely thirty, which is not enough to fill a row. The 1920s is the first
 * decade with a real catalogue behind it.
 */
const decades = [
  {
    start: 1920,
    label: "1920s",
    era: "The Silent Era",
    blurb: "No dialogue, no colour — everything carried by the image alone.",
    from: "#1a1a1a",
    via: "#2b2724",
    to: "#0d0d0d",
    accent: "#d9c9a3",
    font: '"Playfair Display", Georgia, serif',
    bodyFont: '"Playfair Display", Georgia, serif',
    grain: 0.9,
  },
  {
    start: 1930,
    label: "1930s",
    era: "The Golden Age",
    blurb: "Sound arrives, the studios take over, and the star is invented.",
    from: "#2a2016",
    via: "#4a3620",
    to: "#120d08",
    accent: "#e0b454",
    font: '"Playfair Display", Georgia, serif',
    bodyFont: '"Playfair Display", Georgia, serif',
    grain: 0.75,
  },
  {
    start: 1940,
    label: "1940s",
    era: "Film Noir",
    blurb: "Hard shadows, wet streets, and nobody in the frame is innocent.",
    from: "#141b24",
    via: "#27323f",
    to: "#090c10",
    accent: "#8fa9c4",
    font: '"Playfair Display", Georgia, serif',
    bodyFont: '"Playfair Display", Georgia, serif',
    grain: 0.7,
  },
  {
    start: 1950,
    label: "1950s",
    era: "Technicolor",
    blurb: "Widescreen, saturated colour, and cinema fighting back at television.",
    from: "#3a1410",
    via: "#8a3321",
    to: "#140705",
    accent: "#f0a04b",
    font: '"Playfair Display", Georgia, serif',
    bodyFont: '"Playfair Display", Georgia, serif',
    grain: 0.55,
  },
  {
    start: 1960,
    label: "1960s",
    era: "New Wave",
    blurb: "The rules of the old studios break, and the camera gets restless.",
    from: "#2d2a10",
    via: "#6b6124",
    to: "#10100a",
    accent: "#e8d05a",
    font: '"Playfair Display", Georgia, serif',
    bodyFont: '"Playfair Display", Georgia, serif',
    grain: 0.45,
  },
  {
    start: 1970,
    label: "1970s",
    era: "New Hollywood",
    blurb: "Directors take the wheel, and the blockbuster is born by accident.",
    from: "#331a07",
    via: "#8a4210",
    to: "#140a03",
    accent: "#ff8a3d",
    font: '"Oswald", "Arial Narrow", sans-serif',
    bodyFont: '"Oswald", "Arial Narrow", sans-serif',
    grain: 0.4,
  },
  {
    start: 1980,
    label: "1980s",
    era: "Neon & VHS",
    blurb: "Synth scores, practical effects, and a sequel for everything.",
    from: "#1b0a2e",
    via: "#7a1f6b",
    to: "#07030f",
    accent: "#ff3df0",
    font: '"Bebas Neue", Impact, sans-serif',
    bodyFont: '"Oswald", "Arial Narrow", sans-serif',
    grain: 0.3,
  },
  {
    start: 1990,
    label: "1990s",
    era: "Indie Boom",
    blurb: "Festival cinema goes mainstream while CGI quietly changes everything.",
    from: "#0d2220",
    via: "#1d4f49",
    to: "#060f0e",
    accent: "#4fd6c0",
    font: '"Oswald", "Arial Narrow", sans-serif',
    bodyFont: '"Oswald", "Arial Narrow", sans-serif',
    grain: 0.25,
  },
  {
    start: 2000,
    label: "2000s",
    era: "The DVD Years",
    blurb: "Box sets, bonus features, and trilogies built like cathedrals.",
    from: "#0b1829",
    via: "#2a4f7a",
    to: "#050a12",
    accent: "#6fb6ff",
    font: '"Oswald", "Arial Narrow", sans-serif',
    bodyFont: '"Oswald", "Arial Narrow", sans-serif',
    grain: 0.18,
  },
  {
    start: 2010,
    label: "2010s",
    era: "Shared Universes",
    blurb: "Franchises connect, and streaming starts rewriting the business.",
    from: "#10202a",
    via: "#1f4b52",
    to: "#070d11",
    accent: "#ffb648",
    font: '"Bebas Neue", Impact, sans-serif',
    bodyFont: '"Oswald", "Arial Narrow", sans-serif',
    grain: 0.12,
  },
  {
    start: 2020,
    label: "2020s",
    era: "Now Showing",
    blurb: "Cinemas and streaming pulling in opposite directions, in real time.",
    from: "#1a0608",
    via: "#4a0d14",
    to: "#0a0304",
    accent: "#E50914",
    font: '"Bebas Neue", Impact, sans-serif',
    bodyFont: '"Oswald", "Arial Narrow", sans-serif',
    grain: 0.08,
  },
];

export default decades;
