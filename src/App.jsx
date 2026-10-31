import { useEffect } from 'react';
import { getTrending } from './services/api';

const App = () => {
  useEffect(() => {
    const loadMovies = async () => {
      const movies = await getTrending();
      console.log(movies);
    }
    loadMovies();
  }, []);

  return (
    <div>
      <h1>Test Database</h1>
    </div>
  );
};

export default App;