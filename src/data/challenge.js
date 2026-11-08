/*
 * ====================================================================
 *  THE ONE MOVIE CHALLENGE — the questionnaire
 * ====================================================================
 *
 * Every answer carries the /discover filter it stands for, so the form is
 * the whole specification of the search: the component reads values off
 * these objects and never decides what an answer means.
 *
 * TMDB genre ids used below:
 *   12 Adventure · 14 Fantasy · 18 Drama · 27 Horror · 28 Action
 *   35 Comedy · 53 Thriller · 878 Science Fiction · 9648 Mystery
 *   10749 Romance · 10751 Family
 *
 * A mood maps to two genres rather than one because a single id is too
 * narrow to keep returning fresh answers — and they are combined with OR,
 * so Thrilled means thriller *or* action, not both at once.
 */
export const QUESTIONS = [
  {
    id: "time",
    title: "How much time do you have?",
    options: [
      { id: "90", label: "Under 90 minutes", note: "A short one", maxRuntime: 90 },
      { id: "120", label: "Under 2 hours", note: "A normal evening", maxRuntime: 120 },
      { id: "180", label: "Under 3 hours", note: "Settle in", maxRuntime: 180 },
      { id: "any", label: "No limit", note: "Whatever it takes", maxRuntime: null },
    ],
  },
  {
    id: "mood",
    title: "What's your mood?",
    options: [
      { id: "thrilled", label: "Thrilled", genres: [53, 28] },
      { id: "mindblown", label: "Mind-Blown", genres: [878, 9648] },
      { id: "feelgood", label: "Feel-Good", genres: [35, 10751] },
      { id: "emotional", label: "Emotional", genres: [18, 10749] },
      { id: "terrified", label: "Terrified", genres: [27] },
      { id: "adventurous", label: "Adventurous", genres: [12, 14] },
    ],
  },
  {
    id: "style",
    title: "What's your discovery style?",
    options: [
      {
        id: "safe",
        label: "Play It Safe",
        note: "Well known, well rated",
        safe: true,
      },
      {
        id: "surprise",
        label: "Surprise Me",
        note: "Barely known, quietly great",
        safe: false,
      },
    ],
  },
];

/*
 * The three stages of the search animation.
 *
 * `at` is when each line takes over, in milliseconds from the moment the
 * visitor submits. The last one is the arrival, so the whole sequence runs
 * a little under five seconds before the film is revealed.
 */
export const SEARCH_STAGES = [
  { at: 0, text: "Reading your movie DNA" },
  { at: 1700, text: "Exploring the cinema universe" },
  { at: 3600, text: "We found your ONE" },
];

export const SEARCH_DURATION = 4800;
