// THE ONE MOVIE CHALLENGE — the questionnaire
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

export const SEARCH_STAGES = [
  { at: 0, text: "Reading your movie DNA" },
  { at: 1700, text: "Exploring the cinema universe" },
  { at: 3600, text: "We found your ONE" },
];

export const SEARCH_DURATION = 4800;

export const SPARKS = [
  { id: 1, top: 8, left: 6, size: 7, dur: 5.3, delay: 0, peak: 0.2, tint: "#ff6b6b" },
  { id: 2, top: 62, left: 14, size: 5, dur: 3.7, delay: 1.9, peak: 0.16, tint: "#ffd9a0" },
  { id: 3, top: 24, left: 31, size: 9, dur: 7.1, delay: 3.4, peak: 0.13, tint: "#ffffff" },
  { id: 4, top: 78, left: 38, size: 6, dur: 4.9, delay: 0.8, peak: 0.18, tint: "#ff6b6b" },
  { id: 5, top: 4, left: 54, size: 8, dur: 6.1, delay: 2.6, peak: 0.12, tint: "#ffd9a0" },
  { id: 6, top: 48, left: 63, size: 5, dur: 4.3, delay: 5.2, peak: 0.22, tint: "#ffffff" },
  { id: 7, top: 86, left: 71, size: 7, dur: 5.9, delay: 1.3, peak: 0.15, tint: "#ffd9a0" },
  { id: 8, top: 18, left: 84, size: 6, dur: 3.9, delay: 4.1, peak: 0.19, tint: "#ff6b6b" },
  { id: 9, top: 66, left: 91, size: 8, dur: 6.7, delay: 2.2, peak: 0.14, tint: "#ffffff" },
];
