# NOVIOUS

*Beyond Watching. Into Discovering.*

<!-- ![NOVIOUS Homepage Preview](assets/homepage-demo.gif) -->
<!-- Add the GIF at assets/homepage-demo.gif, then remove the HTML comment markers around the image line above. -->

[GitHub Repository](https://github.com/thieuquangphuoc/Novious-MovieExplorer)

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-171717?style=for-the-badge&amp;logo=javascript&amp;logoColor=F7DF1E" alt="JavaScript">
  <img src="https://img.shields.io/badge/React-171717?style=for-the-badge&amp;logo=react&amp;logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Vite-171717?style=for-the-badge&amp;logo=vite&amp;logoColor=A78BFA" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-171717?style=for-the-badge&amp;logo=tailwindcss&amp;logoColor=38BDF8" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/React%20Router-A5111B?style=for-the-badge&amp;logo=reactrouter&amp;logoColor=FFFFFF" alt="React Router">
  <img src="https://img.shields.io/badge/TMDB-171717?style=for-the-badge&amp;logo=themoviedatabase&amp;logoColor=90CEA1" alt="TMDB">
</p>

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Feature Screenshots](#3-feature-screenshots)
4. [Technology Stack](#4-technology-stack)
5. [Source Code Architecture](#5-source-code-architecture)
6. [Technical Highlights](#6-technical-highlights)
7. [Installation & Setup](#7-installation--setup)
8. [Credits & Attribution](#8-credits--attribution)

---

## 1. Project Overview

> NOVIOUS is an interactive movie discovery platform built with React and powered by The Movie Database (TMDB). It pairs a cinematic browsing experience with tools to find a film, explore patterns in movie data, and test your film knowledge one frame at a time.

---

## 2. Key Features

| Feature | What it does |
| --- | --- |
| **Homepage & Movie Discovery** | Browse a curated film carousel, trailer collections, top-rated picks, and a decade-by-decade Movie Machine. |
| **Advanced Search** | Search by title and narrow results by genre, release decade, and minimum rating. Sort or shuffle results while browsing the catalogue. |
| **Movie Insights & Data Visualization** | Explore how ratings, budgets, and box-office returns compare. Find highly rated films with fewer votes and see how genre representation changes across decades in the dataset. |
| **The ONE Movie Challenge** | Choose how much time you have, what mood you are in, and how adventurous you feel to get one film recommendation. |
| **Frame by Frame Quiz** | Identify a film from a still hidden behind six tiles. Play the daily puzzle or try another film in Unlimited mode. Revealing fewer tiles earns a higher score. |
| **Movie Details** | View the synopsis, cast, runtime, ratings, and available box-office figures and trailers. |

---

## 3. Feature Screenshots

### Discover

A filterable poster grid for browsing the catalogue or narrowing a title search.

<!-- ![Discover search and filters](assets/discover.png) -->

### Insights

Interactive charts compare financial performance and show how genres are represented across decades.

<!-- ![Insights charts and analysis](assets/insights.png) -->

### Frame by Frame

A six-tile board reveals parts of a film still as you take hints or make incorrect guesses.

<!-- ![Frame by Frame quiz board](assets/quiz.png) -->

---

## 4. Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | JavaScript, React, Vite |
| Styling and routing | Tailwind CSS v4, custom CSS, React Router with `HashRouter` |
| Charts and counters | Recharts, CountUp.js |
| Data and browser APIs | TMDB API v3, native Fetch API, Web Audio API, `localStorage` |
| Tooling | ESLint, npm |

---

## 5. Source Code Architecture

```text
Novious-MovieExplorer/
├── public/              # Static branding and browser icons
├── src/
│   ├── assets/          # Local image assets
│   ├── components/      # Shared UI and feature components
│   │   ├── common/
│   │   ├── discover/
│   │   ├── home/
│   │   ├── insights/
│   │   ├── layout/
│   │   ├── movie/
│   │   └── quiz/
│   ├── data/            # Curated film IDs, decade copy, and challenge options
│   ├── pages/           # Home, Discover, Insights, Quiz, and MovieDetail
│   ├── services/        # TMDB requests, analytics, quiz rules, and audio
│   ├── App.jsx          # Routes and shared page layout
│   ├── index.css        # Global styles, typography, and motion
│   └── main.jsx         # React entry point and router setup
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 6. Technical Highlights

- **API integration.** A shared service calls TMDB with native `fetch` and `async`/`await`. Catalogue filters run on TMDB, while title-search results are filtered in the browser.
- **Recommendation logic.** The ONE Movie Challenge turns runtime, mood, and familiarity preferences into TMDB filters, then selects a single film from the candidates.
- **Data processing.** Insights merges top-rated, popular, and weekly trending lists, deduplicates by TMDB ID, and caches the enriched dataset. Financial charts exclude entries below minimum budget and revenue thresholds.
- **Game state.** Daily puzzles use a UTC-based film rotation. Guesses match TMDB IDs, while scores, streaks, and sound preferences persist in `localStorage`.
- **Responsive design.** The poster grids and quiz controls adapt to smaller screens, and custom animations respect the browser's reduced-motion preference.

---

## 7. Installation & Setup

### Install dependencies

Requires npm and Node.js 20.19+ (20.x) or 22.12+.

```bash
git clone https://github.com/thieuquangphuoc/Novious-MovieExplorer.git
cd Novious-MovieExplorer
npm ci
```

### Configure TMDB

Request a TMDB v3 API key from your account's API settings, then create a `.env.local` file in the project root.

```dotenv
VITE_TMDB_KEY=your_tmdb_v3_api_key
```

### Run locally

```bash
npm run dev
```

Open the local URL printed by Vite. Run `npm run lint` to check the code or `npm run build` to create a production build.

---

## 8. Credits & Attribution

- Movie metadata and images are provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).
- Trailers are embedded from YouTube. Bebas Neue, Oswald, and Playfair Display are served by Google Fonts.

> This product uses the TMDB API but is not endorsed or certified by TMDB.
