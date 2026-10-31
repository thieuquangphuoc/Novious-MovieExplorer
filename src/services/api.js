const KEY = import.meta.env.VITE_TMDB_KEY;
const BASE = "https://api.themoviedb.org/3";

export const getTrending = async () => {
    try {
        const res = await fetch(`${BASE}/trending/movie/week?api_key=${KEY}`);
        if (!res.ok) {
            throw new Error(res.status);
        }
        const data = await res.json();
        return data.results;

    } catch (error) {
        console.log(error)
        return [];
    }

}